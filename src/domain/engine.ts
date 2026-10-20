import type {
  Visitor,
  ServerShift,
  Receipt,
  ServerBusySpan,
  SimulationResult,
} from './types.ts';

export function simulateQueue(
  visitors: Visitor[],
  shifts: ServerShift[],
  options: {
    arrivalHorizonMinute?: number;
    maxDrainMinute?: number;
    scheduleId?: string;
  } = {}
): SimulationResult {
  const scheduleId = options.scheduleId || 'schedule-run';
  const arrivalHorizon = options.arrivalHorizonMinute ?? Infinity;
  const maxDrain = options.maxDrainMinute ?? 1440; // 24 hours max

  // Filter visitors arriving within horizon and sort deterministically
  const activeVisitors = visitors
    .filter((v) => v.arrivalMinute <= arrivalHorizon)
    .sort((a, b) => {
      if (a.arrivalMinute !== b.arrivalMinute) return a.arrivalMinute - b.arrivalMinute;
      return a.id.localeCompare(b.id);
    });

  // Server tracking
  interface ServerStatus {
    serverId: string;
    serverName: string;
    onDuty: boolean;
    shiftStart: number;
    shiftEnd: number;
    busyUntil: number | null;
    currentVisitorId: string | null;
    totalOvertimeCharged: number;
  }

  const serverMap = new Map<string, ServerStatus>();
  for (const s of shifts) {
    serverMap.set(s.serverId, {
      serverId: s.serverId,
      serverName: s.serverName,
      onDuty: false,
      shiftStart: s.startMinute,
      shiftEnd: s.endMinute,
      busyUntil: null,
      currentVisitorId: null,
      totalOvertimeCharged: 0,
    });
  }

  const receiptsMap = new Map<string, Receipt>();
  for (const v of activeVisitors) {
    receiptsMap.set(v.id, {
      visitorId: v.id,
      assignedServer: null,
      startMinute: null,
      completionMinute: null,
      queueWaitMinutes: 0,
      status: 'unserved',
      overtimeMinutesCharged: 0,
      schedulingReason: 'Pending arrival',
    });
  }

  const waitingQueue: Visitor[] = [];
  const busySpans: ServerBusySpan[] = [];

  let nextVisitorIdx = 0;
  let currentTime = 0;

  // Discrete-event stepping loop
  while (currentTime <= maxDrain) {
    // -------------------------------------------------------------
    // PHASE 1: COMPLETIONS at currentTime
    // -------------------------------------------------------------
    for (const server of serverMap.values()) {
      if (server.busyUntil !== null && server.busyUntil === currentTime) {
        const vId = server.currentVisitorId!;
        const r = receiptsMap.get(vId)!;
        r.completionMinute = currentTime;
        r.status = 'completed';

        // Check if server completed after scheduled shiftEnd -> Overtime!
        if (currentTime > server.shiftEnd) {
          const overtime = currentTime - Math.max(server.shiftEnd, r.startMinute!);
          r.overtimeMinutesCharged = overtime;
          server.totalOvertimeCharged += overtime;
        }

        server.busyUntil = null;
        server.currentVisitorId = null;

        // If shift already ended while this job was running, go off duty now
        if (currentTime >= server.shiftEnd) {
          server.onDuty = false;
        }
      }
    }

    // -------------------------------------------------------------
    // PHASE 2: SHIFT ENDINGS at currentTime
    // -------------------------------------------------------------
    for (const server of serverMap.values()) {
      if (server.shiftEnd === currentTime) {
        // If server is idle (not currently in-flight), go off duty immediately
        if (server.busyUntil === null) {
          server.onDuty = false;
        }
        // If server is busy, it remains onDuty = true until completing in Phase 1
      }
    }

    // -------------------------------------------------------------
    // PHASE 3: SHIFT STARTS at currentTime
    // -------------------------------------------------------------
    for (const server of serverMap.values()) {
      if (server.shiftStart === currentTime && currentTime < server.shiftEnd) {
        server.onDuty = true;
      }
    }

    // -------------------------------------------------------------
    // PHASE 4: ARRIVALS at currentTime
    // -------------------------------------------------------------
    while (
      nextVisitorIdx < activeVisitors.length &&
      activeVisitors[nextVisitorIdx].arrivalMinute === currentTime
    ) {
      const v = activeVisitors[nextVisitorIdx];
      waitingQueue.push(v);
      receiptsMap.set(v.id, {
        visitorId: v.id,
        assignedServer: null,
        startMinute: null,
        completionMinute: null,
        queueWaitMinutes: 0,
        status: 'waiting',
        overtimeMinutesCharged: 0,
        schedulingReason: 'Enqueued in FIFO order',
      });
      nextVisitorIdx++;
    }

    // -------------------------------------------------------------
    // PHASE 5: DISPATCH at currentTime
    // Match longest-waiting visitor to available on-duty server with lowest ID
    // -------------------------------------------------------------
    while (waitingQueue.length > 0) {
      // Find all available on-duty servers
      const availableServers = Array.from(serverMap.values())
        .filter((s) => s.onDuty && s.busyUntil === null && currentTime < s.shiftEnd)
        .sort((a, b) => a.serverId.localeCompare(b.serverId));

      if (availableServers.length === 0) {
        break; // No servers available to take jobs right now
      }

      const assignedServer = availableServers[0];
      const visitor = waitingQueue.shift()!;
      const wait = currentTime - visitor.arrivalMinute;
      const comp = currentTime + visitor.serviceMinutes;

      assignedServer.busyUntil = comp;
      assignedServer.currentVisitorId = visitor.id;

      const r = receiptsMap.get(visitor.id)!;
      r.assignedServer = assignedServer.serverId;
      r.startMinute = currentTime;
      r.queueWaitMinutes = wait;
      r.status = 'in_service';
      r.schedulingReason = `Dispatched to ${assignedServer.serverName} at t=${currentTime} (waited ${wait}m)`;

      busySpans.push({
        serverId: assignedServer.serverId,
        visitorId: visitor.id,
        startMinute: currentTime,
        completionMinute: comp,
      });
    }

    // Check if simulation is completely drained
    const allVisitorsHandled = nextVisitorIdx >= activeVisitors.length && waitingQueue.length === 0;
    const allServersIdle = Array.from(serverMap.values()).every((s) => s.busyUntil === null);

    if (allVisitorsHandled && allServersIdle) {
      break;
    }

    // Advance to next discrete event time
    // Candidates: next arrival time, next server busy completion, next shift start/end
    let nextEventTime = currentTime + 1;
    const futureTimes: number[] = [];

    if (nextVisitorIdx < activeVisitors.length) {
      futureTimes.push(activeVisitors[nextVisitorIdx].arrivalMinute);
    }
    for (const s of serverMap.values()) {
      if (s.busyUntil !== null && s.busyUntil > currentTime) futureTimes.push(s.busyUntil);
      if (s.shiftStart > currentTime) futureTimes.push(s.shiftStart);
      if (s.shiftEnd > currentTime) futureTimes.push(s.shiftEnd);
    }

    if (futureTimes.length > 0) {
      const minFuture = Math.min(...futureTimes);
      nextEventTime = Math.max(currentTime + 1, minFuture);
    }

    currentTime = nextEventTime;
  }

  // Final summary statistics
  const receiptsList = activeVisitors.map((v) => receiptsMap.get(v.id)!);
  const completed = receiptsList.filter((r) => r.status === 'completed');
  const waits = completed.map((r) => r.queueWaitMinutes).sort((a, b) => a - b);

  const meanWait = waits.length > 0 ? waits.reduce((a, b) => a + b, 0) / waits.length : 0;
  const p95Idx = Math.floor(waits.length * 0.95);
  const p95Wait = waits.length > 0 ? waits[Math.min(p95Idx, waits.length - 1)] : 0;
  const maxWait = waits.length > 0 ? waits[waits.length - 1] : 0;

  let totalScheduledMinutes = 0;
  for (const s of shifts) {
    totalScheduledMinutes += Math.max(0, s.endMinute - s.startMinute);
  }

  let totalOvertimeMinutes = 0;
  for (const s of serverMap.values()) {
    totalOvertimeMinutes += s.totalOvertimeCharged;
  }

  const makespanMinute = currentTime;

  return {
    scheduleId,
    totalVisitors: activeVisitors.length,
    completedVisitors: completed.length,
    meanWaitMinutes: Math.round(meanWait * 100) / 100,
    p95WaitMinutes: Math.round(p95Wait * 100) / 100,
    maxWaitMinutes: maxWait,
    totalOvertimeMinutes,
    scheduledMinutes: totalScheduledMinutes,
    realizedLaborMinutes: totalScheduledMinutes + totalOvertimeMinutes,
    receipts: receiptsList,
    serverBusySpans: busySpans,
    makespanMinute,
  };
}

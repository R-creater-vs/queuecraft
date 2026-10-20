import type {
  SimulationResult,
  Visitor,
  VisitorTransfer,
  WaitTransferLedger,
  GroupTransferSummary,
} from './types.ts';

export function calculateWaitTransferLedger(
  baselineResult: SimulationResult,
  candidateResult: SimulationResult,
  visitors: Visitor[]
): WaitTransferLedger {
  const baseMap = new Map<string, number>();
  baselineResult.receipts.forEach((r) => {
    if (r.status === 'completed') baseMap.set(r.visitorId, r.queueWaitMinutes);
  });

  const candMap = new Map<string, number>();
  candidateResult.receipts.forEach((r) => {
    if (r.status === 'completed') candMap.set(r.visitorId, r.queueWaitMinutes);
  });

  const visitorMap = new Map<string, Visitor>();
  visitors.forEach((v) => visitorMap.set(v.id, v));

  const transfers: VisitorTransfer[] = [];
  let totalSaved = 0;
  let totalAdded = 0;
  let netChange = 0;
  let victimCount = 0;
  let maxExtraWait = 0;
  let maxSavedWait = 0;

  // Group accumulators
  const groupStats = new Map<
    string,
    { count: number; saved: number; added: number; net: number; victims: number }
  >();

  // Process matched visitors who completed in both schedules
  for (const v of visitors) {
    if (baseMap.has(v.id) && candMap.has(v.id)) {
      const wBase = baseMap.get(v.id)!;
      const wCand = candMap.get(v.id)!;
      const diff = wCand - wBase;
      const benefit = Math.max(0, -diff);
      const harm = Math.max(0, diff);

      totalSaved += benefit;
      totalAdded += harm;
      netChange += diff;

      if (harm > 0) {
        victimCount++;
        if (harm > maxExtraWait) maxExtraWait = harm;
      }
      if (benefit > maxSavedWait) maxSavedWait = benefit;

      transfers.push({
        visitorId: v.id,
        groupLabel: v.groupLabel,
        arrivalMinute: v.arrivalMinute,
        serviceMinutes: v.serviceMinutes,
        waitBaseline: wBase,
        waitCandidate: wCand,
        waitChange: diff,
        benefit,
        harm,
      });

      // Update group stats
      const g = groupStats.get(v.groupLabel) || {
        count: 0,
        saved: 0,
        added: 0,
        net: 0,
        victims: 0,
      };
      g.count++;
      g.saved += benefit;
      g.added += harm;
      g.net += diff;
      if (harm > 0) g.victims++;
      groupStats.set(v.groupLabel, g);
    }
  }

  const groupBreakdowns: GroupTransferSummary[] = Array.from(groupStats.entries()).map(
    ([groupLabel, g]) => ({
      groupLabel,
      visitorCount: g.count,
      totalSavedMinutes: g.saved,
      totalAddedMinutes: g.added,
      netChangeMinutes: g.net,
      victimCount: g.victims,
    })
  );

  const matchedCount = transfers.length;
  const victimRate = matchedCount > 0 ? victimCount / matchedCount : 0;
  // Verify exact mathematical conservation: sum(diff) === sum(harm) - sum(benefit)
  const conservationVerified = Math.abs(netChange - (totalAdded - totalSaved)) < 1e-6;

  return {
    baselineScheduleId: baselineResult.scheduleId,
    candidateScheduleId: candidateResult.scheduleId,
    totalMatchedVisitors: matchedCount,
    totalMinutesSaved: totalSaved,
    totalMinutesAdded: totalAdded,
    netChangeMinutes: netChange,
    victimCount,
    victimRate: Math.round(victimRate * 1000) / 1000,
    maxExtraWaitMinutes: maxExtraWait,
    maxSavedWaitMinutes: maxSavedWait,
    transfers,
    groupBreakdowns,
    conservationVerified,
  };
}

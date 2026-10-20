import test from 'node:test';
import assert from 'node:assert/strict';

import type { Visitor, ServerShift } from '../src/domain/types.ts';
import { simulateQueue } from '../src/domain/engine.ts';
import { calculateWaitTransferLedger } from '../src/domain/ledger.ts';
import { SCHEDULE_FAMILY, generateHelpdeskScenario } from '../src/domain/scenarios.ts';

// -------------------------------------------------------------
// CONTRACT 1: Canonical 3-Visitor Engine Fixture
// -------------------------------------------------------------
test('Contract 1: Canonical 3-Visitor Discrete-Event Engine Verification', () => {
  const visitors: Visitor[] = [
    { id: 'vis-a', arrivalMinute: 0, serviceMinutes: 4, groupLabel: 'morning_rush' },
    { id: 'vis-b', arrivalMinute: 1, serviceMinutes: 2, groupLabel: 'morning_rush' },
    { id: 'vis-c', arrivalMinute: 2, serviceMinutes: 1, groupLabel: 'morning_rush' },
  ];

  // Case 1: Single Always-On Server (starts [0, 4, 6], waits [0, 3, 4], completions [4, 6, 7])
  const singleServerShifts: ServerShift[] = [
    { serverId: 'srv-1', serverName: 'Server 1', startMinute: 0, endMinute: 20 },
  ];
  const res1 = simulateQueue(visitors, singleServerShifts);

  assert.equal(res1.completedVisitors, 3);
  const receipts1 = res1.receipts;
  assert.deepEqual(
    receipts1.map((r) => r.startMinute),
    [0, 4, 6],
    'Starts must be [0, 4, 6]'
  );
  assert.deepEqual(
    receipts1.map((r) => r.queueWaitMinutes),
    [0, 3, 4],
    'Waits must be [0, 3, 4]'
  );
  assert.deepEqual(
    receipts1.map((r) => r.completionMinute),
    [4, 6, 7],
    'Completions must be [4, 6, 7]'
  );

  // Case 2: Dual Always-On Servers (starts [0, 1, 3], waits [0, 0, 1], completions [4, 3, 4])
  const dualServerShifts: ServerShift[] = [
    { serverId: 'srv-1', serverName: 'Server 1', startMinute: 0, endMinute: 20 },
    { serverId: 'srv-2', serverName: 'Server 2', startMinute: 0, endMinute: 20 },
  ];
  const res2 = simulateQueue(visitors, dualServerShifts);

  assert.equal(res2.completedVisitors, 3);
  const receipts2 = res2.receipts;
  assert.deepEqual(
    receipts2.map((r) => r.startMinute),
    [0, 1, 3],
    'Starts must be [0, 1, 3]'
  );
  assert.deepEqual(
    receipts2.map((r) => r.queueWaitMinutes),
    [0, 0, 1],
    'Waits must be [0, 0, 1]'
  );
  assert.deepEqual(
    receipts2.map((r) => r.completionMinute),
    [4, 3, 4],
    'Completions must be [4, 3, 4]'
  );
});

// -------------------------------------------------------------
// CONTRACT 2: Event Ordering & Deterministic Tie-Breaking
// -------------------------------------------------------------
test('Contract 2: Same-Timestamp Event Ordering & Deterministic Tie-Breaking', () => {
  // Two visitors arrive at the exact same minute t=5
  const visitors: Visitor[] = [
    { id: 'vis-z', arrivalMinute: 5, serviceMinutes: 3, groupLabel: 'morning_rush' },
    { id: 'vis-a', arrivalMinute: 5, serviceMinutes: 2, groupLabel: 'morning_rush' },
  ];

  // Two servers become available at t=5
  const shifts: ServerShift[] = [
    { serverId: 'srv-2', serverName: 'Desk 2', startMinute: 5, endMinute: 30 },
    { serverId: 'srv-1', serverName: 'Desk 1', startMinute: 5, endMinute: 30 },
  ];

  const res = simulateQueue(visitors, shifts);

  // vis-a should be dispatched to srv-1 (lower ID for both visitor and server)
  const receiptA = res.receipts.find((r) => r.visitorId === 'vis-a')!;
  const receiptZ = res.receipts.find((r) => r.visitorId === 'vis-z')!;

  assert.equal(receiptA.assignedServer, 'srv-1', 'Alphabetically lowest visitor gets lowest server ID');
  assert.equal(receiptZ.assignedServer, 'srv-2');
  assert.equal(receiptA.startMinute, 5);
  assert.equal(receiptZ.startMinute, 5);
});

// -------------------------------------------------------------
// CONTRACT 3: Shift-End In-Flight Job Completion & Overtime Accounting
// -------------------------------------------------------------
test('Contract 3: Shift-End In-Flight Job Completion & Overtime Accounting', () => {
  // Visitor arrives at minute 50, requires 15 minutes of service (completes at 65)
  // Server shift ends at minute 60
  const visitors: Visitor[] = [
    { id: 'vis-overtime', arrivalMinute: 50, serviceMinutes: 15, groupLabel: 'morning_rush' },
    { id: 'vis-late', arrivalMinute: 55, serviceMinutes: 5, groupLabel: 'morning_rush' },
  ];

  const shifts: ServerShift[] = [
    { serverId: 'srv-1', serverName: 'Solo Server', startMinute: 0, endMinute: 60 },
  ];

  const res = simulateQueue(visitors, shifts);

  // 1. First visitor completes normally despite shift ending at 60
  const r1 = res.receipts.find((r) => r.visitorId === 'vis-overtime')!;
  assert.equal(r1.status, 'completed');
  assert.equal(r1.startMinute, 50);
  assert.equal(r1.completionMinute, 65);
  // Overtime charged = 65 - 60 = 5 minutes
  assert.equal(r1.overtimeMinutesCharged, 5);
  assert.equal(res.totalOvertimeMinutes, 5);
  assert.equal(res.scheduledMinutes, 60);
  assert.equal(res.realizedLaborMinutes, 65);

  // 2. Second visitor arrives at 55 while server is busy, and when server finishes at 65, server is off-duty
  // and cannot take vis-late!
  const r2 = res.receipts.find((r) => r.visitorId === 'vis-late')!;
  assert.equal(r2.status, 'waiting');
  assert.equal(r2.assignedServer, null);
});

// -------------------------------------------------------------
// CONTRACT 4: Matched Wait-Transfer Identity & Mathematical Conservation
// -------------------------------------------------------------
test('Contract 4: Matched Wait-Transfer Identity & Conservation of Waiting Time', () => {
  const visitors = generateHelpdeskScenario(42, 40);

  const schedA = SCHEDULE_FAMILY[0]; // Flat baseline
  const schedB = SCHEDULE_FAMILY[1]; // Morning heavy

  const resA = simulateQueue(visitors, schedA.shifts, { scheduleId: schedA.id });
  const resB = simulateQueue(visitors, schedB.shifts, { scheduleId: schedB.id });

  const ledger = calculateWaitTransferLedger(resA, resB, visitors);

  assert.equal(ledger.conservationVerified, true, 'Mathematical conservation must be strictly verified');
  // Identity: netChangeMinutes === totalMinutesAdded - totalMinutesSaved
  assert.equal(
    ledger.netChangeMinutes,
    ledger.totalMinutesAdded - ledger.totalMinutesSaved,
    'Net change must equal added minus saved'
  );
  assert.ok(ledger.totalMatchedVisitors > 0);
  assert.ok(ledger.victimCount >= 0);
  assert.ok(ledger.victimRate >= 0 && ledger.victimRate <= 1);
});

// -------------------------------------------------------------
// CONTRACT 5: Fixed-Budget Equal Scheduled Labor Verification
// -------------------------------------------------------------
test('Contract 5: Fixed-Budget Equal Scheduled Labor Verification', () => {
  const targetBudget = 720; // 12 staff-hours

  for (const sched of SCHEDULE_FAMILY) {
    let sumMinutes = 0;
    for (const shift of sched.shifts) {
      assert.ok(shift.endMinute > shift.startMinute, 'Shift duration must be strictly positive');
      sumMinutes += shift.endMinute - shift.startMinute;
    }
    assert.equal(
      sumMinutes,
      targetBudget,
      `Schedule ${sched.id} must have exactly ${targetBudget} scheduled minutes`
    );
    assert.equal(sched.totalScheduledMinutes, targetBudget);
  }
});

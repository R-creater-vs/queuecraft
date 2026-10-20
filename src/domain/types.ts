export interface Visitor {
  id: string;
  arrivalMinute: number;
  serviceMinutes: number;
  groupLabel: 'morning_rush' | 'midday_lull' | 'afternoon_rush' | 'evening_close';
}

export interface ServerShift {
  serverId: string;
  serverName: string;
  startMinute: number;
  endMinute: number;
}

export interface Schedule {
  id: string;
  name: string;
  description: string;
  shifts: ServerShift[];
  totalScheduledMinutes: number;
}

export interface Receipt {
  visitorId: string;
  assignedServer: string | null;
  startMinute: number | null;
  completionMinute: number | null;
  queueWaitMinutes: number;
  status: 'completed' | 'in_service' | 'waiting' | 'unserved';
  overtimeMinutesCharged: number;
  schedulingReason?: string;
}

export interface ServerBusySpan {
  serverId: string;
  visitorId: string;
  startMinute: number;
  completionMinute: number;
}

export interface SimulationResult {
  scheduleId: string;
  totalVisitors: number;
  completedVisitors: number;
  meanWaitMinutes: number;
  p95WaitMinutes: number;
  maxWaitMinutes: number;
  totalOvertimeMinutes: number;
  scheduledMinutes: number;
  realizedLaborMinutes: number;
  receipts: Receipt[];
  serverBusySpans: ServerBusySpan[];
  makespanMinute: number;
}

export interface VisitorTransfer {
  visitorId: string;
  groupLabel: string;
  arrivalMinute: number;
  serviceMinutes: number;
  waitBaseline: number;
  waitCandidate: number;
  waitChange: number; // waitCandidate - waitBaseline
  benefit: number;    // max(0, -waitChange)
  harm: number;       // max(0, waitChange)
}

export interface GroupTransferSummary {
  groupLabel: string;
  visitorCount: number;
  totalSavedMinutes: number;
  totalAddedMinutes: number;
  netChangeMinutes: number;
  victimCount: number;
}

export interface WaitTransferLedger {
  baselineScheduleId: string;
  candidateScheduleId: string;
  totalMatchedVisitors: number;
  totalMinutesSaved: number;
  totalMinutesAdded: number;
  netChangeMinutes: number;
  victimCount: number;
  victimRate: number; // fraction waiting longer
  maxExtraWaitMinutes: number;
  maxSavedWaitMinutes: number;
  transfers: VisitorTransfer[];
  groupBreakdowns: GroupTransferSummary[];
  conservationVerified: boolean;
}

export interface FrontierPoint {
  schedule: Schedule;
  meanWait: number;
  maxExtraWait: number;
  overtimeMinutes: number;
  victimRate: number;
  satisfies5MinConstraint: boolean;
}

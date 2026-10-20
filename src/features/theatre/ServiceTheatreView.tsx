import React, { useState } from 'react';
import { Visitor, SimulationResult, Schedule } from '../../domain/types';
import { Clock, CheckCircle2, User, ArrowRight, CornerDownRight, Server, AlertTriangle } from 'lucide-react';

interface ServiceTheatreViewProps {
  schedule: Schedule;
  simulationResult: SimulationResult;
  visitors: Visitor[];
  onNavigateToTransfer: () => void;
}

export const ServiceTheatreView: React.FC<ServiceTheatreViewProps> = ({
  schedule,
  simulationResult,
  visitors,
  onNavigateToTransfer,
}) => {
  const [selectedVisitorId, setSelectedVisitorId] = useState<string>(visitors[0]?.id || '');

  const selectedVisitor = visitors.find((v) => v.id === selectedVisitorId) || visitors[0];
  const selectedReceipt = simulationResult.receipts.find((r) => r.visitorId === selectedVisitor?.id);

  // Group busy spans by server
  const serverSpansMap = new Map<string, typeof simulationResult.serverBusySpans>();
  schedule.shifts.forEach((s) => serverSpansMap.set(s.serverId, []));
  simulationResult.serverBusySpans.forEach((span) => {
    const list = serverSpansMap.get(span.serverId) || [];
    list.push(span);
    serverSpansMap.set(span.serverId, list);
  });

  return (
    <div className="space-y-6">
      {/* Recruiter-Facing Moment Banner */}
      <div className="bg-gradient-to-r from-navy to-slate-900 text-white rounded-xl p-6 shadow-sm border border-navy-light">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-teal/30 text-teal-light border border-teal/40">
                Core Differentiator
              </span>
              <span className="text-xs text-stone-300 font-mono">
                Discrete-Event Time Rail · Matched Visitor Waiting-Time Ledger
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              “The average wait improved, but these visitors paid for that improvement. Follow the exact scheduling decisions.”
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed">
              Standard queue dashboards celebrate a lower aggregate mean wait time. But under a fixed staff-hour budget, shifting servers to peak rushes leaves other windows understaffed. Follow every individual visitor's arrival, queue wait, and dispatch on the time rail.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/15 min-w-[240px]">
            <div className="text-xs font-mono text-stone-300 uppercase tracking-wider">
              Simulation Metrics
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              Mean Wait: {simulationResult.meanWaitMinutes}m
            </div>
            <div className="text-xs font-mono text-stone-300 mt-1 flex justify-between">
              <span>P95 Wait:</span>
              <span className="font-bold">{simulationResult.p95WaitMinutes}m</span>
            </div>
            <div className="text-xs font-mono text-stone-300 mt-0.5 flex justify-between">
              <span>Overtime Charged:</span>
              <span className="font-bold text-copper-light">{simulationResult.totalOvertimeMinutes}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Service Theatre Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Server Gantt Timeline (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-bold text-navy text-sm">Server Busy Spans & Timeline (0m - 360m)</h3>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                {schedule.name} · {schedule.shifts.length} active desks
              </p>
            </div>
            <span className="text-xs font-mono text-stone-500">
              Total Served: <strong>{simulationResult.completedVisitors}</strong> / {simulationResult.totalVisitors}
            </span>
          </div>

          {/* Time markers header */}
          <div className="relative h-6 text-[10px] font-mono text-stone-400 border-b border-stone-100 flex justify-between px-1">
            <span>0m (9 AM)</span>
            <span>60m</span>
            <span>120m (11 AM)</span>
            <span>180m</span>
            <span>240m (1 PM)</span>
            <span>300m</span>
            <span>360m (3 PM)</span>
          </div>

          {/* Server Timelines */}
          <div className="space-y-4">
            {schedule.shifts.map((shift) => {
              const spans = serverSpansMap.get(shift.serverId) || [];

              return (
                <div key={shift.serverId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-navy flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-teal" />
                      {shift.serverName}
                    </span>
                    <span className="text-stone-500 text-[11px]">
                      Shift: {shift.startMinute}m – {shift.endMinute}m ({shift.endMinute - shift.startMinute}m scheduled)
                    </span>
                  </div>

                  {/* Shift Bar Track */}
                  <div className="h-9 bg-stone-100 rounded-lg relative overflow-hidden border border-stone-200">
                    {/* Shift scheduled window shading */}
                    <div
                      className="absolute top-0 bottom-0 bg-stone-200/50"
                      style={{
                        left: `${(shift.startMinute / 360) * 100}%`,
                        width: `${((shift.endMinute - shift.startMinute) / 360) * 100}%`,
                      }}
                    />

                    {/* Busy Spans */}
                    {spans.map((span) => {
                      const isSelected = span.visitorId === selectedVisitor?.id;
                      const leftPct = (span.startMinute / 360) * 100;
                      const widthPct = Math.max(1, ((span.completionMinute - span.startMinute) / 360) * 100);

                      return (
                        <div
                          key={span.visitorId}
                          onClick={() => setSelectedVisitorId(span.visitorId)}
                          title={`${span.visitorId}: served t=${span.startMinute} to ${span.completionMinute}m`}
                          className={`absolute top-1 bottom-1 rounded cursor-pointer transition-all flex items-center justify-center text-[10px] font-mono font-bold ${
                            isSelected
                              ? 'bg-copper text-white ring-2 ring-copper/50 z-20 shadow-sm'
                              : 'bg-teal text-white hover:bg-teal-dark z-10'
                          }`}
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        >
                          {widthPct > 4 ? span.visitorId.replace('vis-', '') : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-stone-600 pt-2 border-t border-stone-100">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal" /> In-Service
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-copper" /> Selected Visitor
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-stone-200" /> Scheduled On-Duty Window
            </span>
          </div>
        </div>

        {/* Right: Visitor Receipt Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-navy" />
                <h3 className="font-bold text-navy text-sm">Visitor Receipt Inspector</h3>
              </div>
              <span className="text-xs font-mono font-bold text-teal bg-teal-light px-2 py-0.5 rounded border border-teal/20">
                {selectedVisitor?.id}
              </span>
            </div>

            {/* Quick selector for visitors */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-stone-500 uppercase font-bold">
                Select Visitor to Trace:
              </label>
              <select
                value={selectedVisitorId}
                onChange={(e) => setSelectedVisitorId(e.target.value)}
                className="w-full text-xs font-mono bg-stone-50 border border-stone-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-teal"
              >
                {visitors.map((v) => {
                  const r = simulationResult.receipts.find((rec) => rec.visitorId === v.id);
                  return (
                    <option key={v.id} value={v.id}>
                      [{v.id}] Arr: {v.arrivalMinute}m · Wait: {r?.queueWaitMinutes ?? 0}m · {v.groupLabel}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Step Lifecycle Breakdown */}
            <div className="bg-stone-50 rounded-lg p-4 border border-stone-200 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Arrival Time:</span>
                <span className="font-bold text-navy">{selectedVisitor?.arrivalMinute} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Service Duration:</span>
                <span className="font-bold text-navy">{selectedVisitor?.serviceMinutes} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Assigned Server:</span>
                <span className="font-bold text-teal">{selectedReceipt?.assignedServer || 'None'}</span>
              </div>
              <div className="flex items-center justify-between border-t border-stone-200 pt-2">
                <span className="text-stone-500 font-bold">Queue Wait Time:</span>
                <span className={`font-bold text-sm ${
                  (selectedReceipt?.queueWaitMinutes || 0) > 10 ? 'text-copper' : 'text-navy'
                }`}>
                  {selectedReceipt?.queueWaitMinutes} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Completion Time:</span>
                <span className="font-bold text-navy">{selectedReceipt?.completionMinute} min</span>
              </div>
              {selectedReceipt?.overtimeMinutesCharged ? (
                <div className="flex items-center justify-between text-copper-dark bg-copper-light p-2 rounded border border-copper/30">
                  <span>Overtime Incurred:</span>
                  <span className="font-bold">+{selectedReceipt.overtimeMinutesCharged} min</span>
                </div>
              ) : null}
            </div>

            <div className="text-xs text-stone-600 leading-relaxed font-sans bg-paper p-3 rounded border border-stone-200">
              <strong>Scheduling Reason:</strong> {selectedReceipt?.schedulingReason}
            </div>
          </div>

          <button
            onClick={onNavigateToTransfer}
            className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-navy text-white text-xs font-mono font-bold hover:bg-navy-light transition-all shadow-2xs mt-4"
          >
            Compare in Wait-Transfer Ledger <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

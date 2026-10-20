import React from 'react';
import { Schedule, ServerShift } from '../../domain/types';
import { Calendar, AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface ScheduleBoardViewProps {
  schedule: Schedule;
  onUpdateShift: (serverId: string, start: number, end: number) => void;
}

export const ScheduleBoardView: React.FC<ScheduleBoardViewProps> = ({
  schedule,
  onUpdateShift,
}) => {
  const currentTotalScheduled = schedule.shifts.reduce(
    (sum, s) => sum + Math.max(0, s.endMinute - s.startMinute),
    0
  );

  const targetBudget = 720; // 12 staff-hours
  const budgetDelta = currentTotalScheduled - targetBudget;
  const isBudgetValid = budgetDelta === 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-navy text-white">
              Schedule Board
            </span>
            <span className="text-xs text-stone-500 font-mono">
              Fixed-Budget Staffing Constraints (720m)
            </span>
          </div>
          <h2 className="text-xl font-bold text-navy tracking-tight mt-1">
            Server Shift Allocation & Budget Meter
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Adjust desk shifts across the 6-hour service window (0m - 360m). Total scheduled minutes must equal 720m.
          </p>
        </div>

        {/* Budget Status Meter */}
        <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-lg border border-stone-200">
          <div className="text-right">
            <div className="text-[11px] font-mono text-stone-500 uppercase">Scheduled Budget</div>
            <div className="text-base font-bold font-mono text-navy">
              {currentTotalScheduled} / {targetBudget} mins
            </div>
          </div>
          {isBudgetValid ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-teal-light text-teal-dark border border-teal/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal" /> Budget Balanced
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-copper-light text-copper-dark border border-copper/30">
              <AlertTriangle className="w-3.5 h-3.5 text-copper" /> {budgetDelta > 0 ? `+${budgetDelta}m Over` : `${budgetDelta}m Under`}
            </span>
          )}
        </div>
      </div>

      {/* Shifts Card List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {schedule.shifts.map((shift) => {
          const duration = Math.max(0, shift.endMinute - shift.startMinute);

          return (
            <div
              key={shift.serverId}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h4 className="font-bold text-navy text-sm">{shift.serverName}</h4>
                  <span className="text-[11px] font-mono text-stone-400">ID: {shift.serverId}</span>
                </div>
                <span className="text-xs font-mono font-bold text-teal bg-teal-light px-2 py-0.5 rounded border border-teal/20">
                  {duration} mins ({duration / 60}h)
                </span>
              </div>

              {/* Slider for startMinute */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-stone-500">Shift Start:</span>
                  <span className="font-bold text-navy">{shift.startMinute}m (9:{String(shift.startMinute % 60).padStart(2, '0')})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="330"
                  step="30"
                  value={shift.startMinute}
                  onChange={(e) => onUpdateShift(shift.serverId, Number(e.target.value), Math.max(Number(e.target.value) + 30, shift.endMinute))}
                  className="w-full accent-teal cursor-pointer"
                />
              </div>

              {/* Slider for endMinute */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-stone-500">Shift End:</span>
                  <span className="font-bold text-navy">{shift.endMinute}m</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="360"
                  step="30"
                  value={shift.endMinute}
                  onChange={(e) => onUpdateShift(shift.serverId, Math.min(shift.startMinute, Number(e.target.value) - 30), Number(e.target.value))}
                  className="w-full accent-teal cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Informational Callout */}
      <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 text-xs text-stone-600 space-y-2 leading-relaxed">
        <div className="font-bold text-navy font-mono uppercase text-[11px]">
          Operational Policy: No Mid-Service Preemption
        </div>
        <p>
          If a visitor is dispatched to a server 3 minutes before that server's scheduled shift end, the server finishes the job without interruption. The extra minutes worked beyond the scheduled shift are charged as <strong>overtime</strong> and added to realized labor. Overtime is tracked separately to ensure schedules cannot masquerade as cost-equivalent by pushing work into unbudgeted overtime.
        </p>
      </div>
    </div>
  );
};

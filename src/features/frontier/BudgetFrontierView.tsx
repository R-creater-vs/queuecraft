import React from 'react';
import { FrontierPoint, Schedule } from '../../domain/types';
import { GitFork, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, Info } from 'lucide-react';

interface BudgetFrontierViewProps {
  frontierPoints: FrontierPoint[];
  selectedScheduleId: string;
  onSelectSchedule: (id: string) => void;
}

export const BudgetFrontierView: React.FC<BudgetFrontierViewProps> = ({
  frontierPoints,
  selectedScheduleId,
  onSelectSchedule,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-navy text-white">
                Budget Frontier
              </span>
              <span className="text-xs text-stone-500 font-mono">
                Multiobjective Tradeoff & Constraint Analysis
              </span>
            </div>
            <h2 className="text-xl font-bold text-navy tracking-tight">
              Average Wait vs. Maximum Extra Wait Frontier
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Every point on this frontier represents a candidate schedule with the exact same 720 scheduled staff-minutes. The goal is to find staffing arrangements that lower mean wait without causing catastrophic spikes for individual visitors.
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 min-w-[280px]">
            <div className="text-xs font-mono text-stone-500 uppercase font-bold">
              Constraint Filter
            </div>
            <div className="text-xs text-stone-700 mt-2 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Max Extra Wait &le; 5m:</span>
                <span className="font-bold text-teal">
                  {frontierPoints.filter((p) => p.satisfies5MinConstraint).length} / {frontierPoints.length} Passed
                </span>
              </div>
              <div className="flex justify-between">
                <span>Violated Constraint:</span>
                <span className="font-bold text-copper-dark">
                  {frontierPoints.filter((p) => !p.satisfies5MinConstraint).length} Schedules
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frontier Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {frontierPoints.map((pt) => {
          const isSelected = pt.schedule.id === selectedScheduleId;

          return (
            <div
              key={pt.schedule.id}
              onClick={() => onSelectSchedule(pt.schedule.id)}
              className={`cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'border-teal bg-teal-light/30 shadow-md ring-2 ring-teal/30'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-navy">{pt.schedule.id}</span>
                  {pt.satisfies5MinConstraint ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-light text-teal-dark border border-teal/20">
                      &le; 5m Max Wait
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-copper-light text-copper-dark border border-copper/30">
                      Violates 5m
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-navy text-sm mt-2">{pt.schedule.name}</h4>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                  {pt.schedule.description}
                </p>
              </div>

              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 font-mono text-xs space-y-1.5 pt-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Mean Wait:</span>
                  <span className="font-bold text-navy">{pt.meanWait.toFixed(2)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Max Extra Wait:</span>
                  <span className={`font-bold ${pt.maxExtraWait > 5 ? 'text-copper-dark' : 'text-teal-dark'}`}>
                    +{pt.maxExtraWait} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Victim Rate:</span>
                  <span className="font-bold text-stone-800">{(pt.victimRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Overtime:</span>
                  <span className="font-bold text-stone-700">{pt.overtimeMinutes} min</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodological Disclaimer */}
      <div className="bg-stone-900 text-white rounded-xl p-5 border border-stone-800 space-y-2">
        <div className="flex items-center gap-2 text-teal-light font-mono text-xs font-bold uppercase tracking-wider">
          <Info className="w-4 h-4 text-teal" /> Mathematical & Statistical Disclaimer
        </div>
        <p className="text-xs text-stone-300 leading-relaxed font-sans">
          Constraint satisfaction (e.g. 'no visitor waits more than 5 extra minutes') is an <strong>observed finite-scenario property</strong> verified across our synthetic campus demand seeds. It is <strong>not</strong> an asymptotic theoretical guarantee for future unobserved operational days with unexpected arrival surges.
        </p>
      </div>
    </div>
  );
};

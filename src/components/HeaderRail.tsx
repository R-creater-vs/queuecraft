import React from 'react';
import { Clock, Calendar, Users, GitFork, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Schedule, WaitTransferLedger } from '../domain/types';

interface HeaderRailProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  schedules: Schedule[];
  selectedScheduleId: string;
  onSelectSchedule: (id: string) => void;
  ledger: WaitTransferLedger;
}

export const HeaderRail: React.FC<HeaderRailProps> = ({
  activeTab,
  setActiveTab,
  schedules,
  selectedScheduleId,
  onSelectSchedule,
  ledger,
}) => {
  const navTabs = [
    { id: 'theatre', label: 'Service Theatre', icon: Clock },
    { id: 'transfer', label: 'Who Waited Longer?', icon: Users },
    { id: 'board', label: 'Schedule Board', icon: Calendar },
    { id: 'frontier', label: 'Budget Frontier', icon: GitFork },
    { id: 'notebook', label: 'Scenario Notebook', icon: BookOpen },
  ];

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-navy flex items-center justify-center text-white font-mono font-bold text-lg shadow-sm">
            QC
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold tracking-tight text-navy">QUEUECRAFT</h1>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-stone-100 text-stone-600 border border-stone-200">
                v1.0.0
              </span>
              {ledger.victimCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-copper-dark border border-copper/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-copper" />
                  {ledger.victimCount} Visitors Waited Longer (+{ledger.maxExtraWaitMinutes}m max)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-light text-teal-dark border border-teal/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                  Zero Losers (Strict Pareto Improvement)
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 font-sans">
              Matched Wait-Transfer Ledger · Fixed-Budget Discrete-Event Simulation (720m)
            </p>
          </div>
        </div>

        {/* Schedule Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider font-mono">
            Candidate:
          </label>
          <select
            value={selectedScheduleId}
            onChange={(e) => onSelectSchedule(e.target.value)}
            className="text-xs font-sans bg-stone-50 border border-stone-300 text-stone-800 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal font-medium max-w-xs"
          >
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <span className="text-[10px] font-mono bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded font-bold">
            Budget: 720m (12h)
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 border-t border-stone-100">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-teal text-teal-dark font-bold bg-teal-light/50'
                  : 'border-transparent text-stone-600 hover:text-navy hover:border-stone-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal' : 'text-stone-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

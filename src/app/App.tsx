import React, { useState, useMemo } from 'react';
import { HeaderRail } from '../components/HeaderRail';
import { ServiceTheatreView } from '../features/theatre/ServiceTheatreView';
import { WhoWaitedLonger } from '../features/transfer/WhoWaitedLonger';
import { ScheduleBoardView } from '../features/board/ScheduleBoardView';
import { BudgetFrontierView } from '../features/frontier/BudgetFrontierView';
import { ScenarioNotebookView } from '../features/notebook/ScenarioNotebookView';

import { simulateQueue } from '../domain/engine';
import { calculateWaitTransferLedger } from '../domain/ledger';
import { SCHEDULE_FAMILY, DEMO_SCENARIO } from '../domain/scenarios';
import { Schedule, FrontierPoint } from '../domain/types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('theatre');
  const [schedules, setSchedules] = useState<Schedule[]>(SCHEDULE_FAMILY);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('sched-morning-heavy');

  const baselineSchedule = schedules[0]; // Sched-flat-baseline
  const candidateSchedule = useMemo(
    () => schedules.find((s) => s.id === selectedScheduleId) || schedules[1],
    [schedules, selectedScheduleId]
  );

  // Simulate baseline
  const baselineResult = useMemo(
    () => simulateQueue(DEMO_SCENARIO, baselineSchedule.shifts, { scheduleId: baselineSchedule.id }),
    [baselineSchedule]
  );

  // Simulate candidate
  const candidateResult = useMemo(
    () => simulateQueue(DEMO_SCENARIO, candidateSchedule.shifts, { scheduleId: candidateSchedule.id }),
    [candidateSchedule]
  );

  // Compute Matched Wait-Transfer Ledger
  const ledger = useMemo(
    () => calculateWaitTransferLedger(baselineResult, candidateResult, DEMO_SCENARIO),
    [baselineResult, candidateResult]
  );

  // Compute Frontier points for all schedules
  const frontierPoints: FrontierPoint[] = useMemo(() => {
    return schedules.map((sched) => {
      const res = simulateQueue(DEMO_SCENARIO, sched.shifts, { scheduleId: sched.id });
      const led = calculateWaitTransferLedger(baselineResult, res, DEMO_SCENARIO);

      return {
        schedule: sched,
        meanWait: res.meanWaitMinutes,
        maxExtraWait: led.maxExtraWaitMinutes,
        overtimeMinutes: res.totalOvertimeMinutes,
        victimRate: led.victimRate,
        satisfies5MinConstraint: led.maxExtraWaitMinutes <= 5,
      };
    });
  }, [schedules, baselineResult]);

  // Handle shift update on candidate schedule
  const handleUpdateShift = (serverId: string, start: number, end: number) => {
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id !== candidateSchedule.id) return s;
        const updatedShifts = s.shifts.map((shift) =>
          shift.serverId === serverId ? { ...shift, startMinute: start, endMinute: end } : shift
        );
        const sum = updatedShifts.reduce((acc, sh) => acc + Math.max(0, sh.endMinute - sh.startMinute), 0);
        return {
          ...s,
          shifts: updatedShifts,
          totalScheduledMinutes: sum,
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans text-navy selection:bg-teal selection:text-white">
      {/* Top Header Rail */}
      <HeaderRail
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        schedules={schedules}
        selectedScheduleId={selectedScheduleId}
        onSelectSchedule={setSelectedScheduleId}
        ledger={ledger}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'theatre' && (
          <ServiceTheatreView
            schedule={candidateSchedule}
            simulationResult={candidateResult}
            visitors={DEMO_SCENARIO}
            onNavigateToTransfer={() => setActiveTab('transfer')}
          />
        )}

        {activeTab === 'transfer' && (
          <WhoWaitedLonger
            ledger={ledger}
            baselineSchedule={baselineSchedule}
            candidateSchedule={candidateSchedule}
          />
        )}

        {activeTab === 'board' && (
          <ScheduleBoardView
            schedule={candidateSchedule}
            onUpdateShift={handleUpdateShift}
          />
        )}

        {activeTab === 'frontier' && (
          <BudgetFrontierView
            frontierPoints={frontierPoints}
            selectedScheduleId={selectedScheduleId}
            onSelectSchedule={setSelectedScheduleId}
          />
        )}

        {activeTab === 'notebook' && (
          <ScenarioNotebookView
            ledger={ledger}
            simulationResult={candidateResult}
          />
        )}
      </main>

      {/* Status Footer */}
      <footer className="border-t border-stone-200 bg-white py-3 text-xs font-mono text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span>Discrete-Event Queue Engine Active</span>
            </span>
            <span>·</span>
            <span>Fixed Budget (720m) · Conservation Verified</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>Deterministic Math · MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

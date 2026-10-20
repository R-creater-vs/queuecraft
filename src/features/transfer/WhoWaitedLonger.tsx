import React, { useState } from 'react';
import { WaitTransferLedger, Schedule } from '../../domain/types';
import { Users, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, Info } from 'lucide-react';

interface WhoWaitedLongerProps {
  ledger: WaitTransferLedger;
  baselineSchedule: Schedule;
  candidateSchedule: Schedule;
}

export const WhoWaitedLonger: React.FC<WhoWaitedLongerProps> = ({
  ledger,
  baselineSchedule,
  candidateSchedule,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'victims' | 'beneficiaries'>('all');

  const filteredTransfers = ledger.transfers.filter((t) => {
    if (filterMode === 'victims') return t.harm > 0;
    if (filterMode === 'beneficiaries') return t.benefit > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-copper-light text-copper-dark border border-copper/30">
                Signature Contribution
              </span>
              <span className="text-xs text-stone-500 font-mono">
                Matched Visitor Waiting-Time Transfer Ledger
              </span>
            </div>
            <h2 className="text-xl font-bold text-navy tracking-tight">
              Who Paid for the Faster Queue?
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              When a candidate schedule improves the average wait time under an identical staff-hour budget (720m), it does not lift all boats. It shifts wait times between individuals. The transfer ledger below audits the exact gains and losses for every matched visitor.
            </p>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-4 gap-2.5 min-w-[420px]">
            <div className="bg-teal-light/60 p-3 rounded-lg border border-teal/20 text-center">
              <div className="text-[10px] font-mono text-teal-dark uppercase font-bold">Minutes Saved</div>
              <div className="text-xl font-bold font-mono text-teal-dark mt-0.5">
                -{ledger.totalMinutesSaved}m
              </div>
              <div className="text-[10px] text-teal-dark">Total benefit</div>
            </div>

            <div className="bg-copper-light/60 p-3 rounded-lg border border-copper/30 text-center">
              <div className="text-[10px] font-mono text-copper-dark uppercase font-bold">Minutes Added</div>
              <div className="text-xl font-bold font-mono text-copper-dark mt-0.5">
                +{ledger.totalMinutesAdded}m
              </div>
              <div className="text-[10px] text-copper-dark">Total harm</div>
            </div>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-center">
              <div className="text-[10px] font-mono text-stone-500 uppercase font-bold">Net Change</div>
              <div className={`text-xl font-bold font-mono mt-0.5 ${
                ledger.netChangeMinutes < 0 ? 'text-teal-dark' : 'text-copper-dark'
              }`}>
                {ledger.netChangeMinutes}m
              </div>
              <div className="text-[10px] text-stone-500">Across all visitors</div>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-300 text-center">
              <div className="text-[10px] font-mono text-amber-900 uppercase font-bold">Victim Rate</div>
              <div className="text-xl font-bold font-mono text-amber-950 mt-0.5">
                {(ledger.victimRate * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-amber-900 font-bold">
                {ledger.victimCount} of {ledger.totalMatchedVisitors}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conservation Identity Alert */}
      <div className="p-4 rounded-xl border border-teal/30 bg-teal-light/50 text-teal-dark flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal" />
          <span>
            <strong>Mathematical Conservation Verified:</strong> ∑(Δw) = {ledger.netChangeMinutes}m = ∑(Harm) [{ledger.totalMinutesAdded}m] − ∑(Benefit) [{ledger.totalMinutesSaved}m]
          </span>
        </div>
        <span className="font-bold text-[11px] bg-white px-2 py-0.5 rounded border border-teal/20">
          Max Extra Wait: +{ledger.maxExtraWaitMinutes}m
        </span>
      </div>

      {/* Group Breakdown Cards */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-navy text-sm">Arrival Wave Tradeoff Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ledger.groupBreakdowns.map((grp) => (
            <div key={grp.groupLabel} className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-navy capitalize">{grp.groupLabel.replace('_', ' ')}</span>
                <span className="text-stone-400">{grp.visitorCount} visitors</span>
              </div>
              <div className="text-xs font-mono space-y-1">
                <div className="flex justify-between text-teal-dark">
                  <span>Saved:</span>
                  <span className="font-bold">-{grp.totalSavedMinutes}m</span>
                </div>
                <div className="flex justify-between text-copper-dark">
                  <span>Added:</span>
                  <span className="font-bold">+{grp.totalAddedMinutes}m</span>
                </div>
                <div className="flex justify-between font-bold border-t border-stone-200 pt-1 text-navy">
                  <span>Net:</span>
                  <span>{grp.netChangeMinutes}m</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matched Transfers Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs space-y-3">
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-navy text-sm">Matched Visitor Wait Ledger ({ledger.transfers.length} Matched Pairs)</h3>
            <p className="text-xs text-stone-500 mt-0.5 font-mono">
              Baseline: {baselineSchedule.name} vs Candidate: {candidateSchedule.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 text-xs font-mono rounded border ${
                filterMode === 'all' ? 'bg-navy text-white' : 'bg-white text-stone-600'
              }`}
            >
              All ({ledger.transfers.length})
            </button>
            <button
              onClick={() => setFilterMode('victims')}
              className={`px-2.5 py-1 text-xs font-mono rounded border ${
                filterMode === 'victims' ? 'bg-copper text-white' : 'bg-white text-copper-dark'
              }`}
            >
              Waited Longer ({ledger.victimCount})
            </button>
            <button
              onClick={() => setFilterMode('beneficiaries')}
              className={`px-2.5 py-1 text-xs font-mono rounded border ${
                filterMode === 'beneficiaries' ? 'bg-teal text-white' : 'bg-white text-teal-dark'
              }`}
            >
              Waited Less ({ledger.transfers.filter((t) => t.benefit > 0).length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] tracking-wider sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Visitor</th>
                <th className="py-2.5 px-4">Arrival</th>
                <th className="py-2.5 px-4">Wave</th>
                <th className="py-2.5 px-4">Service</th>
                <th className="py-2.5 px-4">Wait (Baseline)</th>
                <th className="py-2.5 px-4">Wait (Candidate)</th>
                <th className="py-2.5 px-4">Wait Change (Δ)</th>
                <th className="py-2.5 px-4">Ledger Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {filteredTransfers.map((t) => {
                const isVictim = t.harm > 0;
                const isBeneficiary = t.benefit > 0;

                return (
                  <tr
                    key={t.visitorId}
                    className={`hover:bg-stone-50 ${
                      isVictim ? 'bg-copper-light/30' : isBeneficiary ? 'bg-teal-light/20' : ''
                    }`}
                  >
                    <td className="py-2 px-4 font-bold text-navy">{t.visitorId}</td>
                    <td className="py-2 px-4">{t.arrivalMinute}m</td>
                    <td className="py-2 px-4 capitalize text-stone-500">{t.groupLabel.replace('_', ' ')}</td>
                    <td className="py-2 px-4">{t.serviceMinutes}m</td>
                    <td className="py-2 px-4 font-semibold">{t.waitBaseline}m</td>
                    <td className="py-2 px-4 font-semibold">{t.waitCandidate}m</td>
                    <td className="py-2 px-4 font-bold">
                      {t.waitChange > 0 ? (
                        <span className="text-copper-dark">+{t.waitChange}m</span>
                      ) : t.waitChange < 0 ? (
                        <span className="text-teal-dark">{t.waitChange}m</span>
                      ) : (
                        <span className="text-stone-400">0m</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {isVictim ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-copper-light text-copper-dark border border-copper/30">
                          +{t.harm}m Extra Wait (Harm)
                        </span>
                      ) : isBeneficiary ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-light text-teal-dark border border-teal/30">
                          -{t.benefit}m Saved Wait (Benefit)
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[10px]">Unchanged</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recruiter Callout Note */}
      <div className="bg-stone-900 text-white rounded-xl p-5 border border-stone-800 space-y-2">
        <div className="flex items-center gap-2 text-teal-light font-mono text-xs font-bold uppercase tracking-wider">
          <Info className="w-4 h-4 text-teal" /> Operations Management Takeaway
        </div>
        <p className="text-xs text-stone-300 leading-relaxed font-sans">
          In queueing systems, the phrase 'improving average wait' is an arithmetic aggregate that masks distributional transfers. When a company changes employee shifts to lower average wait time, customers arriving during the thinned shifts endure severe delays. QUEUECRAFT provides the mathematical accounting to make those trade-offs transparent.
        </p>
      </div>
    </div>
  );
};

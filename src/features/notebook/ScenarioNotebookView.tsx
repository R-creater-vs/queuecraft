import React, { useState } from 'react';
import { BookOpen, Terminal, Download, Copy, Check, ShieldCheck, Database, Sliders } from 'lucide-react';
import { WaitTransferLedger, SimulationResult } from '../../domain/types';

interface ScenarioNotebookViewProps {
  ledger: WaitTransferLedger;
  simulationResult: SimulationResult;
}

export const ScenarioNotebookView: React.FC<ScenarioNotebookViewProps> = ({
  ledger,
  simulationResult,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadJSON = () => {
    const data = {
      exportTimestamp: new Date().toISOString(),
      simulationResult,
      ledger,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `queuecraft-ledger-${ledger.candidateScheduleId}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-navy text-white">
              Scenario Notebook
            </span>
            <span className="text-xs text-stone-500 font-mono">
              Simulation Specifications & Reproducibility Ledger
            </span>
          </div>
          <h2 className="text-xl font-bold text-navy tracking-tight mt-1">
            Mathematical Contracts & Reproducibility Suite
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Download simulation receipts, inspect CLI reproduction commands, and review prior art.
          </p>
        </div>

        <button
          onClick={handleDownloadJSON}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white font-mono text-xs font-bold hover:bg-navy-light transition-all shadow-2xs"
        >
          <Download className="w-4 h-4" /> Download Full Ledger JSON
        </button>
      </div>

      {/* Grid: CLI Commands Left, Specifications Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CLI Reproduction Commands */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Terminal className="w-4 h-4 text-stone-700" />
            <h3 className="font-bold text-navy text-sm">Deterministic CLI Reproduction</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="text-[11px] text-stone-500 mb-1 font-sans">
                Run 5/5 Discrete-Event Simulation Contract Tests (124 ms):
              </div>
              <div className="bg-stone-900 text-stone-100 p-3 rounded-lg flex items-center justify-between">
                <code>npm test</code>
                <button
                  onClick={() => copyToClipboard('npm test', 'cmd1')}
                  className="text-stone-400 hover:text-white"
                >
                  {copiedCmd === 'cmd1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-stone-500 mb-1 font-sans">
                Run Monte Carlo Multi-Scenario Benchmark (10,000 visitors, 50 seeds):
              </div>
              <div className="bg-stone-900 text-stone-100 p-3 rounded-lg flex items-center justify-between">
                <code>npm run benchmark</code>
                <button
                  onClick={() => copyToClipboard('npm run benchmark', 'cmd2')}
                  className="text-stone-400 hover:text-white"
                >
                  {copiedCmd === 'cmd2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-stone-500 mb-1 font-sans">
                Inspect Benchmark Output Report:
              </div>
              <div className="bg-stone-900 text-stone-100 p-3 rounded-lg flex items-center justify-between">
                <code>cat public/reports/benchmark-results.json</code>
                <button
                  onClick={() => copyToClipboard('cat public/reports/benchmark-results.json', 'cmd3')}
                  className="text-stone-400 hover:text-white"
                >
                  {copiedCmd === 'cmd3' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Core Mathematical Formulation */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Sliders className="w-4 h-4 text-stone-700" />
            <h3 className="font-bold text-navy text-sm">Simulation Physics & Ordering Phases</h3>
          </div>

          <div className="bg-stone-50 rounded-lg p-4 border border-stone-200 font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500">Phase 1:</span>
              <span className="font-bold text-navy">Completions & Overtime Tally</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Phase 2:</span>
              <span className="font-bold text-navy">Shift End Transitions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Phase 3:</span>
              <span className="font-bold text-navy">Shift Start On-Duty Activation</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Phase 4:</span>
              <span className="font-bold text-navy">Arrivals (FIFO Queue Enqueue)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Phase 5:</span>
              <span className="font-bold text-navy">Greedy Dispatch (Lowest Server ID)</span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2 text-teal-dark font-bold">
              <span>Conservation Identity:</span>
              <span>∑(Δw) = ∑(Harm) − ∑(Benefit)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prior Art Attribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-navy text-sm">
            <Database className="w-4 h-4 text-teal" />
            <span>Prior Art Attribution</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            Attribution is given to <strong>SimPy</strong> (standard discrete-event simulation engine in Python), <strong>TableFlow</strong> (restaurant table turn operations), and Common Random Numbers (CRN) variance reduction methodology.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-navy text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Civic Modeling Boundaries</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            The dataset models an <strong>explicitly synthetic</strong> campus IT helpdesk queue. Zero real student data or personal information is used. Group classifications represent arrival waves (morning rush, midday lull, afternoon rush), not personal demographics.
          </p>
        </div>
      </div>
    </div>
  );
};

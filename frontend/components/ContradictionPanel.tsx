import React, { useState } from 'react';
import { Contradiction } from '../lib/api';
import { AlertTriangle, ShieldAlert, ArrowRight, Sparkles, CheckCircle, Scale, ExternalLink } from 'lucide-react';

interface ContradictionPanelProps {
  contradictions: Contradiction[];
  selectedSectionNumber: string | null;
  onSelectSection: (sectionNumber: string) => void;
  onOpenDiffModal?: (cntr: Contradiction) => void;
}

export const ContradictionPanel: React.FC<ContradictionPanelProps> = ({
  contradictions,
  selectedSectionNumber,
  onSelectSection,
  onOpenDiffModal
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filtered = contradictions.filter((c) => {
    if (severityFilter === 'ALL') return true;
    return c.severity === severityFilter;
  });

  return (
    <div className="h-full flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide">Explainable Risk Report</h2>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60">
            {filtered.length} Conflicts
          </span>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center space-x-1.5 text-[11px]">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                severityFilter === sev
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev === 'ALL' ? 'All Risks' : `${sev}`}
            </button>
          ))}
        </div>
      </div>

      {/* Contradiction Cards Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No contradictions detected for this filter.
          </div>
        ) : (
          filtered.map((cntr) => {
            const isRelevant =
              selectedSectionNumber === cntr.source_section ||
              selectedSectionNumber === cntr.target_section;

            const isHigh = cntr.severity === 'HIGH';

            return (
              <div
                key={cntr.id}
                className={`p-4 rounded-xl border transition-all space-y-3 relative group ${
                  isRelevant
                    ? 'bg-slate-850 border-rose-500 shadow-xl shadow-rose-950/40 ring-1 ring-rose-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Badge & Severity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${
                        isHigh
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {cntr.severity} SEVERITY
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Confidence: {Math.round(cntr.confidence_score * 100)}%
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-cyan-400">
                    {cntr.category}
                  </span>
                </div>

                {/* Source vs Target Comparison Cards */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Source Clause */}
                  <div
                    onClick={() => onSelectSection(cntr.source_section)}
                    className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors"
                  >
                    <span className="font-mono font-bold text-cyan-400 block text-[11px] mb-1">
                      {cntr.source_section}
                    </span>
                    <span className="text-slate-300 font-semibold block text-[11px] truncate mb-1">
                      {cntr.source_clause_title}
                    </span>
                    <div className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {cntr.source_value}
                    </div>
                  </div>

                  {/* Target Clause */}
                  <div
                    onClick={() => onSelectSection(cntr.target_section)}
                    className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors"
                  >
                    <span className="font-mono font-bold text-cyan-400 block text-[11px] mb-1">
                      {cntr.target_section}
                    </span>
                    <span className="text-slate-300 font-semibold block text-[11px] truncate mb-1">
                      {cntr.target_clause_title}
                    </span>
                    <div className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {cntr.target_value}
                    </div>
                  </div>
                </div>

                {/* Natural Language Explanation */}
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-400 font-medium mb-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Legal Conflict Analysis</span>
                  </div>
                  <p className="text-slate-300">{cntr.explanation}</p>
                </div>

                {/* Suggested Action & Resolution */}
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/50 text-xs space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Recommended Amendment</span>
                  </div>
                  <p className="text-cyan-200/90 leading-normal">{cntr.suggested_action}</p>
                </div>

                {/* Action button */}
                {onOpenDiffModal && (
                  <button
                    onClick={() => onOpenDiffModal(cntr)}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center space-x-1.5 border border-slate-700 transition-all"
                  >
                    <span>View Side-by-Side Clause Comparison</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

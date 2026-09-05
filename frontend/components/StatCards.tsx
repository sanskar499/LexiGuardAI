import React from 'react';
import { AlertTriangle, Network, ShieldCheck, FileSearch } from 'lucide-react';

interface StatCardsProps {
  totalClauses?: number;
  totalCrossRefs?: number;
  totalContradictions?: number;
  highRiskCount?: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalClauses = 12,
  totalCrossRefs = 5,
  totalContradictions = 5,
  highRiskCount = 4
}) => {
  const stats = [
    {
      title: 'Extracted Clauses',
      value: totalClauses,
      sub: 'Parsed & Segmented',
      icon: FileSearch,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20',
      bg: 'bg-cyan-950/30'
    },
    {
      title: 'Cross-References',
      value: totalCrossRefs,
      sub: 'Explicit & Implicit Links',
      icon: Network,
      color: 'text-blue-400',
      border: 'border-blue-500/20',
      bg: 'bg-blue-950/30'
    },
    {
      title: 'Contradictions Flagged',
      value: totalContradictions,
      sub: 'Conflicting Obligations',
      icon: AlertTriangle,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'bg-amber-950/30'
    },
    {
      title: 'High Severity Risks',
      value: highRiskCount,
      sub: 'Litigation Vulnerabilities',
      icon: ShieldCheck,
      color: 'text-rose-400',
      border: 'border-rose-500/20',
      bg: 'bg-rose-950/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-xl bg-slate-900/90 border ${item.border} backdrop-blur-sm flex items-center justify-between shadow-lg shadow-black/40 hover:border-slate-700 transition-colors`}
          >
            <div>
              <p className="text-xs text-slate-400 font-medium">{item.title}</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-white tracking-tight">{item.value}</span>
                <span className="text-[11px] text-slate-400 font-normal">{item.sub}</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${item.bg} ${item.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

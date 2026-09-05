import React from 'react';
import { Contradiction } from '../lib/api';
import { X, Scale, AlertTriangle, CheckCircle, Copy } from 'lucide-react';

interface ClauseDiffModalProps {
  contradiction: Contradiction | null;
  onClose: () => void;
}

export const ClauseDiffModal: React.FC<ClauseDiffModalProps> = ({ contradiction, onClose }) => {
  if (!contradiction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Side-by-Side Clause Comparison</h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {contradiction.severity} SEVERITY
                </span>
              </div>
              <p className="text-xs text-slate-400">Category: {contradiction.category}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          
          {/* Mismatch Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Source Clause */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono font-bold text-cyan-400 text-sm">{contradiction.source_section}</span>
                <span className="text-xs font-semibold text-slate-200">{contradiction.source_clause_title}</span>
              </div>
              
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/50 text-xs flex items-center justify-between">
                <span className="text-slate-400">Extracted Parameter:</span>
                <span className="font-bold text-rose-300 font-mono">{contradiction.source_value}</span>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                {contradiction.source_text}
              </div>
            </div>

            {/* Target Clause */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono font-bold text-cyan-400 text-sm">{contradiction.target_section}</span>
                <span className="text-xs font-semibold text-slate-200">{contradiction.target_clause_title}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/50 text-xs flex items-center justify-between">
                <span className="text-slate-400">Extracted Parameter:</span>
                <span className="font-bold text-rose-300 font-mono">{contradiction.target_value}</span>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                {contradiction.target_text}
              </div>
            </div>

          </div>

          {/* Legal Impact Explanation */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Contradiction Analysis & Legal Exposure</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{contradiction.explanation}</p>
          </div>

          {/* Remediation Action */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>Suggested Resolution Action</span>
              </div>
              <span className="text-[10px] text-cyan-300/70 font-mono">Confidence: {Math.round(contradiction.confidence_score * 100)}%</span>
            </div>
            <p className="text-xs text-cyan-200 leading-relaxed">{contradiction.suggested_action}</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};

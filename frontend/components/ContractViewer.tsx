import React, { useState } from 'react';
import { Clause } from '../lib/api';
import { Search, AlertCircle, Bookmark, CheckCircle2, ChevronRight } from 'lucide-react';

interface ContractViewerProps {
  clauses: Clause[];
  selectedSectionNumber: string | null;
  onSelectSection: (sectionNumber: string) => void;
}

export const ContractViewer: React.FC<ContractViewerProps> = ({
  clauses,
  selectedSectionNumber,
  onSelectSection
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Payment Terms', 'Termination & Notice', 'Limitation of Liability', 'Intellectual Property', 'Governing Law & Dispute Resolution'];

  const filteredClauses = clauses.filter((c) => {
    const matchesSearch =
      c.section_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.text.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || c.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      
      {/* Header & Controls */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide">Contract Clauses</h2>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {filteredClauses.length} Sections
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search clause text, section, title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Clauses' : cat.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Clauses Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredClauses.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No matching clauses found.
          </div>
        ) : (
          filteredClauses.map((clause) => {
            const isSelected = selectedSectionNumber === clause.section_number;
            const hasConflict = clause.has_contradiction;

            return (
              <div
                key={clause.id || clause.section_number}
                onClick={() => onSelectSection(clause.section_number)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                    : hasConflict
                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/70'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Clause Header */}
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        hasConflict
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-cyan-400'
                      }`}
                    >
                      {clause.section_number}
                    </span>
                    <h3 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {clause.title}
                    </h3>
                  </div>

                  {hasConflict ? (
                    <div className="flex items-center space-x-1 text-rose-400 text-[10px] font-semibold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/50 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      <span>Conflict</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-slate-600" />
                      <span>Valid</span>
                    </div>
                  )}
                </div>

                {/* Category Badge */}
                <span className="inline-block text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800/80 mb-2">
                  {clause.category}
                </span>

                {/* Clause Text Snippet */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-4 select-text">
                  {clause.text}
                </p>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute right-2 bottom-2 text-cyan-400">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

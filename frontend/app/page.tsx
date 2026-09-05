'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { StatCards } from '../components/StatCards';
import { UploadModal } from '../components/UploadModal';
import { fetchContracts, loadSampleContract, ContractSummary } from '../lib/api';
import { FileText, ShieldAlert, Sparkles, Upload, ArrowRight, Clock, AlertTriangle, CheckCircle2, ChevronRight, Scale } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchContracts();
    setContracts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLoadSample = async () => {
    setIsLoading(true);
    const result = await loadSampleContract();
    router.push(`/analysis/${result.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060913]">
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} onLoadSample={handleLoadSample} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Hero Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-8 overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-0"></div>
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hackathon Solution • HF3-SW-11 Legal Tech</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Cross-Reference <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Contradiction Detection</span> Engine
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              LexiGuard AI parses complex legal contracts (PDF, DOCX, TXT), maps inter-clause cross-references, extracts parameter obligations, and identifies contradictory terms with explainable risk reports.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleLoadSample}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 flex items-center space-x-2 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Launch Interactive Demo Contract</span>
              </button>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition-all"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload Custom Contract</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Statistics */}
        <StatCards
          totalClauses={contracts.reduce((acc, c) => acc + (c.clause_count || 0), 0) || 12}
          totalCrossRefs={contracts.reduce((acc, c) => acc + (c.cross_ref_count || 0), 0) || 5}
          totalContradictions={contracts.reduce((acc, c) => acc + (c.contradiction_count || 0), 0) || 5}
          highRiskCount={contracts.reduce((acc, c) => acc + (c.high_risk_count || 0), 0) || 4}
        />

        {/* Recent Contract Analyses Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Recent Contract Audits</h2>
                <p className="text-xs text-slate-400">Select any contract to launch 3-column contradiction studio</p>
              </div>
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <span>+ New Audit</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {contracts.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No contracts analyzed yet.</p>
                <button
                  onClick={handleLoadSample}
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold"
                >
                  Load Demo Contract
                </button>
              </div>
            ) : (
              contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="p-5 hover:bg-slate-850/60 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                      {contract.file_type.toUpperCase()}
                    </div>
                    <div>
                      <Link
                        href={`/analysis/${contract.id}`}
                        className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors flex items-center space-x-2"
                      >
                        <span>{contract.title}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </Link>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(contract.upload_date).toLocaleDateString()}</span>
                        </span>
                        <span>•</span>
                        <span>{contract.clause_count} Clauses</span>
                        <span>•</span>
                        <span>{contract.cross_ref_count} Cross-Refs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {contract.contradiction_count > 0 ? (
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>{contract.contradiction_count} Conflicts Flagged</span>
                        </span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-xs font-semibold flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Consistent</span>
                      </span>
                    )}

                    <Link
                      href={`/analysis/${contract.id}`}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                    >
                      Open Studio
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(id) => router.push(`/analysis/${id}`)}
      />
    </div>
  );
}

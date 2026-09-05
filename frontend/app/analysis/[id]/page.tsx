'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../../components/Navbar';
import { ContractViewer } from '../../../components/ContractViewer';
import { NetworkGraph } from '../../../components/NetworkGraph';
import { ContradictionPanel } from '../../../components/ContradictionPanel';
import { ClauseDiffModal } from '../../../components/ClauseDiffModal';
import { UploadModal } from '../../../components/UploadModal';
import { fetchContractDetail, loadSampleContract, ContractDetail, Contradiction } from '../../../lib/api';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ContractAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = (params?.id as string) || 'demo-sample-msa';

  const [contractDetail, setContractDetail] = useState<ContractDetail | null>(null);
  const [selectedSectionNumber, setSelectedSectionNumber] = useState<string | null>(null);
  const [activeDiffContradiction, setActiveDiffContradiction] = useState<Contradiction | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (id: string) => {
    setIsLoading(true);
    const data = await fetchContractDetail(id);
    setContractDetail(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (contractId) {
      loadData(contractId);
    }
  }, [contractId]);

  const handleLoadSample = async () => {
    setIsLoading(true);
    const result = await loadSampleContract();
    router.push(`/analysis/${result.id}`);
  };

  if (isLoading || !contractDetail) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col justify-center items-center space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Analyzing contract cross-references & clauses...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#060913] overflow-hidden">
      
      {/* Top Navbar */}
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadSample={handleLoadSample}
        activeContractTitle={contractDetail.title}
      />

      {/* Action Sub-Header */}
      <div className="px-6 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="font-semibold">{contractDetail.title}</span>
            <span className="text-slate-500">({contractDetail.filename})</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-slate-400 font-mono">
            {contractDetail.clause_count} Clauses • {contractDetail.cross_ref_count} References
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-mono font-bold">
            {contractDetail.contradiction_count} Risk Alerts
          </span>
        </div>
      </div>

      {/* Main 3-Column Studio Workspace */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* Left Column: Contract Viewer (4 cols) */}
        <div className="lg:col-span-4 h-full min-h-0">
          <ContractViewer
            clauses={contractDetail.clauses}
            selectedSectionNumber={selectedSectionNumber}
            onSelectSection={(secNum) => setSelectedSectionNumber(secNum)}
          />
        </div>

        {/* Center Column: Cross-Reference Graph (4 cols) */}
        <div className="lg:col-span-4 h-full min-h-0">
          <NetworkGraph
            clauses={contractDetail.clauses}
            crossRefs={contractDetail.cross_references}
            contradictions={contractDetail.contradictions}
            selectedSectionNumber={selectedSectionNumber}
            onSelectSection={(secNum) => setSelectedSectionNumber(secNum)}
          />
        </div>

        {/* Right Column: Contradiction & Explainability Risk Report (4 cols) */}
        <div className="lg:col-span-4 h-full min-h-0">
          <ContradictionPanel
            contradictions={contractDetail.contradictions}
            selectedSectionNumber={selectedSectionNumber}
            onSelectSection={(secNum) => setSelectedSectionNumber(secNum)}
            onOpenDiffModal={(cntr) => setActiveDiffContradiction(cntr)}
          />
        </div>

      </div>

      {/* Modals */}
      <ClauseDiffModal
        contradiction={activeDiffContradiction}
        onClose={() => setActiveDiffContradiction(null)}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(id) => router.push(`/analysis/${id}`)}
      />

    </div>
  );
}

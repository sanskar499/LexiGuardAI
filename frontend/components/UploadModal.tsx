import React, { useState } from 'react';
import { uploadContractFile, loadSampleContract } from '../lib/api';
import { Upload, FileText, X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (contractId: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'FILE' | 'TEXT'>('FILE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (activeTab === 'FILE') {
        if (!selectedFile) {
          throw new Error('Please select a PDF, DOCX, or TXT contract file.');
        }
        formData.append('file', selectedFile);
        if (customTitle) formData.append('title', customTitle);
      } else {
        if (!pastedText.trim()) {
          throw new Error('Please enter contract text to analyze.');
        }
        formData.append('raw_text', pastedText);
        formData.append('title', customTitle || 'Pasted Custom Legal Contract');
      }


      const result = await uploadContractFile(formData);
      setIsLoading(false);
      onSuccess(result.id);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Error uploading contract file.');
    }
  };

  const handleLoadDemo = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await loadSampleContract();
      setIsLoading(false);
      onSuccess(result.id);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg('Error loading sample contract.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload Contract Document</h2>
              <p className="text-xs text-slate-400">PDF, DOCX, or Plain Text format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 pt-3">
          <button
            onClick={() => setActiveTab('FILE')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'FILE'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload File (PDF/DOCX/TXT)
          </button>
          <button
            onClick={() => setActiveTab('TEXT')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'TEXT'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste Contract Text
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Contract Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Master Services Agreement v2.4"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {activeTab === 'FILE' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Contract File
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 text-center bg-slate-950/50 cursor-pointer transition-colors relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs text-slate-300 font-medium">
                  {selectedFile ? selectedFile.name : 'Click or Drag & Drop Contract File Here'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Supports PDF, DOCX, and TXT files up to 25MB</p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Raw Contract Text
              </label>
              <textarea
                rows={6}
                placeholder="Paste contract sections, clauses, and cross-references here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleLoadDemo}
              disabled={isLoading}
              className="flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Or Load Hackathon Demo MSA</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 flex items-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Contract...</span>
                  </>
                ) : (
                  <span>Start Contradiction Analysis</span>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

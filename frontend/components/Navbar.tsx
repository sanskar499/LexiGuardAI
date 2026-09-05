import React from 'react';
import { ShieldAlert, FileText, Upload, Sparkles, Home, Cpu } from 'lucide-react';

interface NavbarProps {
  onOpenUpload?: () => void;
  onLoadSample?: () => void;
  activeContractTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUpload, onLoadSample, activeContractTitle }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-4">
          <a href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">LexiGuard<span className="text-cyan-400">AI</span></span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 font-mono">
                  HF3-SW-11 LegalTech
                </span>
              </div>
              <p className="text-xs text-slate-400">Cross-Reference Contradiction Engine</p>
            </div>
          </a>

          {activeContractTitle && (
            <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800 text-xs text-slate-300">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="font-medium text-slate-200 truncate max-w-xs">{activeContractTitle}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {onLoadSample && (
            <button
              onClick={onLoadSample}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50 text-xs font-medium transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Load Hackathon Demo</span>
            </button>
          )}

          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Contract</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

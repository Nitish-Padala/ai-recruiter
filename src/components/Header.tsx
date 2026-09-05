import React from 'react';
import { Sparkles, Lock, RotateCcw, Users, ShieldCheck } from 'lucide-react';
import { AppStateStatus } from '../types';

interface HeaderProps {
  status: AppStateStatus;
  candidateCount: number;
  totalPoolCount: number;
  refinementCount: number;
  onFreeze: () => void;
  onRestart: () => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  candidateCount,
  totalPoolCount,
  refinementCount,
  onFreeze,
  onRestart,
  isProcessing,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                AI Recruiter
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Sourcing Loop
              </span>
              {status === 'frozen' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Frozen Shortlist
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Continuous candidate sourcing & rubric refinement
            </p>
          </div>
        </div>

        {/* Metrics and Actions */}
        <div className="flex items-center gap-3">
          {totalPoolCount > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Pool: <strong className="text-slate-800">{totalPoolCount}</strong> profiles
              </span>
              {candidateCount > 0 && status !== 'initial' && (
                <span className="text-slate-400">| Matches: <strong className="text-indigo-600">{candidateCount}</strong></span>
              )}
              {refinementCount > 0 && (
                <span className="text-slate-400">| Loop: <strong className="text-amber-600">#{refinementCount}</strong></span>
              )}
            </div>
          )}

          {status !== 'initial' && status !== 'frozen' && (
            <button
              id="freeze-search-btn"
              onClick={onFreeze}
              disabled={isProcessing || candidateCount === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Freeze the search and generate final candidate shortlist"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Freeze Search</span>
            </button>
          )}

          {status !== 'initial' && (
            <button
              id="restart-search-btn"
              onClick={onRestart}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Start a new search"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Search</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

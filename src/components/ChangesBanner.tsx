import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, History, Info } from 'lucide-react';
import { ChangeExplanation } from '../types';

interface ChangesBannerProps {
  loopNumber: number;
  changes: ChangeExplanation[];
  summary: string;
  recruiterFeedback?: string;
}

export const ChangesBanner: React.FC<ChangesBannerProps> = ({
  loopNumber,
  changes,
  summary,
  recruiterFeedback,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!changes || changes.length === 0) {
    return null;
  }

  const formatValue = (val: any) => {
    if (val === undefined || val === null) return 'none';
    if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : 'any';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-amber-950">
                Refinement Loop #{loopNumber} Adjustments
              </h4>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                {changes.length} {changes.length === 1 ? 'change' : 'changes'} applied
              </span>
            </div>
            <p className="text-xs text-amber-900 mt-0.5 font-medium leading-relaxed">
              {summary}
            </p>
            {recruiterFeedback && (
              <p className="text-[11px] text-amber-800 italic mt-1 bg-amber-100/60 px-2.5 py-1 rounded-md border border-amber-200/50">
                &ldquo;{recruiterFeedback}&rdquo;
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-amber-800 hover:text-amber-950 p-1 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>{isExpanded ? 'Hide Details' : 'View Changes'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-amber-200/70 space-y-2.5">
          <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>Exact Changes &amp; Justification:</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-1">
            {changes.map((change, idx) => (
              <div
                key={idx}
                className="bg-white/90 rounded-lg p-3 border border-amber-200 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                  <span className="font-bold text-slate-900 capitalize">
                    {change.field.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 line-through">
                      {formatValue(change.oldValue)}
                    </span>
                    <ArrowRight className="w-3 h-3 text-amber-600" />
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {formatValue(change.newValue)}
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {change.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

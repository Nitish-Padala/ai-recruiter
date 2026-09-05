import React, { useState } from 'react';
import { MessageSquarePlus, Sparkles, Send, Lightbulb, RefreshCw } from 'lucide-react';
import { RankedCandidate } from '../types';

interface RefinementBarProps {
  onRefine: (feedbackText: string) => void;
  isProcessing: boolean;
  candidates: RankedCandidate[];
  loopNumber: number;
}

const REFINEMENT_SUGGESTIONS = [
  'Candidate 1 is too junior, candidates 2 and 4 are good matches.',
  'Need at least 5+ years of experience with heavy AWS RDS tuning.',
  'Prioritize fast-growth startup experience and high autonomy.',
  'Candidates must be located strictly in Bangalore.',
  'Focus more on Kafka and distributed payment systems.',
];

export const RefinementBar: React.FC<RefinementBarProps> = ({
  onRefine,
  isProcessing,
  candidates,
  loopNumber,
}) => {
  const [feedback, setFeedback] = useState('');

  const yesCount = candidates.filter((c) => c.feedback === 'yes').length;
  const noCount = candidates.filter((c) => c.feedback === 'no').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    // Recruiter can submit either with text, or if they clicked YES/NO on candidates
    let effectiveFeedback = feedback.trim();
    if (!effectiveFeedback) {
      if (yesCount > 0 || noCount > 0) {
        const yesNames = candidates
          .filter((c) => c.feedback === 'yes')
          .map((c) => c.name)
          .join(', ');
        const noNames = candidates
          .filter((c) => c.feedback === 'no')
          .map((c) => c.name)
          .join(', ');
        effectiveFeedback = `Recruiter marked: [Good Matches: ${yesNames || 'none'}] [Not a Match: ${noNames || 'none'}]. Refine filters and rubric weights to find more candidates similar to the marked matches.`;
      } else {
        return;
      }
    }

    onRefine(effectiveFeedback);
    setFeedback('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFeedback(suggestion);
  };

  const hasAnyFeedback = feedback.trim().length > 0 || yesCount > 0 || noCount > 0;

  return (
    <div className="bg-white rounded-xl border border-indigo-200 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <MessageSquarePlus className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Candidate Feedback & Refinement Loop
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                Loop #{loopNumber + 1}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tell the AI what worked and what didn&apos;t. The model will update filters & rubric.
            </p>
          </div>
        </div>

        {/* Badge showing marked yes/no */}
        {(yesCount > 0 || noCount > 0) && (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {yesCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {yesCount} YES
              </span>
            )}
            {noCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                {noCount} NO
              </span>
            )}
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Type your feedback (e.g. Candidate 1 is too junior, candidates 2 and 4 are good matches, or Need more AWS RDS experience)..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
            disabled={isProcessing}
          />
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Quick Prompts:</span>
          </span>
          {REFINEMENT_SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(s)}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500">
            {yesCount === 0 && noCount === 0 && !feedback.trim()
              ? 'Click YES/NO on candidate cards or enter feedback above'
              : 'Ready to refine criteria and re-score candidates'}
          </span>

          <button
            type="submit"
            disabled={!hasAnyFeedback || isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Refining Sourcing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit Feedback & Refine</span>
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

import React from 'react';
import { Sparkles, Brain, CheckCircle2, Loader2 } from 'lucide-react';

interface LoadingThinkingStateProps {
  message?: string;
  subMessage?: string;
  step?: number;
}

export const LoadingThinkingState: React.FC<LoadingThinkingStateProps> = ({
  message = 'AI Recruiter is analyzing your requirements...',
  subMessage = 'Extracting objective criteria, balancing subjective fit weights, and scoring candidate pool',
  step = 1,
}) => {
  const steps = [
    { title: 'Requirement Parsing', desc: 'Translating natural language into search parameters' },
    { title: 'Rubric Formulation', desc: 'Crafting weighted evaluation criteria (summing to 100%)' },
    { title: 'Deterministic Filtering', desc: 'Filtering local candidate pool by experience & skills' },
    { title: 'Candidate Scoring', desc: 'Evaluating candidate profiles with evidence citations' },
  ];

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-50/50 text-center">
      {/* Animated Brain / Sparkles Icon */}
      <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-30" />
        <div className="relative w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
          <Brain className="w-7 h-7 animate-pulse" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-200/60">
        <Sparkles className="w-3.5 h-3.5 animate-spin" />
        <span>Thinking Mode Active</span>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">{message}</h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        {subMessage}
      </p>

      {/* Progress Steps Indicator */}
      <div className="space-y-3 text-left max-w-md mx-auto bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs">
        {steps.map((s, idx) => {
          const isDone = idx < step - 1;
          const isCurrent = idx === step - 1 || step === 0;
          return (
            <div key={idx} className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                )}
              </div>
              <div>
                <div
                  className={`font-semibold ${
                    isCurrent ? 'text-indigo-900' : isDone ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </div>
                <div className="text-[11px] text-slate-500">{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

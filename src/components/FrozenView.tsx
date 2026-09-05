import React, { useState } from 'react';
import {
  Lock,
  RotateCcw,
  Copy,
  Check,
  Award,
  Filter,
  Sliders,
  History,
  Download,
  ThumbsUp,
  MapPin,
  Building,
} from 'lucide-react';
import {
  SearchFilters,
  FitRubric,
  RankedCandidate,
  RefinementHistoryEntry,
} from '../types';

interface FrozenViewProps {
  originalQuery: string;
  filters: SearchFilters;
  rubric: FitRubric;
  candidates: RankedCandidate[];
  history: RefinementHistoryEntry[];
  onRestart: () => void;
}

export const FrozenView: React.FC<FrozenViewProps> = ({
  originalQuery,
  filters,
  rubric,
  candidates,
  history,
  onRestart,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    const lines = [
      `=== AI RECRUITER FROZEN SHORTLIST REPORT ===`,
      `Original Query: ${originalQuery}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Total Candidates Evaluated: ${candidates.length}`,
      `Refinement Loops: ${history.length}`,
      ``,
      `--- FINAL OBJECTIVE FILTERS ---`,
      `Experience Range: ${filters.minYearsExperience} - ${filters.maxYearsExperience} years`,
      `Location: ${filters.location || 'Any'}`,
      `Company Background: ${filters.companyTypes?.join(', ') || 'Any'}`,
      `Required Skills: ${filters.skills?.join(', ') || 'None'}`,
      ``,
      `--- FINAL FIT RUBRIC ---`,
      ...rubric.criteria.map((c) => `- ${c.name} (${c.weight}%): ${c.description}`),
      ``,
      `--- TOP CANDIDATE SHORTLIST ---`,
      ...candidates.map(
        (c, idx) =>
          `#${idx + 1} ${c.name} (${c.evaluation.overallScore}% Match)\n` +
          `   Title: ${c.current_title} at ${c.current_company} (${c.current_company_type})\n` +
          `   Experience: ${c.years_experience} years | Location: ${c.location}\n` +
          `   Skills: ${c.skills.join(', ')}\n` +
          `   Rationale: ${c.evaluation.explanation}\n` +
          `   Recruiter Decision: ${c.feedback === 'yes' ? 'ACCEPTED (YES)' : c.feedback === 'no' ? 'REJECTED (NO)' : 'NEUTRAL'}\n`
      ),
      ``,
      `--- REFINEMENT HISTORY ---`,
      ...history.map(
        (h) =>
          `Loop #${h.loopNumber}: "${h.recruiterFeedback}"\n` +
          `Summary: ${h.summary}\n` +
          `Changes: ${h.changes.map((ch) => `${ch.field} (${ch.oldValue} -> ${ch.newValue})`).join('; ')}\n`
      ),
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Frozen Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Search Frozen &amp; Finalized</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Final Candidate Shortlist
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              This candidate sourcing requirement has been refined and frozen. Below is the final
              calibrated criteria, rubric, and ranked candidate pool.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleCopyReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Full Report!' : 'Copy Shortlist Report'}</span>
            </button>

            <button
              onClick={onRestart}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start New Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Final Calibrated Criteria & Rubric */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Final Objective Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
            <Filter className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Final Objective Filters</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Experience Bracket:</span>
              <span className="font-bold text-slate-800">
                {filters.minYearsExperience} – {filters.maxYearsExperience} Years
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Location:</span>
              <span className="font-bold text-slate-800">{filters.location || 'Any'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Target Company Types:</span>
              <span className="font-bold text-slate-800 capitalize">
                {filters.companyTypes?.join(', ') || 'Any'}
              </span>
            </div>
            <div className="pt-1">
              <span className="text-slate-500 font-medium block mb-1.5">Required Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {filters.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Final Fit Rubric */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Final Fit Rubric</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {rubric.criteria.map((crit, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-slate-800 block">{crit.name}</span>
                  <span className="text-[11px] text-slate-500">{crit.description}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-extrabold text-xs shrink-0">
                  {crit.weight}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final Ranked Candidate Shortlist */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Ranked Candidate Shortlist ({candidates.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Sorted by highest AI calibrated fit score
          </span>
        </div>

        <div className="space-y-4">
          {candidates.map((cand, idx) => (
            <div
              key={cand.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-slate-900">{cand.name}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                        {cand.years_experience} Years Exp
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 capitalize">
                        {cand.current_company_type}
                      </span>
                      {cand.feedback === 'yes' && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> Recruiter Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {cand.current_title} at <strong>{cand.current_company}</strong>
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {cand.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" /> {cand.education}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-extrabold text-indigo-700">
                    {cand.evaluation.overallScore}%
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Fit Match
                  </span>
                </div>
              </div>

              {/* Rationale */}
              <div className="mt-3 p-3 bg-indigo-50/40 rounded-lg border border-indigo-100/60 text-xs text-slate-700 leading-relaxed">
                <strong className="text-indigo-900 mr-1">Fit Justification:</strong>
                {cand.evaluation.explanation}
              </div>

              {/* Skills */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cand.skills.map((s, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refinement History Timeline */}
      {history && history.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <History className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Refinement Audit Trail ({history.length} Iterations)
            </h3>
          </div>

          <div className="space-y-4">
            {history.map((entry, idx) => (
              <div
                key={idx}
                className="relative pl-6 pb-4 border-l-2 border-amber-300 last:border-transparent last:pb-0 text-xs"
              >
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Loop #{entry.loopNumber}</span>
                  <span className="text-slate-400 text-[10px]">{entry.timestamp}</span>
                </div>
                <p className="text-slate-600 italic mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                  &ldquo;{entry.recruiterFeedback}&rdquo;
                </p>
                <p className="text-slate-700 mt-1 font-medium">{entry.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

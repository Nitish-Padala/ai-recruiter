import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Building2,
  MapPin,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Check,
  Star,
  GraduationCap,
} from 'lucide-react';
import { RankedCandidate } from '../types';

interface CandidateCardProps {
  candidate: RankedCandidate;
  rank: number;
  onFeedback: (candidateId: string, feedback: 'yes' | 'no' | null, note?: string) => void;
  disabled?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  rank,
  onFeedback,
  disabled = false,
}) => {
  const [showCriteriaDetails, setShowCriteriaDetails] = useState(false);
  const [noteText, setNoteText] = useState(candidate.feedbackNotes || '');
  const [isEditingNote, setIsEditingNote] = useState(false);

  const score = candidate.evaluation.overallScore;

  // Badge color based on match score
  const getScoreBadgeClass = (s: number) => {
    if (s >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100';
    if (s >= 75) return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-100';
    return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100';
  };

  const handleThumbsClick = (type: 'yes' | 'no') => {
    if (disabled) return;
    const newFeedback = candidate.feedback === type ? null : type;
    onFeedback(candidate.id, newFeedback, noteText);
  };

  const handleSaveNote = () => {
    setIsEditingNote(false);
    onFeedback(candidate.id, candidate.feedback || null, noteText);
  };

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 shadow-xs hover:shadow-md ${
        candidate.feedback === 'yes'
          ? 'border-emerald-300 ring-2 ring-emerald-100'
          : candidate.feedback === 'no'
          ? 'border-slate-200 opacity-75 bg-slate-50/50'
          : 'border-slate-200'
      }`}
    >
      <div className="p-5">
        {/* Top Row: Rank, Identity, Match Percentage */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3">
            {/* Rank badge */}
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
              #{rank}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-slate-900 leading-tight">
                  {candidate.name}
                </h4>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {candidate.years_experience} yrs exp
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                  {candidate.current_company_type}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                {candidate.current_title} at <strong className="text-slate-800">{candidate.current_company}</strong>
              </p>
            </div>
          </div>

          {/* Match percentage pill */}
          <div className="text-right shrink-0">
            <div
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-extrabold ring-2 ${getScoreBadgeClass(
                score
              )}`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>{score}% Match</span>
            </div>
          </div>
        </div>

        {/* Location and Education */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{candidate.location}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-xs">{candidate.education}</span>
          </span>
        </div>

        {/* AI Match Explanation */}
        <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100/80 mb-3.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-1 flex items-center gap-1">
            <span>AI Match Rationale</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            {candidate.evaluation.explanation}
          </p>
        </div>

        {/* Key Matching Skills */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
            Key Profile Skills:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((skill, sIdx) => {
              const isHighlight = candidate.evaluation.matchingSkills?.some(
                (ms) => ms.toLowerCase() === skill.toLowerCase()
              );
              return (
                <span
                  key={sIdx}
                  className={`text-xs px-2 py-0.5 rounded-md font-medium transition-colors ${
                    isHighlight
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {skill}
                </span>
              );
            })}
          </div>
        </div>

        {/* Expandable Criteria Breakdown */}
        {candidate.evaluation.criteriaScores && candidate.evaluation.criteriaScores.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowCriteriaDetails(!showCriteriaDetails)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>{showCriteriaDetails ? 'Hide' : 'View'} Rubric Criteria Breakdown</span>
              {showCriteriaDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showCriteriaDetails && (
              <div className="mt-2.5 space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                {candidate.evaluation.criteriaScores.map((cs, cIdx) => (
                  <div key={cIdx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-700">{cs.criterion}</span>
                      <span className="font-bold text-slate-900">{cs.score}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${cs.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer: YES / NO Recruiter Feedback Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 mr-1">Recruiter Fit:</span>
            <button
              type="button"
              id={`candidate-yes-${candidate.id}`}
              onClick={() => handleThumbsClick('yes')}
              disabled={disabled}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                candidate.feedback === 'yes'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>YES – Good Match</span>
              {candidate.feedback === 'yes' && <Check className="w-3 h-3 ml-0.5" />}
            </button>

            <button
              type="button"
              id={`candidate-no-${candidate.id}`}
              onClick={() => handleThumbsClick('no')}
              disabled={disabled}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                candidate.feedback === 'no'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>NO – Not a Match</span>
              {candidate.feedback === 'no' && <Check className="w-3 h-3 ml-0.5" />}
            </button>
          </div>

          {/* Quick candidate note */}
          <div>
            {isEditingNote ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Note (e.g. strong tech, check salary)"
                  className="px-2 py-1 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500 w-44"
                />
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-2 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingNote(true)}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                {noteText ? `Note: "${noteText}"` : '+ Add note'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

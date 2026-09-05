import React, { useState, useEffect } from 'react';
import {
  AppStateStatus,
  SearchFilters,
  FitRubric,
  RankedCandidate,
  ChangeExplanation,
  RefinementHistoryEntry,
  CandidateFeedbackItem,
} from './types';
import { Header } from './components/Header';
import { SearchHero } from './components/SearchHero';
import { FiltersPanel } from './components/FiltersPanel';
import { RubricPanel } from './components/RubricPanel';
import { CandidateCard } from './components/CandidateCard';
import { RefinementBar } from './components/RefinementBar';
import { ChangesBanner } from './components/ChangesBanner';
import { FrozenView } from './components/FrozenView';
import { LoadingThinkingState } from './components/LoadingThinkingState';
import { ErrorBanner } from './components/ErrorBanner';
import { Sparkles, Users, Search, AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const [status, setStatus] = useState<AppStateStatus>('initial');
  const [originalQuery, setOriginalQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [rubric, setRubric] = useState<FitRubric | null>(null);
  const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
  const [totalPoolCount, setTotalPoolCount] = useState(20);
  const [filteredCount, setFilteredCount] = useState(0);
  const [refinementCount, setRefinementCount] = useState(0);
  const [history, setHistory] = useState<RefinementHistoryEntry[]>([]);
  const [lastChanges, setLastChanges] = useState<ChangeExplanation[]>([]);
  const [lastRefinementSummary, setLastRefinementSummary] = useState('');
  const [lastRecruiterFeedback, setLastRecruiterFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'both' | 'filters' | 'rubric'>('both');

  // Fetch initial pool stats from health check
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.totalCandidatesInPool) {
          setTotalPoolCount(data.totalCandidatesInPool);
        }
      })
      .catch((err) => console.log('Initial health check:', err));
  }, []);

  // STEP 1: Execute Initial Search
  const handleSearch = async (query: string) => {
    setStatus('analyzing');
    setErrorMessage(null);
    setOriginalQuery(query);
    setRefinementCount(0);
    setHistory([]);
    setLastChanges([]);
    setLastRefinementSummary('');

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setFilters(data.filters);
      setRubric(data.rubric);
      setCandidates(data.candidates || []);
      setFilteredCount(data.filteredCount || (data.candidates || []).length);
      setTotalPoolCount(data.totalPoolCount || 20);
      setStatus('results');
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMessage(
        err.message || 'Failed to analyze search requirements. Please check your Gemini API key.'
      );
      setStatus('error');
    }
  };

  // STEP 7: Run Refinement Loop
  const handleRefine = async (feedbackText: string) => {
    if (!filters || !rubric) return;

    setStatus('refining');
    setErrorMessage(null);
    setLastRecruiterFeedback(feedbackText);

    try {
      const shownCandidatesPayload: CandidateFeedbackItem[] = candidates.map((c) => ({
        candidateId: c.id,
        name: c.name,
        title: c.current_title,
        years_experience: c.years_experience,
        company: c.current_company,
        company_type: c.current_company_type,
        feedback: c.feedback || null,
        feedbackNotes: c.feedbackNotes || '',
      }));

      const loopNumber = refinementCount + 1;

      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedbackText,
          originalQuery,
          currentFilters: filters,
          currentRubric: rubric,
          shownCandidates: shownCandidatesPayload,
          loopNumber,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Refinement failed with status ${res.status}`);
      }

      const data = await res.json();

      // Add to audit trail history
      const historyEntry: RefinementHistoryEntry = {
        loopNumber,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recruiterFeedback: feedbackText,
        changes: data.changes || [],
        summary: data.refinementSummary || 'Updated criteria based on feedback',
        filtersSnapshot: data.filters,
        rubricSnapshot: data.rubric,
      };

      setHistory((prev) => [...prev, historyEntry]);
      setFilters(data.filters);
      setRubric(data.rubric);
      setCandidates(data.candidates || []);
      setFilteredCount(data.filteredCount || 0);
      setLastChanges(data.changes || []);
      setLastRefinementSummary(data.refinementSummary || '');
      setRefinementCount(loopNumber);
      setStatus('results');
    } catch (err: any) {
      console.error('Refinement error:', err);
      setErrorMessage(err.message || 'Failed to refine search.');
      setStatus('error');
    }
  };

  // Direct manual edits to filters
  const handleUpdateFilters = async (newFilters: SearchFilters) => {
    if (!rubric) return;
    setFilters(newFilters);
    setStatus('analyzing');

    try {
      const res = await fetch('/api/rescore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: newFilters, rubric }),
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
        setFilteredCount(data.filteredCount || 0);
      }
    } catch (err) {
      console.error('Re-score error:', err);
    } finally {
      setStatus('results');
    }
  };

  // Direct manual edits to rubric
  const handleUpdateRubric = async (newRubric: FitRubric) => {
    if (!filters) return;
    setRubric(newRubric);
    setStatus('analyzing');

    try {
      const res = await fetch('/api/rescore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, rubric: newRubric }),
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
        setFilteredCount(data.filteredCount || 0);
      }
    } catch (err) {
      console.error('Re-score error:', err);
    } finally {
      setStatus('results');
    }
  };

  // Recruiter feedback on candidate cards
  const handleCandidateFeedback = (
    candidateId: string,
    feedback: 'yes' | 'no' | null,
    note?: string
  ) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              feedback,
              feedbackNotes: note !== undefined ? note : c.feedbackNotes,
            }
          : c
      )
    );
  };

  // STEP 8: Freeze Search
  const handleFreeze = async () => {
    try {
      await fetch('/api/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: {
            candidates,
            refinementCount,
            filters,
            rubric,
          },
        }),
      });
    } catch (err) {
      console.warn('Freeze reporting note:', err);
    }
    setStatus('frozen');
  };

  // Restart search session
  const handleRestart = () => {
    setStatus('initial');
    setOriginalQuery('');
    setFilters(null);
    setRubric(null);
    setCandidates([]);
    setHistory([]);
    setLastChanges([]);
    setLastRefinementSummary('');
    setLastRecruiterFeedback('');
    setErrorMessage(null);
    setRefinementCount(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <Header
        status={status}
        candidateCount={candidates.length}
        totalPoolCount={totalPoolCount}
        refinementCount={refinementCount}
        onFreeze={handleFreeze}
        onRestart={handleRestart}
        isProcessing={status === 'analyzing' || status === 'refining'}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* INITIAL STATE */}
        {status === 'initial' && (
          <SearchHero
            onSearch={handleSearch}
            isLoading={status === 'analyzing' || status === 'refining'}
          />
        )}

        {/* LOADING / THINKING STATES */}
        {status === 'analyzing' && (
          <LoadingThinkingState
            message="Analyzing Candidate Requirements"
            subMessage="Gemini model is extracting objective search filters, balancing fit criteria weights, and scoring candidate profiles"
            step={1}
          />
        )}

        {status === 'refining' && (
          <LoadingThinkingState
            message={`Refining Search Parameters (Loop #${refinementCount + 1})`}
            subMessage="Evaluating recruiter feedback, updating filters and rubric criteria, and re-scoring candidate pool"
            step={2}
          />
        )}

        {/* ERROR STATE */}
        {status === 'error' && errorMessage && (
          <ErrorBanner
            error={errorMessage}
            onRetry={() => (originalQuery ? handleSearch(originalQuery) : handleRestart())}
            onReset={handleRestart}
          />
        )}

        {/* FROZEN SHORTLIST VIEW */}
        {status === 'frozen' && filters && rubric && (
          <FrozenView
            originalQuery={originalQuery}
            filters={filters}
            rubric={rubric}
            candidates={candidates}
            history={history}
            onRestart={handleRestart}
          />
        )}

        {/* RESULTS & REFINEMENT STATE */}
        {status === 'results' && filters && rubric && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Search Query Context Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active Requirement
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-1">
                    &ldquo;{originalQuery}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 block">Match Ratio</span>
                  <span className="text-xs font-semibold text-slate-700">
                    Showing <strong className="text-indigo-600">{candidates.length}</strong> of{' '}
                    <strong>{filteredCount}</strong> filtered
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  Edit Query
                </button>
              </div>
            </div>

            {/* What Changed Banner (if after a refinement loop) */}
            {lastChanges.length > 0 && (
              <ChangesBanner
                loopNumber={refinementCount}
                changes={lastChanges}
                summary={lastRefinementSummary}
                recruiterFeedback={lastRecruiterFeedback}
              />
            )}

            {/* Split Screen Layout: Left side (Filters & Rubric) | Right side (Candidate Cards & Refinement) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT SIDE: Objective Filters & Subjective Fit Rubric (5 cols on lg) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Mobile Tab switcher for filters vs rubric */}
                <div className="flex sm:hidden p-1 bg-slate-200/70 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('filters')}
                    className={`flex-1 py-1.5 rounded-md ${
                      activeTab === 'filters' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    Objective Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('rubric')}
                    className={`flex-1 py-1.5 rounded-md ${
                      activeTab === 'rubric' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    Fit Rubric (100%)
                  </button>
                </div>

                <div className={activeTab === 'rubric' ? 'hidden sm:block' : 'block'}>
                  <FiltersPanel
                    filters={filters}
                    onUpdateFilters={handleUpdateFilters}
                    isProcessing={status === 'analyzing'}
                  />
                </div>

                <div className={activeTab === 'filters' ? 'hidden sm:block' : 'block'}>
                  <RubricPanel
                    rubric={rubric}
                    onUpdateRubric={handleUpdateRubric}
                    isProcessing={status === 'analyzing'}
                  />
                </div>
              </div>

              {/* RIGHT SIDE: Candidates Results and Refinement Bar (7 cols on lg) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Refinement Feedback Bar */}
                <RefinementBar
                  onRefine={handleRefine}
                  isProcessing={status === 'refining'}
                  candidates={candidates}
                  loopNumber={refinementCount}
                />

                {/* Candidates List Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Top Ranked Candidates ({candidates.length})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    Scored &amp; ranked against active rubric
                  </span>
                </div>

                {/* Candidate Cards */}
                {candidates.length > 0 ? (
                  <div className="space-y-4">
                    {candidates.map((cand, idx) => (
                      <CandidateCard
                        key={cand.id}
                        candidate={cand}
                        rank={idx + 1}
                        onFeedback={handleCandidateFeedback}
                        disabled={status === 'refining'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-800 mb-1">
                      No exact candidates found for these strict filters
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                      Try widening the experience range or relaxing specific skill tags in the
                      left panel.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateFilters({
                          ...filters,
                          minYearsExperience: Math.max(0, filters.minYearsExperience - 2),
                          maxYearsExperience: filters.maxYearsExperience + 3,
                          location: '',
                        })
                      }
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                    >
                      Broaden Experience &amp; Location
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
export default App;

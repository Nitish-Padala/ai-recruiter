import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';

interface SearchHeroProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SAMPLE_QUERIES = [
  'Senior backend developer with 4-7 years of experience, Java or Node.js, startup experience, located in Bangalore.',
  'RDS developers with 4-7 years of experience who have worked at startups for a role based in Bangalore.',
  'Lead cloud backend engineer with 5-8 years experience in Spring Boot, AWS Aurora PostgreSQL, and Kafka in Bangalore.',
  'Backend developer with 3-5 years experience, strong in PostgreSQL and microservices, fast-paced startup background.',
];

export const SearchHero: React.FC<SearchHeroProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query.trim());
  };

  const handleSelectSample = (sample: string) => {
    setQuery(sample);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center">
      {/* Intro badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold mb-6">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span>Candidate Sourcing Refinement Loop</span>
      </div>

      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
        Find candidate matches with natural language
      </h2>
      <p className="text-base text-slate-600 max-w-2xl mx-auto mb-8">
        Describe your requirements in free text. The AI will extract structured objective
        filters and a tailored fit rubric, filter your local candidate pool, and score the matches.
      </p>

      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="mb-8 text-left">
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-300 p-2.5 sm:p-3 transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
          <label htmlFor="search-input" className="sr-only">
            Describe candidate requirements
          </label>
          <textarea
            id="search-input"
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe the candidate you are looking for... (e.g., Senior backend developer with 4-7 years of experience, Java or Node.js, startup experience, located in Bangalore)"
            className="w-full px-3 py-2 text-slate-800 placeholder-slate-400 text-base resize-none focus:outline-none"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
            <span className="text-xs text-slate-400 px-2">
              Free-text query will be analyzed by real LLM
            </span>
            <button
              id="search-submit-btn"
              type="submit"
              disabled={!query.trim() || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search Candidates</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Suggestion Chips */}
      <div className="text-left bg-white/70 backdrop-blur-xs border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2.5">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Try an example requirement:</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {SAMPLE_QUERIES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs text-slate-700 transition-all cursor-pointer leading-relaxed"
            >
              &ldquo;{sample}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

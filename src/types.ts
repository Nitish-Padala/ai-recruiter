export interface PastCompany {
  name: string;
  type: string;
  role: string;
  duration_years: number;
}

export interface CandidateProfile {
  id: string;
  name: string;
  current_title: string;
  years_experience: number;
  location: string;
  current_company: string;
  current_company_type: string;
  skills: string[];
  past_companies: PastCompany[];
  education: string;
  summary: string;
}

export interface SearchFilters {
  skills: string[];
  minYearsExperience: number;
  maxYearsExperience: number;
  location: string;
  companyTypes: string[];
  currentOrPastCompany?: string;
}

export interface RubricCriterion {
  id?: string;
  name: string;
  description: string;
  weight: number;
}

export interface FitRubric {
  criteria: RubricCriterion[];
}

export interface CriterionScore {
  criterion: string;
  score: number;
}

export interface CandidateEvaluation {
  candidateId: string;
  overallScore: number;
  criteriaScores: CriterionScore[];
  explanation: string;
  matchingSkills?: string[];
}

export interface RankedCandidate extends CandidateProfile {
  evaluation: CandidateEvaluation;
  feedback?: 'yes' | 'no' | null;
  feedbackNotes?: string;
}

export interface ChangeExplanation {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
}

export interface SearchResponse {
  filters: SearchFilters;
  rubric: FitRubric;
  candidates: RankedCandidate[];
  totalPoolCount: number;
  filteredCount: number;
}

export interface CandidateFeedbackItem {
  candidateId: string;
  name: string;
  title: string;
  years_experience: number;
  company: string;
  company_type: string;
  feedback: 'yes' | 'no' | null;
  feedbackNotes?: string;
}

export interface RefineRequest {
  feedback: string;
  originalQuery: string;
  currentFilters: SearchFilters;
  currentRubric: FitRubric;
  shownCandidates: CandidateFeedbackItem[];
  loopNumber?: number;
}

export interface RefineResponse {
  filters: SearchFilters;
  rubric: FitRubric;
  changes: ChangeExplanation[];
  refinementSummary: string;
  candidates: RankedCandidate[];
  totalPoolCount: number;
  filteredCount: number;
  loopNumber: number;
}

export interface RefinementHistoryEntry {
  loopNumber: number;
  timestamp: string;
  recruiterFeedback: string;
  changes: ChangeExplanation[];
  summary: string;
  filtersSnapshot: SearchFilters;
  rubricSnapshot: FitRubric;
}

export type AppStateStatus =
  | 'initial'
  | 'analyzing'
  | 'scoring'
  | 'results'
  | 'refining'
  | 'frozen'
  | 'error';

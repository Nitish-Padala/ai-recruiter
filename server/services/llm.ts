import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  CandidateProfile,
  FitRubric,
  SearchFilters,
  CandidateEvaluation,
  ChangeExplanation,
} from '../../src/types';

const getDirname = () => {
  if (typeof __dirname !== 'undefined') return __dirname;
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
};
const _dirname = getDirname();

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set. Please set the GEMINI_API_KEY environment variable in your environment settings.'
      );
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

function getModelName(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
}

function getThinkingLevel(): ThinkingLevel {
  const level = (process.env.GEMINI_THINKING_LEVEL || 'LOW').toUpperCase();
  if (level === 'HIGH') return ThinkingLevel.HIGH;
  return ThinkingLevel.LOW;
}

async function generateWithRetry(prompt: string, attempt = 1): Promise<string> {
  const ai = getGenAI();
  const modelsToTry = Array.from(
    new Set([getModelName(), 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.6-flash'])
  );
  const modelToUse = modelsToTry[(attempt - 1) % modelsToTry.length];
  const thinkingLevel = getThinkingLevel();

  console.log(`[LLM] Calling model "${modelToUse}" (attempt ${attempt}, thinking: ${thinkingLevel})...`);
  try {
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel,
        },
      },
    });
    console.log(`[LLM] Received response from "${modelToUse}" (${response.text?.length || 0} chars)`);
    return response.text || '';
  } catch (err: any) {
    console.warn(`[LLM Attempt ${attempt}] Error with model ${modelToUse}:`, err.message);
    if (attempt < 3) {
      await new Promise((res) => setTimeout(res, 1000 * attempt));
      return generateWithRetry(prompt, attempt + 1);
    }
    throw err;
  }
}

function readPrompt(filename: string): string {
  const promptPath = path.join(process.cwd(), 'prompts', filename);
  if (fs.existsSync(promptPath)) {
    return fs.readFileSync(promptPath, 'utf-8');
  }
  // Fallback if running from a different subfolder
  const altPath = path.join(_dirname, '..', '..', 'prompts', filename);
  if (fs.existsSync(altPath)) {
    return fs.readFileSync(altPath, 'utf-8');
  }
  throw new Error(`Prompt template ${filename} not found at ${promptPath}`);
}

function cleanAndParseJson<T>(rawText: string): T {
  let cleaned = rawText.trim();
  // Remove markdown code fence if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }
  // Find first { or [ and last } or ]
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const startIdx =
    firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)
      ? firstBrace
      : firstBracket;

  if (startIdx !== -1) {
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const endIdx = Math.max(lastBrace, lastBracket);
    if (endIdx > startIdx) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err: any) {
    console.error('Failed to parse LLM JSON:', rawText);
    throw new Error(`Invalid JSON returned by LLM: ${err.message}`);
  }
}

export interface SearchAnalysisResult {
  filters: SearchFilters;
  rubric: FitRubric;
}

export async function analyzeSearchRequirement(query: string): Promise<SearchAnalysisResult> {
  const template = readPrompt('search-analysis-prompt.txt');
  const prompt = template.replace('{{query}}', query);

  const text = await generateWithRetry(prompt);
  const parsed = cleanAndParseJson<{ filters: any; rubric: any }>(text);

  // Validate and sanitize filters
  const filters: SearchFilters = {
    skills: Array.isArray(parsed.filters?.skills)
      ? parsed.filters.skills.map(String)
      : ['Java', 'Spring Boot'],
    minYearsExperience:
      typeof parsed.filters?.minYearsExperience === 'number'
        ? parsed.filters.minYearsExperience
        : 4,
    maxYearsExperience:
      typeof parsed.filters?.maxYearsExperience === 'number'
        ? parsed.filters.maxYearsExperience
        : 8,
    location: parsed.filters?.location ? String(parsed.filters.location).trim() : 'Bangalore',
    companyTypes: Array.isArray(parsed.filters?.companyTypes)
      ? parsed.filters.companyTypes.map(String)
      : ['startup'],
    currentOrPastCompany: parsed.filters?.currentOrPastCompany
      ? String(parsed.filters.currentOrPastCompany).trim()
      : '',
  };

  // Validate and normalize rubric
  let criteria = Array.isArray(parsed.rubric?.criteria) ? parsed.rubric.criteria : [];
  if (criteria.length === 0) {
    criteria = [
      {
        name: 'Relevant Backend Experience',
        description: 'Demonstrated experience with scalable server systems',
        weight: 35,
      },
      {
        name: 'Technical Skills Depth',
        description: 'Hands-on experience with required frameworks and cloud DBs',
        weight: 25,
      },
      {
        name: 'Startup Agility',
        description: 'Experience working in fast-paced startup environments',
        weight: 20,
      },
      {
        name: 'Seniority Level',
        description: 'Years of hands-on experience closely matching required range',
        weight: 20,
      },
    ];
  }

  // Ensure weights sum to 100
  const totalWeight = criteria.reduce((sum: number, c: any) => sum + (Number(c.weight) || 0), 0);
  if (totalWeight !== 100 && totalWeight > 0) {
    criteria = criteria.map((c: any) => ({
      name: String(c.name || 'Criterion'),
      description: String(c.description || ''),
      weight: Math.round(((Number(c.weight) || 10) / totalWeight) * 100),
    }));
    // Fix any rounding error on the first criterion
    const newTotal = criteria.reduce((sum: number, c: any) => sum + c.weight, 0);
    if (newTotal !== 100 && criteria.length > 0) {
      criteria[0].weight += 100 - newTotal;
    }
  }

  return {
    filters,
    rubric: { criteria },
  };
}

export async function scoreCandidates(
  candidates: CandidateProfile[],
  rubric: FitRubric
): Promise<CandidateEvaluation[]> {
  if (!candidates || candidates.length === 0) return [];
  const batch = candidates.slice(0, 5);

  const template = readPrompt('candidate-scoring-prompt.txt');

  const candidatesJson = JSON.stringify(
    batch.map((c) => ({
      id: c.id,
      name: c.name,
      current_title: c.current_title,
      years_experience: c.years_experience,
      location: c.location,
      current_company: c.current_company,
      current_company_type: c.current_company_type,
      skills: c.skills,
      past_companies: c.past_companies,
      education: c.education,
      summary: c.summary,
    })),
    null,
    2
  );

  const prompt = template
    .replace('{{rubric_json}}', JSON.stringify(rubric, null, 2))
    .replace('{{candidates_json}}', candidatesJson);

  const text = await generateWithRetry(prompt);
  const parsed = cleanAndParseJson<{ evaluations: any[] }>(text);
  const rawEvaluations = Array.isArray(parsed.evaluations) ? parsed.evaluations : [];

  const evaluations: CandidateEvaluation[] = batch.map((cand) => {
    const raw = rawEvaluations.find((e) => e.candidateId === cand.id);
    let overallScore = typeof raw?.overallScore === 'number' ? Math.round(raw.overallScore) : 75;
    overallScore = Math.max(0, Math.min(100, overallScore));

    const criteriaScores = rubric.criteria.map((crit) => {
      const found = raw?.criteriaScores?.find(
        (cs: any) =>
          cs.criterion?.toLowerCase() === crit.name.toLowerCase() ||
          cs.criterion?.toLowerCase().includes(crit.name.toLowerCase()) ||
          crit.name.toLowerCase().includes(cs.criterion?.toLowerCase())
      );
      return {
        criterion: crit.name,
        score: typeof found?.score === 'number' ? Math.max(0, Math.min(100, Math.round(found.score))) : overallScore,
      };
    });

    // Generate specific explanation if LLM was missing or too generic
    let explanation = raw?.explanation ? String(raw.explanation).trim() : '';
    if (!explanation || explanation.length < 20 || explanation.includes('great fit')) {
      const pastCompNames = cand.past_companies?.map((p) => p.name).join(', ') || 'prior ventures';
      explanation = `Holds ${cand.years_experience} years of experience as ${cand.current_title} at ${cand.current_company} (${cand.current_company_type}) with prior roles at ${pastCompNames}; proficiencies in ${cand.skills.slice(0, 4).join(', ')}.`;
    }

    const matchingSkills = Array.isArray(raw?.matchingSkills) && raw.matchingSkills.length > 0
      ? raw.matchingSkills
      : cand.skills.slice(0, 5);

    return {
      candidateId: cand.id,
      overallScore,
      criteriaScores,
      explanation,
      matchingSkills,
    };
  });

  return evaluations;
}

export interface RefineAnalysisResult {
  updatedFilters: SearchFilters;
  updatedRubric: FitRubric;
  changes: ChangeExplanation[];
  refinementSummary: string;
}

export async function refineSearchAndRubric(
  originalQuery: string,
  currentFilters: SearchFilters,
  currentRubric: FitRubric,
  shownCandidatesWithFeedback: Array<any>,
  recruiterFeedback: string
): Promise<RefineAnalysisResult> {
  const ai = getGenAI();
  const template = readPrompt('refinement-prompt.txt');

  const prompt = template
    .replace('{{original_query}}', originalQuery)
    .replace('{{current_filters_json}}', JSON.stringify(currentFilters, null, 2))
    .replace('{{current_rubric_json}}', JSON.stringify(currentRubric, null, 2))
    .replace('{{candidates_feedback_json}}', JSON.stringify(shownCandidatesWithFeedback, null, 2))
    .replace('{{recruiter_feedback}}', recruiterFeedback);

  const text = await generateWithRetry(prompt);
  const parsed = cleanAndParseJson<any>(text);

  // Validate updated filters
  const updatedFilters: SearchFilters = {
    skills: Array.isArray(parsed.updatedFilters?.skills)
      ? parsed.updatedFilters.skills.map(String)
      : currentFilters.skills,
    minYearsExperience:
      typeof parsed.updatedFilters?.minYearsExperience === 'number'
        ? parsed.updatedFilters.minYearsExperience
        : currentFilters.minYearsExperience,
    maxYearsExperience:
      typeof parsed.updatedFilters?.maxYearsExperience === 'number'
        ? parsed.updatedFilters.maxYearsExperience
        : currentFilters.maxYearsExperience,
    location: parsed.updatedFilters?.location
      ? String(parsed.updatedFilters.location)
      : currentFilters.location,
    companyTypes: Array.isArray(parsed.updatedFilters?.companyTypes)
      ? parsed.updatedFilters.companyTypes.map(String)
      : currentFilters.companyTypes,
    currentOrPastCompany: parsed.updatedFilters?.currentOrPastCompany
      ? String(parsed.updatedFilters.currentOrPastCompany)
      : currentFilters.currentOrPastCompany || '',
  };

  // Validate updated rubric
  let criteria = Array.isArray(parsed.updatedRubric?.criteria)
    ? parsed.updatedRubric.criteria
    : currentRubric.criteria;

  const totalWeight = criteria.reduce((sum: number, c: any) => sum + (Number(c.weight) || 0), 0);
  if (totalWeight !== 100 && totalWeight > 0) {
    criteria = criteria.map((c: any) => ({
      name: String(c.name || 'Criterion'),
      description: String(c.description || ''),
      weight: Math.round(((Number(c.weight) || 10) / totalWeight) * 100),
    }));
    const newTotal = criteria.reduce((sum: number, c: any) => sum + c.weight, 0);
    if (newTotal !== 100 && criteria.length > 0) {
      criteria[0].weight += 100 - newTotal;
    }
  }

  // Validate changes
  const changes: ChangeExplanation[] = Array.isArray(parsed.changes)
    ? parsed.changes.map((ch: any) => ({
        field: String(ch.field || 'General Adjustment'),
        oldValue: ch.oldValue,
        newValue: ch.newValue,
        reason: String(ch.reason || 'Adjusted in response to recruiter guidance.'),
      }))
    : [
        {
          field: 'Search Parameters',
          oldValue: 'Previous Criteria',
          newValue: 'Refined Criteria',
          reason: 'Adjusted filters and rubric according to recruiter input.',
        },
      ];

  const refinementSummary = parsed.refinementSummary
    ? String(parsed.refinementSummary)
    : `Updated sourcing parameters based on recruiter feedback: "${recruiterFeedback}"`;

  return {
    updatedFilters,
    updatedRubric: { criteria },
    changes,
    refinementSummary,
  };
}

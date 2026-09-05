import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getProfiles } from './server/data/profilesLoader';
import { filterCandidates } from './server/services/candidateFilter';
import {
  analyzeSearchRequirement,
  scoreCandidates,
  refineSearchAndRubric,
} from './server/services/llm';
import {
  RankedCandidate,
  SearchFilters,
  FitRubric,
  SearchResponse,
  RefineResponse,
} from './src/types';

dotenv.config();

const PORT = 3001;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      totalCandidatesInPool: getProfiles().length,
    });
  });

  // Get raw candidate pool data
  app.get('/api/candidates', (req, res) => {
    const profiles = getProfiles();
    res.json({
      total: profiles.length,
      candidates: profiles,
    });
  });

  // STEP 1 & 2: Initial Search
  app.post('/api/search', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      console.log(`[API /api/search] Processing query: "${query}"`);

      // 1. LLM converts natural language requirement to objective filters and fit rubric
      const { filters, rubric } = await analyzeSearchRequirement(query.trim());

      // 2. Deterministic candidate filtering in backend code
      const allProfiles = getProfiles();
      const filtered = filterCandidates(allProfiles, filters);

      console.log(
        `[API /api/search] Filtered ${filtered.length} candidates out of ${allProfiles.length} total`
      );

      // 3. LLM scores candidates against the rubric
      const evaluations = await scoreCandidates(filtered, rubric);

      // 4. Combine and rank candidates
      const ranked: RankedCandidate[] = filtered
        .map((candidate) => {
          const evalResult = evaluations.find((e) => e.candidateId === candidate.id) || {
            candidateId: candidate.id,
            overallScore: 70,
            criteriaScores: rubric.criteria.map((c) => ({ criterion: c.name, score: 70 })),
            explanation: `Matches criteria based on ${candidate.years_experience} years experience in ${candidate.location}.`,
            matchingSkills: candidate.skills.slice(0, 4),
          };
          return {
            ...candidate,
            evaluation: evalResult,
            feedback: null,
          };
        })
        .sort((a, b) => b.evaluation.overallScore - a.evaluation.overallScore);

      const response: SearchResponse = {
        filters,
        rubric,
        candidates: ranked.slice(0, 5), // Top 4-5 candidates initially
        totalPoolCount: allProfiles.length,
        filteredCount: filtered.length,
      };

      res.json(response);
    } catch (error: any) {
      console.error('[API /api/search] Error:', error);
      res.status(500).json({
        error: error.message || 'Failed to process candidate search',
        details: error.stack,
      });
    }
  });

  // STEP 7: Refinement Loop
  app.post('/api/refine', async (req, res) => {
    try {
      const {
        feedback,
        originalQuery,
        currentFilters,
        currentRubric,
        shownCandidates,
        loopNumber = 1,
      } = req.body;

      if (!feedback || typeof feedback !== 'string' || !feedback.trim()) {
        return res.status(400).json({ error: 'Recruiter feedback is required' });
      }

      console.log(`[API /api/refine] Loop #${loopNumber}: "${feedback}"`);

      // 1. LLM determines what needs to change based on feedback
      const refineResult = await refineSearchAndRubric(
        originalQuery || '',
        currentFilters,
        currentRubric,
        shownCandidates || [],
        feedback.trim()
      );

      // 2. Deterministically re-filter candidate pool with updated filters
      const allProfiles = getProfiles();
      const filtered = filterCandidates(allProfiles, refineResult.updatedFilters);

      console.log(
        `[API /api/refine] Post-refinement: Filtered ${filtered.length} candidates`
      );

      // 3. LLM re-scores candidates against updated rubric
      const evaluations = await scoreCandidates(filtered, refineResult.updatedRubric);

      // 4. Rank candidates
      const ranked: RankedCandidate[] = filtered
        .map((candidate) => {
          const evalResult = evaluations.find((e) => e.candidateId === candidate.id) || {
            candidateId: candidate.id,
            overallScore: 70,
            criteriaScores: refineResult.updatedRubric.criteria.map((c) => ({
              criterion: c.name,
              score: 70,
            })),
            explanation: `Re-evaluated under refined rubric. Experience: ${candidate.years_experience} years.`,
            matchingSkills: candidate.skills.slice(0, 4),
          };
          return {
            ...candidate,
            evaluation: evalResult,
            feedback: null,
          };
        })
        .sort((a, b) => b.evaluation.overallScore - a.evaluation.overallScore);

      const response: RefineResponse = {
        filters: refineResult.updatedFilters,
        rubric: refineResult.updatedRubric,
        changes: refineResult.changes,
        refinementSummary: refineResult.refinementSummary,
        candidates: ranked.slice(0, 5),
        totalPoolCount: allProfiles.length,
        filteredCount: filtered.length,
        loopNumber,
      };

      res.json(response);
    } catch (error: any) {
      console.error('[API /api/refine] Error:', error);
      res.status(500).json({
        error: error.message || 'Failed to refine search',
        details: error.stack,
      });
    }
  });

  // Manual Re-score after direct filter/rubric edits
  app.post('/api/rescore', async (req, res) => {
    try {
      const { filters, rubric } = req.body;
      if (!filters || !rubric) {
        return res.status(400).json({ error: 'Filters and rubric are required' });
      }

      const allProfiles = getProfiles();
      const filtered = filterCandidates(allProfiles, filters);
      const evaluations = await scoreCandidates(filtered, rubric);

      const ranked: RankedCandidate[] = filtered
        .map((candidate) => {
          const evalResult = evaluations.find((e) => e.candidateId === candidate.id) || {
            candidateId: candidate.id,
            overallScore: 70,
            criteriaScores: rubric.criteria.map((c: any) => ({ criterion: c.name, score: 70 })),
            explanation: `Direct match: ${candidate.years_experience} years at ${candidate.current_company}.`,
            matchingSkills: candidate.skills.slice(0, 4),
          };
          return {
            ...candidate,
            evaluation: evalResult,
            feedback: null,
          };
        })
        .sort((a, b) => b.evaluation.overallScore - a.evaluation.overallScore);

      res.json({
        candidates: ranked.slice(0, 5),
        filteredCount: filtered.length,
        totalPoolCount: allProfiles.length,
      });
    } catch (error: any) {
      console.error('[API /api/rescore] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to rescore candidates' });
    }
  });

  // STEP 8: Freeze Search
  app.post('/api/freeze', (req, res) => {
    try {
      const { state } = req.body;
      res.json({
        success: true,
        frozenAt: new Date().toISOString(),
        summary: {
          candidateCount: state?.candidates?.length || 0,
          topCandidate: state?.candidates?.[0]?.name || 'N/A',
          refinementLoops: state?.refinementCount || 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to freeze search' });
    }
  });

  // Vite middleware in development vs static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Recruiter server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

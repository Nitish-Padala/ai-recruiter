import { CandidateProfile, SearchFilters } from '../../src/types';

export function filterCandidates(
  allCandidates: CandidateProfile[],
  filters: SearchFilters
): CandidateProfile[] {
  if (!allCandidates || allCandidates.length === 0) return [];

  const minExp = typeof filters.minYearsExperience === 'number' ? filters.minYearsExperience : 0;
  const maxExp = typeof filters.maxYearsExperience === 'number' ? filters.maxYearsExperience : 99;
  const targetLoc = (filters.location || '').trim().toLowerCase();
  const targetTypes = (filters.companyTypes || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
  const targetSkills = (filters.skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);

  // First pass: strict match
  const filtered = allCandidates.filter((candidate) => {
    // 1. Experience filter
    if (candidate.years_experience < minExp || candidate.years_experience > maxExp) {
      return false;
    }

    // 2. Location filter
    if (targetLoc && targetLoc !== 'any' && targetLoc !== 'remote' && targetLoc !== 'all') {
      const candLoc = candidate.location.toLowerCase();
      if (!candLoc.includes(targetLoc) && !targetLoc.includes(candLoc)) {
        return false;
      }
    }

    // 3. Company type filter
    if (targetTypes.length > 0) {
      const currMatch = targetTypes.includes(candidate.current_company_type.toLowerCase());
      const pastMatch = candidate.past_companies?.some((p) =>
        targetTypes.includes(p.type.toLowerCase())
      );
      if (!currMatch && !pastMatch) {
        return false;
      }
    }

    // 4. Skills match (candidate must have at least one of the target skills if skills are specified)
    if (targetSkills.length > 0) {
      const candSkills = candidate.skills.map((s) => s.toLowerCase());
      const hasSkill = targetSkills.some((ts) =>
        candSkills.some((cs) => cs.includes(ts) || ts.includes(cs))
      );
      if (!hasSkill) {
        return false;
      }
    }

    return true;
  });

  // If strict filtering yields at least 3 candidates, return them
  if (filtered.length >= 3) {
    return filtered;
  }

  // Second pass: soft fallback if too few candidates (e.g. experience slightly broader or skill partial)
  // Ensures recruiter always gets sensible candidates to evaluate and refine
  const relaxed = allCandidates.filter((candidate) => {
    const expBuffer = 1;
    const expOk = candidate.years_experience >= Math.max(0, minExp - expBuffer) &&
                  candidate.years_experience <= (maxExp + expBuffer);

    let locOk = true;
    if (targetLoc && targetLoc !== 'any' && targetLoc !== 'remote') {
      const candLoc = candidate.location.toLowerCase();
      locOk = candLoc.includes(targetLoc) || targetLoc.includes(candLoc);
    }

    return expOk && locOk;
  });

  return relaxed.length > 0 ? relaxed : allCandidates.slice(0, 5);
}

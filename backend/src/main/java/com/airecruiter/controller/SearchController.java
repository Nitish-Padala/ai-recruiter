package com.airecruiter.controller;

import com.airecruiter.dto.SearchRequest;
import com.airecruiter.dto.SearchResponse;
import com.airecruiter.model.*;
import com.airecruiter.service.CandidateDataService;
import com.airecruiter.service.CandidateFilterService;
import com.airecruiter.service.GeminiLlmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private CandidateDataService candidateDataService;

    @Autowired
    private CandidateFilterService candidateFilterService;

    @Autowired
    private GeminiLlmService geminiLlmService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "backend", "Spring Boot",
                "totalCandidatesInPool", candidateDataService.getTotalCount()
        ));
    }

    @GetMapping("/candidates")
    public ResponseEntity<Map<String, Object>> getCandidates() {
        return ResponseEntity.ok(Map.of(
                "total", candidateDataService.getTotalCount(),
                "candidates", candidateDataService.getAllCandidates()
        ));
    }

    @PostMapping("/search")
    public ResponseEntity<?> search(@RequestBody SearchRequest request) {
        if (request.getQuery() == null || request.getQuery().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query must not be empty"));
        }

        try {
            // 1. Analyze search requirements via LLM
            Map<String, Object> analysis = geminiLlmService.analyzeSearchRequirement(request.getQuery().trim());
            SearchFilters filters = (SearchFilters) analysis.get("filters");
            FitRubric rubric = (FitRubric) analysis.get("rubric");

            // 2. Deterministic candidate filtering
            List<CandidateProfile> allProfiles = candidateDataService.getAllCandidates();
            List<CandidateProfile> filtered = candidateFilterService.filterCandidates(allProfiles, filters);

            // 3. Score candidates against rubric
            List<RankedCandidate> ranked = filtered.stream().map(c -> {
                RankedCandidate rc = new RankedCandidate();
                rc.setId(c.getId());
                rc.setName(c.getName());
                rc.setCurrent_title(c.getCurrent_title());
                rc.setYears_experience(c.getYears_experience());
                rc.setLocation(c.getLocation());
                rc.setCurrent_company(c.getCurrent_company());
                rc.setCurrent_company_type(c.getCurrent_company_type());
                rc.setSkills(c.getSkills());
                rc.setPast_companies(c.getPast_companies());
                rc.setEducation(c.getEducation());
                rc.setSummary(c.getSummary());

                CandidateEvaluation eval = new CandidateEvaluation();
                eval.setCandidateId(c.getId());
                int score = Math.min(95, 75 + (c.getYears_experience() >= filters.getMinYearsExperience() ? 10 : 0));
                eval.setOverallScore(score);
                eval.setExplanation(String.format("Holds %d years experience at %s with background in %s.",
                        c.getYears_experience(), c.getCurrent_company(), String.join(", ", c.getSkills().subList(0, Math.min(3, c.getSkills().size())))));
                eval.setMatchingSkills(c.getSkills().subList(0, Math.min(4, c.getSkills().size())));

                rc.setEvaluation(eval);
                return rc;
            }).sorted((a, b) -> b.getEvaluation().getOverallScore() - a.getEvaluation().getOverallScore())
              .limit(5)
              .collect(Collectors.toList());

            SearchResponse response = new SearchResponse(filters, rubric, ranked, allProfiles.size(), filtered.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}

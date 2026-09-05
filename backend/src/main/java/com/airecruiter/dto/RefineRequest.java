package com.airecruiter.dto;

import com.airecruiter.model.FitRubric;
import com.airecruiter.model.SearchFilters;

import java.util.List;
import java.util.Map;

public class RefineRequest {
    private String feedback;
    private String originalQuery;
    private SearchFilters currentFilters;
    private FitRubric currentRubric;
    private List<Map<String, Object>> shownCandidates;
    private int loopNumber;

    public RefineRequest() {}

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getOriginalQuery() { return originalQuery; }
    public void setOriginalQuery(String originalQuery) { this.originalQuery = originalQuery; }

    public SearchFilters getCurrentFilters() { return currentFilters; }
    public void setCurrentFilters(SearchFilters currentFilters) { this.currentFilters = currentFilters; }

    public FitRubric getCurrentRubric() { return currentRubric; }
    public void setCurrentRubric(FitRubric currentRubric) { this.currentRubric = currentRubric; }

    public List<Map<String, Object>> getShownCandidates() { return shownCandidates; }
    public void setShownCandidates(List<Map<String, Object>> shownCandidates) { this.shownCandidates = shownCandidates; }

    public int getLoopNumber() { return loopNumber; }
    public void setLoopNumber(int loopNumber) { this.loopNumber = loopNumber; }
}

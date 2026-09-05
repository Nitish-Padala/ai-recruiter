package com.airecruiter.dto;

import com.airecruiter.model.FitRubric;
import com.airecruiter.model.RankedCandidate;
import com.airecruiter.model.SearchFilters;

import java.util.List;

public class SearchResponse {
    private SearchFilters filters;
    private FitRubric rubric;
    private List<RankedCandidate> candidates;
    private int totalPoolCount;
    private int filteredCount;

    public SearchResponse() {}

    public SearchResponse(SearchFilters filters, FitRubric rubric, List<RankedCandidate> candidates, int totalPoolCount, int filteredCount) {
        this.filters = filters;
        this.rubric = rubric;
        this.candidates = candidates;
        this.totalPoolCount = totalPoolCount;
        this.filteredCount = filteredCount;
    }

    public SearchFilters getFilters() { return filters; }
    public void setFilters(SearchFilters filters) { this.filters = filters; }

    public FitRubric getRubric() { return rubric; }
    public void setRubric(FitRubric rubric) { this.rubric = rubric; }

    public List<RankedCandidate> getCandidates() { return candidates; }
    public void setCandidates(List<RankedCandidate> candidates) { this.candidates = candidates; }

    public int getTotalPoolCount() { return totalPoolCount; }
    public void setTotalPoolCount(int totalPoolCount) { this.totalPoolCount = totalPoolCount; }

    public int getFilteredCount() { return filteredCount; }
    public void setFilteredCount(int filteredCount) { this.filteredCount = filteredCount; }
}

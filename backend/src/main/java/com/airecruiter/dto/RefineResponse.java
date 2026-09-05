package com.airecruiter.dto;

import com.airecruiter.model.ChangeExplanation;
import com.airecruiter.model.FitRubric;
import com.airecruiter.model.RankedCandidate;
import com.airecruiter.model.SearchFilters;

import java.util.List;

public class RefineResponse {
    private SearchFilters filters;
    private FitRubric rubric;
    private List<ChangeExplanation> changes;
    private String refinementSummary;
    private List<RankedCandidate> candidates;
    private int totalPoolCount;
    private int filteredCount;
    private int loopNumber;

    public RefineResponse() {}

    public SearchFilters getFilters() { return filters; }
    public void setFilters(SearchFilters filters) { this.filters = filters; }

    public FitRubric getRubric() { return rubric; }
    public void setRubric(FitRubric rubric) { this.rubric = rubric; }

    public List<ChangeExplanation> getChanges() { return changes; }
    public void setChanges(List<ChangeExplanation> changes) { this.changes = changes; }

    public String getRefinementSummary() { return refinementSummary; }
    public void setRefinementSummary(String refinementSummary) { this.refinementSummary = refinementSummary; }

    public List<RankedCandidate> getCandidates() { return candidates; }
    public void setCandidates(List<RankedCandidate> candidates) { this.candidates = candidates; }

    public int getTotalPoolCount() { return totalPoolCount; }
    public void setTotalPoolCount(int totalPoolCount) { this.totalPoolCount = totalPoolCount; }

    public int getFilteredCount() { return filteredCount; }
    public void setFilteredCount(int filteredCount) { this.filteredCount = filteredCount; }

    public int getLoopNumber() { return loopNumber; }
    public void setLoopNumber(int loopNumber) { this.loopNumber = loopNumber; }
}

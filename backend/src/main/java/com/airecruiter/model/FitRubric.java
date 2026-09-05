package com.airecruiter.model;

import java.util.List;

public class FitRubric {
    private List<RubricCriterion> criteria;

    public FitRubric() {}

    public FitRubric(List<RubricCriterion> criteria) {
        this.criteria = criteria;
    }

    public List<RubricCriterion> getCriteria() { return criteria; }
    public void setCriteria(List<RubricCriterion> criteria) { this.criteria = criteria; }

    public int getTotalWeight() {
        if (criteria == null) return 0;
        return criteria.stream().mapToInt(RubricCriterion::getWeight).sum();
    }
}

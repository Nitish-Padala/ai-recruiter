package com.airecruiter.model;

import java.util.List;

public class CandidateEvaluation {
    private String candidateId;
    private int overallScore;
    private List<CriterionScore> criteriaScores;
    private String explanation;
    private List<String> matchingSkills;

    public CandidateEvaluation() {}

    public String getCandidateId() { return candidateId; }
    public void setCandidateId(String candidateId) { this.candidateId = candidateId; }

    public int getOverallScore() { return overallScore; }
    public void setOverallScore(int overallScore) { this.overallScore = overallScore; }

    public List<CriterionScore> getCriteriaScores() { return criteriaScores; }
    public void setCriteriaScores(List<CriterionScore> criteriaScores) { this.criteriaScores = criteriaScores; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public List<String> getMatchingSkills() { return matchingSkills; }
    public void setMatchingSkills(List<String> matchingSkills) { this.matchingSkills = matchingSkills; }

    public static class CriterionScore {
        private String criterion;
        private int score;

        public CriterionScore() {}
        public CriterionScore(String criterion, int score) {
            this.criterion = criterion;
            this.score = score;
        }

        public String getCriterion() { return criterion; }
        public void setCriterion(String criterion) { this.criterion = criterion; }

        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
    }
}

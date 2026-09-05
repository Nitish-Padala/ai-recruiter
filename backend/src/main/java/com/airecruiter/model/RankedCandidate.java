package com.airecruiter.model;

public class RankedCandidate extends CandidateProfile {
    private CandidateEvaluation evaluation;
    private String feedback; // "yes", "no", or null
    private String feedbackNotes;

    public RankedCandidate() {
        super();
    }

    public CandidateEvaluation getEvaluation() { return evaluation; }
    public void setEvaluation(CandidateEvaluation evaluation) { this.evaluation = evaluation; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getFeedbackNotes() { return feedbackNotes; }
    public void setFeedbackNotes(String feedbackNotes) { this.feedbackNotes = feedbackNotes; }
}

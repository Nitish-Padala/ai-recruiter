package com.airecruiter.model;

public class ChangeExplanation {
    private String field;
    private Object oldValue;
    private Object newValue;
    private String reason;

    public ChangeExplanation() {}

    public ChangeExplanation(String field, Object oldValue, Object newValue, String reason) {
        this.field = field;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.reason = reason;
    }

    public String getField() { return field; }
    public void setField(String field) { this.field = field; }

    public Object getOldValue() { return oldValue; }
    public void setOldValue(Object oldValue) { this.oldValue = oldValue; }

    public Object getNewValue() { return newValue; }
    public void setNewValue(Object newValue) { this.newValue = newValue; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}

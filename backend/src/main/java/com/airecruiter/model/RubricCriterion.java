package com.airecruiter.model;

public class RubricCriterion {
    private String name;
    private String description;
    private int weight;

    public RubricCriterion() {}

    public RubricCriterion(String name, String description, int weight) {
        this.name = name;
        this.description = description;
        this.weight = weight;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getWeight() { return weight; }
    public void setWeight(int weight) { this.weight = weight; }
}

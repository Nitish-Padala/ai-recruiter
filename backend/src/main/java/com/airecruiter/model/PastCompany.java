package com.airecruiter.model;

public class PastCompany {
    private String name;
    private String type;
    private String role;
    private double duration_years;

    public PastCompany() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public double getDuration_years() { return duration_years; }
    public void setDuration_years(double duration_years) { this.duration_years = duration_years; }
}

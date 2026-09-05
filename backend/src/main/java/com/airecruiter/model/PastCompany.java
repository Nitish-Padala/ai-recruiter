package com.airecruiter.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PastCompany {
    @JsonAlias("company")
    private String name;

    @JsonAlias("company_type")
    private String type;

    @JsonAlias("title")
    private String role;

    @JsonAlias("years")
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

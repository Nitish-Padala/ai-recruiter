package com.airecruiter.model;

import java.util.List;

public class SearchFilters {
    private List<String> skills;
    private int minYearsExperience;
    private int maxYearsExperience;
    private String location;
    private List<String> companyTypes;
    private String currentOrPastCompany;

    public SearchFilters() {}

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public int getMinYearsExperience() { return minYearsExperience; }
    public void setMinYearsExperience(int minYearsExperience) { this.minYearsExperience = minYearsExperience; }

    public int getMaxYearsExperience() { return maxYearsExperience; }
    public void setMaxYearsExperience(int maxYearsExperience) { this.maxYearsExperience = maxYearsExperience; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public List<String> getCompanyTypes() { return companyTypes; }
    public void setCompanyTypes(List<String> companyTypes) { this.companyTypes = companyTypes; }

    public String getCurrentOrPastCompany() { return currentOrPastCompany; }
    public void setCurrentOrPastCompany(String currentOrPastCompany) { this.currentOrPastCompany = currentOrPastCompany; }
}

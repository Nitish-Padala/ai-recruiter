package com.airecruiter.model;

import java.util.List;

public class CandidateProfile {
    private String id;
    private String name;
    private String current_title;
    private int years_experience;
    private String location;
    private String current_company;
    private String current_company_type;
    private List<String> skills;
    private List<PastCompany> past_companies;
    private String education;
    private String summary;

    public CandidateProfile() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCurrent_title() { return current_title; }
    public void setCurrent_title(String current_title) { this.current_title = current_title; }

    public int getYears_experience() { return years_experience; }
    public void setYears_experience(int years_experience) { this.years_experience = years_experience; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCurrent_company() { return current_company; }
    public void setCurrent_company(String current_company) { this.current_company = current_company; }

    public String getCurrent_company_type() { return current_company_type; }
    public void setCurrent_company_type(String current_company_type) { this.current_company_type = current_company_type; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<PastCompany> getPast_companies() { return past_companies; }
    public void setPast_companies(List<PastCompany> past_companies) { this.past_companies = past_companies; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}

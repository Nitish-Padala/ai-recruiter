package com.airecruiter.service;

import com.airecruiter.model.CandidateProfile;
import com.airecruiter.model.PastCompany;
import com.airecruiter.model.SearchFilters;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CandidateFilterService {

    public List<CandidateProfile> filterCandidates(List<CandidateProfile> allCandidates, SearchFilters filters) {
        if (allCandidates == null || allCandidates.isEmpty()) {
            return new ArrayList<>();
        }

        int minExp = filters.getMinYearsExperience();
        int maxExp = filters.getMaxYearsExperience() > 0 ? filters.getMaxYearsExperience() : 99;
        String location = filters.getLocation() != null ? filters.getLocation().trim().toLowerCase() : "";
        List<String> companyTypes = filters.getCompanyTypes() != null
                ? filters.getCompanyTypes().stream().map(String::toLowerCase).collect(Collectors.toList())
                : new ArrayList<>();
        List<String> skills = filters.getSkills() != null
                ? filters.getSkills().stream().map(String::toLowerCase).collect(Collectors.toList())
                : new ArrayList<>();

        // Strict pass
        List<CandidateProfile> filtered = allCandidates.stream().filter(candidate -> {
            // 1. Experience match
            if (candidate.getYears_experience() < minExp || candidate.getYears_experience() > maxExp) {
                return false;
            }

            // 2. Location match
            if (!location.isEmpty() && !"any".equals(location) && !"remote".equals(location)) {
                String candLoc = candidate.getLocation().toLowerCase();
                if (!candLoc.contains(location) && !location.contains(candLoc)) {
                    return false;
                }
            }

            // 3. Company type match
            if (!companyTypes.isEmpty()) {
                boolean currMatch = companyTypes.contains(candidate.getCurrent_company_type().toLowerCase());
                boolean pastMatch = candidate.getPast_companies() != null && candidate.getPast_companies().stream()
                        .map(PastCompany::getType)
                        .anyMatch(t -> companyTypes.contains(t.toLowerCase()));
                if (!currMatch && !pastMatch) {
                    return false;
                }
            }

            // 4. Skills match
            if (!skills.isEmpty() && candidate.getSkills() != null) {
                List<String> candSkills = candidate.getSkills().stream().map(String::toLowerCase).collect(Collectors.toList());
                boolean hasSkill = skills.stream().anyMatch(s -> candSkills.stream().anyMatch(cs -> cs.contains(s) || s.contains(cs)));
                if (!hasSkill) {
                    return false;
                }
            }

            return true;
        }).collect(Collectors.toList());

        if (filtered.size() >= 3) {
            return filtered;
        }

        // Soft fallback
        List<CandidateProfile> relaxed = allCandidates.stream().filter(candidate -> {
            boolean expOk = candidate.getYears_experience() >= Math.max(0, minExp - 1) &&
                            candidate.getYears_experience() <= (maxExp + 1);
            boolean locOk = location.isEmpty() || "any".equals(location) ||
                            candidate.getLocation().toLowerCase().contains(location);
            return expOk && locOk;
        }).collect(Collectors.toList());

        return !relaxed.isEmpty() ? relaxed : allCandidates.stream().limit(5).collect(Collectors.toList());
    }
}

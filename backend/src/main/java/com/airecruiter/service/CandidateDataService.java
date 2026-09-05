package com.airecruiter.service;

import com.airecruiter.model.CandidateProfile;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class CandidateDataService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private List<CandidateProfile> candidatePool = new ArrayList<>();

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("profiles.json");
            try (InputStream is = resource.getInputStream()) {
                candidatePool = objectMapper.readValue(is, new TypeReference<List<CandidateProfile>>() {});
            }
        } catch (Exception e) {
            System.err.println("Failed to load profiles.json from classpath: " + e.getMessage());
        }
    }

    public List<CandidateProfile> getAllCandidates() {
        return candidatePool;
    }

    public int getTotalCount() {
        return candidatePool.size();
    }
}

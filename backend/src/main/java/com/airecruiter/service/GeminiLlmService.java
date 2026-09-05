package com.airecruiter.service;

import com.airecruiter.model.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class GeminiLlmService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-3.8-flash}")
    private String model;

    @Value("${gemini.thinking.level:LOW}")
    private String thinkingLevel;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String readPrompt(String promptName) {
        try {
            ClassPathResource resource = new ClassPathResource("prompts/" + promptName);
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Could not read prompt " + promptName, e);
        }
    }

    private String callGemini(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("GEMINI_API_KEY is not configured on the server.");
        }

        String endpoint = String.format("%s/%s:generateContent?key=%s", apiUrl, model, apiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("User-Agent", "aistudio-build");

        // Payload with configurable thinkingConfig (defaults to LOW for fast responses)
        String effectiveThinkingLevel = (thinkingLevel != null && !thinkingLevel.trim().isEmpty()) ? thinkingLevel.trim().toUpperCase() : "LOW";
        Map<String, Object> thinkingConfig = Map.of("thinkingLevel", effectiveThinkingLevel);
        Map<String, Object> config = Map.of("thinkingConfig", thinkingConfig);

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(textPart));
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(content),
                "generationConfig", config
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Gemini API call failed with status: " + response.getStatusCode());
        }

        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
            if (textNode.isMissingNode()) {
                throw new RuntimeException("Unexpected response format from Gemini: " + response.getBody());
            }
            return textNode.asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract text from Gemini response", e);
        }
    }

    private JsonNode parseCleanJson(String rawText) {
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "");
        }
        int firstBrace = cleaned.indexOf('{');
        int firstBracket = cleaned.indexOf('[');
        int startIdx = (firstBrace != -1 && (firstBracket == -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;
        if (startIdx != -1) {
            int lastBrace = cleaned.lastIndexOf('}');
            int lastBracket = cleaned.lastIndexOf(']');
            int endIdx = Math.max(lastBrace, lastBracket);
            if (endIdx > startIdx) {
                cleaned = cleaned.substring(startIdx, endIdx + 1);
            }
        }
        try {
            return objectMapper.readTree(cleaned);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse JSON: " + cleaned, e);
        }
    }

    public Map<String, Object> analyzeSearchRequirement(String query) {
        String template = readPrompt("search-analysis-prompt.txt");
        String prompt = template.replace("{{query}}", query);
        String rawOutput = callGemini(prompt);
        JsonNode jsonNode = parseCleanJson(rawOutput);

        SearchFilters filters = new SearchFilters();
        JsonNode fNode = jsonNode.get("filters");
        if (fNode != null) {
            if (fNode.has("skills") && fNode.get("skills").isArray()) {
                List<String> skills = new ArrayList<>();
                fNode.get("skills").forEach(s -> skills.add(s.asText()));
                filters.setSkills(skills);
            }
            filters.setMinYearsExperience(fNode.has("minYearsExperience") ? fNode.get("minYearsExperience").asInt(4) : 4);
            filters.setMaxYearsExperience(fNode.has("maxYearsExperience") ? fNode.get("maxYearsExperience").asInt(8) : 8);
            filters.setLocation(fNode.has("location") ? fNode.get("location").asText("Bangalore") : "Bangalore");
            if (fNode.has("companyTypes") && fNode.get("companyTypes").isArray()) {
                List<String> types = new ArrayList<>();
                fNode.get("companyTypes").forEach(t -> types.add(t.asText()));
                filters.setCompanyTypes(types);
            }
        }

        FitRubric rubric = new FitRubric();
        List<RubricCriterion> criteriaList = new ArrayList<>();
        JsonNode rNode = jsonNode.get("rubric");
        if (rNode != null && rNode.has("criteria") && rNode.get("criteria").isArray()) {
            rNode.get("criteria").forEach(c -> {
                criteriaList.add(new RubricCriterion(
                        c.has("name") ? c.get("name").asText() : "Criterion",
                        c.has("description") ? c.get("description").asText() : "",
                        c.has("weight") ? c.get("weight").asInt(20) : 20
                ));
            });
        }
        rubric.setCriteria(criteriaList);

        return Map.of("filters", filters, "rubric", rubric);
    }
}

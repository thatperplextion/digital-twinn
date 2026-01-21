package com.digitaltwin.common.dto;

import lombok.*;
import java.time.Instant;
import java.util.*;

/**
 * DTO for explainability - provides decision chain and root cause analysis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExplainabilityReport {
    
    private String id;
    private String twinId;
    private ReportType type;
    
    // Decision chain: Event → State → Decision
    @Builder.Default
    private List<DecisionStep> decisionChain = new ArrayList<>();
    
    // Contributing factors with weights
    @Builder.Default
    private Map<String, Double> contributingFactors = new HashMap<>();
    
    // Feature importance for ML decisions
    @Builder.Default
    private Map<String, Double> featureImportance = new HashMap<>();
    
    // Root cause analysis
    private RootCauseAnalysis rootCauseAnalysis;
    
    // Human-readable summary
    private String summary;
    private String detailedExplanation;
    
    // Timestamps
    private Instant generatedAt;
    
    // Confidence in explanation
    private Double explanationConfidence;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DecisionStep {
        private Integer stepNumber;
        private String stepType; // EVENT, STATE_CHANGE, PREDICTION, ACTION
        private String description;
        private Map<String, Object> data;
        private Instant timestamp;
        private String reasoning;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RootCauseAnalysis {
        private String primaryCause;
        @Builder.Default
        private List<String> contributingCauses = new ArrayList<>();
        @Builder.Default
        private Map<String, Double> causeConfidence = new HashMap<>();
        @Builder.Default
        private List<String> evidenceChain = new ArrayList<>();
        @Builder.Default
        private List<String> recommendations = new ArrayList<>();
    }
    
    public enum ReportType {
        STATE_TRANSITION,
        PREDICTION,
        ANOMALY_DETECTION,
        ACTION_DECISION,
        RISK_ASSESSMENT,
        FULL_AUDIT
    }
}

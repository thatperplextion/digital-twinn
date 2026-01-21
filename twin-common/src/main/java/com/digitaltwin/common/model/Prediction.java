package com.digitaltwin.common.model;

import lombok.*;
import java.time.Instant;
import java.util.*;

/**
 * Represents a prediction made by the Prediction Engine
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prediction {
    
    private String id;
    private String twinId;
    private PredictionType type;
    
    // Prediction details
    private String predictedState;
    private String predictedAction;
    
    // Probability distribution
    @Builder.Default
    private Map<String, Double> probabilityDistribution = new HashMap<>();
    
    // Confidence and scoring
    @Builder.Default
    private Double confidence = 0.0;
    @Builder.Default
    private Double accuracy = 0.0;
    
    // Time horizon
    private Instant predictionTime;
    private Instant targetTime;
    private Long horizonMs;
    
    // Risk assessment
    private Double riskScore;
    private String riskLevel;
    @Builder.Default
    private List<String> riskFactors = new ArrayList<>();
    
    // Explainability
    @Builder.Default
    private List<String> contributingFactors = new ArrayList<>();
    @Builder.Default
    private Map<String, Double> featureImportance = new HashMap<>();
    private String explanation;
    
    // Model information
    private String modelId;
    private String modelVersion;
    
    // Validation
    private Boolean validated;
    private String actualOutcome;
    private Instant validatedAt;
    
    public enum PredictionType {
        NEXT_ACTION,
        NEXT_STATE,
        RISK_FORECAST,
        FAILURE_PROBABILITY,
        BEHAVIORAL_TRAJECTORY,
        ANOMALY_PROBABILITY,
        RESOURCE_DEMAND,
        CUSTOM
    }
}

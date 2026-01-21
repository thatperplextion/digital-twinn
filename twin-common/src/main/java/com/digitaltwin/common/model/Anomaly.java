package com.digitaltwin.common.model;

import lombok.*;
import java.time.Instant;
import java.util.*;

/**
 * Represents a detected anomaly
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Anomaly {
    
    private String id;
    private String twinId;
    private AnomalyType type;
    private AnomalySeverity severity;
    
    // Detection details
    private Double anomalyScore;
    private Double threshold;
    private Double deviation;
    
    // Description
    private String title;
    private String description;
    
    // Affected properties
    @Builder.Default
    private List<String> affectedProperties = new ArrayList<>();
    @Builder.Default
    private Map<String, Object> expectedValues = new HashMap<>();
    @Builder.Default
    private Map<String, Object> actualValues = new HashMap<>();
    
    // Root cause analysis
    @Builder.Default
    private List<String> potentialCauses = new ArrayList<>();
    private String rootCause;
    @Builder.Default
    private Map<String, Double> causeConfidence = new HashMap<>();
    
    // Timing
    private Instant detectedAt;
    private Instant startedAt;
    private Instant resolvedAt;
    private Long durationMs;
    
    // Status
    private AnomalyStatus status;
    
    // Related events
    @Builder.Default
    private List<String> relatedEventIds = new ArrayList<>();
    
    // Actions taken
    @Builder.Default
    private List<String> triggeredActions = new ArrayList<>();
    
    // Explainability
    private String explanation;
    @Builder.Default
    private List<String> evidenceChain = new ArrayList<>();
    
    public enum AnomalyType {
        BEHAVIORAL_DEVIATION,
        TEMPORAL_ANOMALY,
        STATISTICAL_OUTLIER,
        SEQUENCE_IRREGULARITY,
        PATTERN_BREAK,
        THRESHOLD_VIOLATION,
        DRIFT_DETECTED,
        CUSTOM
    }
    
    public enum AnomalySeverity {
        CRITICAL, HIGH, MEDIUM, LOW, INFO
    }
    
    public enum AnomalyStatus {
        DETECTED, ACKNOWLEDGED, INVESTIGATING, 
        MITIGATING, RESOLVED, FALSE_POSITIVE
    }
}

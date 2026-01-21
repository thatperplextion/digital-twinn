package com.digitaltwin.common.dto;

import com.digitaltwin.common.model.DigitalTwin;
import com.digitaltwin.common.model.Prediction;
import com.digitaltwin.common.model.Anomaly;
import lombok.*;
import java.time.Instant;
import java.util.*;

/**
 * DTO for Digital Twin snapshot (current state view)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwinSnapshot {
    
    private String id;
    private String entityType;
    private String name;
    private String description;
    
    private Map<String, Object> staticAttributes;
    private Map<String, Object> dynamicState;
    private DigitalTwin.BehavioralMetrics behavioralMetrics;
    private DigitalTwin.TwinHealth health;
    
    private String currentStateName;
    private Double stateConfidence;
    
    private List<Prediction> activePredictions;
    private List<Anomaly> activeAnomalies;
    
    private Instant lastUpdatedAt;
    private Instant snapshotTime;
    private Long eventCount;
}

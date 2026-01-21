package com.digitaltwin.common.model;

import lombok.*;
import java.time.Instant;
import java.util.*;

/**
 * Represents a state of a Digital Twin at a point in time
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwinState {
    
    private String id;
    private String twinId;
    private String stateName;
    private StateType type;
    
    // State properties
    @Builder.Default
    private Map<String, Object> properties = new HashMap<>();
    
    // Confidence in this state
    @Builder.Default
    private Double confidence = 1.0;
    
    // Transition information
    private String previousStateId;
    private String transitionTrigger;
    private TransitionType transitionType;
    
    // Timing
    private Instant enteredAt;
    private Instant exitedAt;
    private Long durationMs;
    
    // Metadata
    @Builder.Default
    private Map<String, String> metadata = new HashMap<>();
    
    public enum StateType {
        INITIAL, ACTIVE, IDLE, TRANSITIONING, ALERT, 
        ANOMALOUS, PREDICTED, SIMULATED, TERMINAL
    }
    
    public enum TransitionType {
        RULE_BASED, PROBABILISTIC, ML_ASSISTED, 
        EVENT_DRIVEN, TIME_BASED, MANUAL, SYSTEM
    }
}

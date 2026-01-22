package com.digitaltwin.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.*;

/**
 * DTO for real-time streaming updates via WebSocket/SSE
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StreamUpdate {
    
    private String updateId;
    private UpdateType type;
    private String twinId;
    
    private Object payload;
    private Map<String, Object> changes;
    
    private Instant timestamp;
    private Long sequenceNumber;
    
    public enum UpdateType {
        STATE_CHANGE,
        METRIC_UPDATE,
        PREDICTION_NEW,
        PREDICTION_UPDATE,
        ANOMALY_DETECTED,
        ANOMALY_RESOLVED,
        ACTION_TRIGGERED,
        ACTION_COMPLETED,
        HEALTH_CHANGE,
        ALERT
    }
}

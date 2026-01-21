package com.digitaltwin.common.model;

import lombok.*;
import java.time.Instant;
import java.util.*;

/**
 * Represents an event that affects a Digital Twin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwinEvent {
    
    private String id;
    private String twinId;
    private String eventType;
    private EventCategory category;
    private EventPriority priority;
    
    // Event source
    private String source;
    private String sourceType;
    
    // Event payload
    @Builder.Default
    private Map<String, Object> payload = new HashMap<>();
    
    // Timing
    private Instant timestamp;
    private Instant receivedAt;
    private Instant processedAt;
    private Long processingLatencyMs;
    
    // Correlation
    private String correlationId;
    private String causationId;
    private String sessionId;
    
    // Processing status
    private ProcessingStatus status;
    
    // Metadata
    @Builder.Default
    private Map<String, String> headers = new HashMap<>();
    @Builder.Default
    private Map<String, String> metadata = new HashMap<>();
    
    // Tracing
    private String traceId;
    private String spanId;
    
    public enum EventCategory {
        BEHAVIORAL_ACTION,
        SENSOR_DATA,
        SYSTEM_LOG,
        TRANSACTION,
        TELEMETRY,
        ALERT,
        METRIC,
        CUSTOM
    }
    
    public enum EventPriority {
        CRITICAL, HIGH, MEDIUM, LOW
    }
    
    public enum ProcessingStatus {
        RECEIVED, VALIDATED, PROCESSING, PROCESSED, 
        FAILED, SKIPPED, DUPLICATE
    }
}

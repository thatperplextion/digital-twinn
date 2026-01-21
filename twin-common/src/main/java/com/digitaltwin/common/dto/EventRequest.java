package com.digitaltwin.common.dto;

import com.digitaltwin.common.model.TwinEvent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.HashMap;
import java.util.Map;

/**
 * DTO for receiving events from external sources
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRequest {
    
    @NotBlank(message = "Twin ID is required")
    private String twinId;
    
    @NotBlank(message = "Event type is required")
    private String eventType;
    
    @NotNull(message = "Event category is required")
    private TwinEvent.EventCategory category;
    
    @Builder.Default
    private TwinEvent.EventPriority priority = TwinEvent.EventPriority.MEDIUM;
    
    private String source;
    private String sourceType;
    
    @Builder.Default
    private Map<String, Object> payload = new HashMap<>();
    
    @Builder.Default
    private Map<String, String> headers = new HashMap<>();
    
    private String correlationId;
    private String sessionId;
}

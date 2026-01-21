package com.digitaltwin.common.dto;

import lombok.*;
import java.time.Instant;

/**
 * DTO for event processing response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private String eventId;
    private String twinId;
    private String status;
    private Instant receivedAt;
    private Long processingLatencyMs;
    private String message;
}

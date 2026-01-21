package com.digitaltwin.gateway.controller;

import com.digitaltwin.common.dto.StreamUpdate;
import com.digitaltwin.gateway.service.StreamingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.time.Duration;

/**
 * Server-Sent Events controller for one-way real-time streaming
 */
@RestController
@RequestMapping("/api/v1/stream")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "SSE Stream", description = "Server-Sent Events for real-time updates")
public class SSEController {
    
    private final StreamingService streamingService;
    
    @GetMapping(value = "/twins/{twinId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to twin updates", description = "Stream real-time updates for a specific digital twin")
    public Flux<ServerSentEvent<StreamUpdate>> streamTwinUpdates(@PathVariable String twinId) {
        log.info("SSE subscription started for twin: {}", twinId);
        
        return streamingService.subscribeToUpdates(twinId)
            .map(update -> ServerSentEvent.<StreamUpdate>builder()
                .id(update.getUpdateId())
                .event(update.getType().name())
                .data(update)
                .build())
            .doOnCancel(() -> log.info("SSE subscription cancelled for twin: {}", twinId));
    }
    
    @GetMapping(value = "/all", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to all updates", description = "Stream all digital twin updates")
    public Flux<ServerSentEvent<StreamUpdate>> streamAllUpdates() {
        log.info("SSE subscription started for all twins");
        
        return streamingService.subscribeToUpdates("*")
            .map(update -> ServerSentEvent.<StreamUpdate>builder()
                .id(update.getUpdateId())
                .event(update.getType().name())
                .data(update)
                .build());
    }
    
    @GetMapping(value = "/heartbeat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Heartbeat stream", description = "Periodic heartbeat for connection keep-alive")
    public Flux<ServerSentEvent<String>> heartbeat() {
        return Flux.interval(Duration.ofSeconds(30))
            .map(seq -> ServerSentEvent.<String>builder()
                .id(String.valueOf(seq))
                .event("heartbeat")
                .data("ping")
                .build());
    }
}

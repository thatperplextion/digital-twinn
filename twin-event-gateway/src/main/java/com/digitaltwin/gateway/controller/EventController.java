package com.digitaltwin.gateway.controller;

import com.digitaltwin.common.dto.EventRequest;
import com.digitaltwin.common.dto.EventResponse;
import com.digitaltwin.gateway.service.EventIngestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * REST Controller for event ingestion
 */
@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Event Gateway", description = "Real-time event ingestion API")
public class EventController {
    
    private final EventIngestionService eventIngestionService;
    
    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Ingest a single event", description = "Accepts and processes a single event for a digital twin")
    public Mono<EventResponse> ingestEvent(@Valid @RequestBody EventRequest request) {
        log.debug("Received event for twin: {}", request.getTwinId());
        return eventIngestionService.ingestEvent(request);
    }
    
    @PostMapping("/batch")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Ingest batch events", description = "Accepts and processes multiple events")
    public Flux<EventResponse> ingestBatchEvents(@Valid @RequestBody List<EventRequest> requests) {
        log.debug("Received batch of {} events", requests.size());
        return eventIngestionService.ingestBatchEvents(requests);
    }
    
    @PostMapping(value = "/stream", consumes = MediaType.APPLICATION_NDJSON_VALUE)
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Stream events", description = "Accepts a continuous stream of events")
    public Flux<EventResponse> streamEvents(@RequestBody Flux<EventRequest> eventStream) {
        log.debug("Starting event stream ingestion");
        return eventIngestionService.ingestEventStream(eventStream);
    }
    
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check event gateway health")
    public Mono<String> healthCheck() {
        return Mono.just("Event Gateway is healthy");
    }
}

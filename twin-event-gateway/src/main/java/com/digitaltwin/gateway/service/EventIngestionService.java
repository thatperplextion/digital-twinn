package com.digitaltwin.gateway.service;

import com.digitaltwin.common.dto.EventRequest;
import com.digitaltwin.common.dto.EventResponse;
import com.digitaltwin.common.model.TwinEvent;
import com.digitaltwin.common.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Instant;
import java.util.List;

/**
 * Service for ingesting and processing events
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventIngestionService {
    
    private final KafkaTemplate<String, TwinEvent> kafkaTemplate;
    private final EventValidationService validationService;
    private final MetricsService metricsService;
    
    private static final String EVENTS_TOPIC = "twin-events";
    
    /**
     * Ingest a single event
     */
    public Mono<EventResponse> ingestEvent(EventRequest request) {
        Instant receivedAt = Instant.now();
        
        return validationService.validateEvent(request)
            .flatMap(valid -> {
                if (!valid) {
                    return Mono.just(buildErrorResponse(request, receivedAt, "Validation failed"));
                }
                
                TwinEvent event = convertToEvent(request, receivedAt);
                return publishEvent(event)
                    .map(published -> buildSuccessResponse(event, receivedAt));
            })
            .doOnSuccess(response -> metricsService.recordEventProcessed(request.getTwinId()))
            .doOnError(e -> {
                log.error("Failed to process event for twin: {}", request.getTwinId(), e);
                metricsService.recordEventFailed(request.getTwinId());
            });
    }
    
    /**
     * Ingest batch of events
     */
    public Flux<EventResponse> ingestBatchEvents(List<EventRequest> requests) {
        return Flux.fromIterable(requests)
            .parallel()
            .runOn(Schedulers.parallel())
            .flatMap(this::ingestEvent)
            .sequential()
            .doOnComplete(() -> log.info("Batch processing completed for {} events", requests.size()));
    }
    
    /**
     * Ingest continuous stream of events
     */
    public Flux<EventResponse> ingestEventStream(Flux<EventRequest> eventStream) {
        return eventStream
            .flatMap(this::ingestEvent, 16) // Concurrency of 16
            .onBackpressureBuffer(10000) // Buffer up to 10k events
            .doOnSubscribe(sub -> log.info("Event stream ingestion started"))
            .doOnComplete(() -> log.info("Event stream ingestion completed"));
    }
    
    private TwinEvent convertToEvent(EventRequest request, Instant receivedAt) {
        return TwinEvent.builder()
            .id(IdGenerator.generateTimeBasedId("EVT"))
            .twinId(request.getTwinId())
            .eventType(request.getEventType())
            .category(request.getCategory())
            .priority(request.getPriority())
            .source(request.getSource())
            .sourceType(request.getSourceType())
            .payload(request.getPayload())
            .headers(request.getHeaders())
            .timestamp(Instant.now())
            .receivedAt(receivedAt)
            .correlationId(request.getCorrelationId() != null ? 
                request.getCorrelationId() : IdGenerator.generateCorrelationId())
            .sessionId(request.getSessionId())
            .status(TwinEvent.ProcessingStatus.RECEIVED)
            .traceId(IdGenerator.generateTraceId())
            .build();
    }
    
    private Mono<Boolean> publishEvent(TwinEvent event) {
        return Mono.fromFuture(() -> 
            kafkaTemplate.send(EVENTS_TOPIC, event.getTwinId(), event)
                .toCompletableFuture())
            .map(result -> {
                log.debug("Event published to Kafka: {} -> partition {}", 
                    event.getId(), result.getRecordMetadata().partition());
                return true;
            })
            .onErrorResume(e -> {
                log.error("Failed to publish event to Kafka: {}", event.getId(), e);
                return Mono.just(false);
            });
    }
    
    private EventResponse buildSuccessResponse(TwinEvent event, Instant receivedAt) {
        return EventResponse.builder()
            .eventId(event.getId())
            .twinId(event.getTwinId())
            .status("ACCEPTED")
            .receivedAt(receivedAt)
            .processingLatencyMs(Instant.now().toEpochMilli() - receivedAt.toEpochMilli())
            .message("Event accepted for processing")
            .build();
    }
    
    private EventResponse buildErrorResponse(EventRequest request, Instant receivedAt, String message) {
        return EventResponse.builder()
            .eventId(null)
            .twinId(request.getTwinId())
            .status("REJECTED")
            .receivedAt(receivedAt)
            .processingLatencyMs(Instant.now().toEpochMilli() - receivedAt.toEpochMilli())
            .message(message)
            .build();
    }
}

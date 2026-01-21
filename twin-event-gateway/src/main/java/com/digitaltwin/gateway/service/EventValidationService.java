package com.digitaltwin.gateway.service;

import com.digitaltwin.common.dto.EventRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Set;

/**
 * Service for validating incoming events
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventValidationService {
    
    private final ReactiveRedisTemplate<String, String> redisTemplate;
    
    private static final Set<String> VALID_EVENT_TYPES = Set.of(
        "USER_ACTION", "SENSOR_READING", "SYSTEM_EVENT", "TRANSACTION",
        "STATE_CHANGE", "ALERT", "METRIC", "HEARTBEAT", "CUSTOM"
    );
    
    /**
     * Validate an incoming event
     */
    public Mono<Boolean> validateEvent(EventRequest request) {
        return Mono.just(request)
            .flatMap(this::validateBasicFields)
            .flatMap(this::validateTwinExists)
            .flatMap(this::checkDuplicateEvent)
            .flatMap(this::validatePayloadSize)
            .doOnSuccess(valid -> {
                if (valid) {
                    log.debug("Event validation passed for twin: {}", request.getTwinId());
                } else {
                    log.warn("Event validation failed for twin: {}", request.getTwinId());
                }
            })
            .onErrorResume(e -> {
                log.error("Validation error for twin: {}", request.getTwinId(), e);
                return Mono.just(false);
            });
    }
    
    private Mono<Boolean> validateBasicFields(EventRequest request) {
        if (request.getTwinId() == null || request.getTwinId().isBlank()) {
            log.warn("Missing twin ID");
            return Mono.just(false);
        }
        if (request.getEventType() == null || request.getEventType().isBlank()) {
            log.warn("Missing event type");
            return Mono.just(false);
        }
        if (request.getCategory() == null) {
            log.warn("Missing event category");
            return Mono.just(false);
        }
        return Mono.just(true);
    }
    
    private Mono<Boolean> validateTwinExists(Boolean previousValid) {
        if (!previousValid) return Mono.just(false);
        // In production, check Redis/DB if twin exists
        // For now, accept all twin IDs (lazy creation)
        return Mono.just(true);
    }
    
    private Mono<Boolean> checkDuplicateEvent(Boolean previousValid) {
        if (!previousValid) return Mono.just(false);
        // Implement idempotency check using Redis
        // For now, accept all events
        return Mono.just(true);
    }
    
    private Mono<Boolean> validatePayloadSize(Boolean previousValid) {
        if (!previousValid) return Mono.just(false);
        // Payload size validation would go here
        return Mono.just(true);
    }
}

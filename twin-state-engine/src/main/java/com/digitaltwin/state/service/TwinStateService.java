package com.digitaltwin.state.service;

import com.digitaltwin.common.model.DigitalTwin;
import com.digitaltwin.common.model.TwinEvent;
import com.digitaltwin.common.model.TwinState;
import com.digitaltwin.common.dto.CreateTwinRequest;
import com.digitaltwin.common.dto.TwinSnapshot;
import com.digitaltwin.common.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.*;

/**
 * Core service for managing digital twin lifecycle and state
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TwinStateService {
    
    private final TwinRepository twinRepository;
    private final StateTransitionEngine transitionEngine;
    private final StateCache stateCache;
    private final BehavioralMetricsCalculator metricsCalculator;
    
    /**
     * Create a new digital twin
     */
    public Mono<DigitalTwin> createTwin(CreateTwinRequest request) {
        String twinId = IdGenerator.generateTimeBasedId("TWIN");
        Instant now = Instant.now();
        
        TwinState initialState = TwinState.builder()
            .id(IdGenerator.generateId("STATE"))
            .twinId(twinId)
            .stateName("INITIAL")
            .type(TwinState.StateType.INITIAL)
            .properties(request.getInitialState())
            .confidence(1.0)
            .transitionType(TwinState.TransitionType.SYSTEM)
            .enteredAt(now)
            .build();
        
        DigitalTwin twin = DigitalTwin.builder()
            .id(twinId)
            .entityType(request.getEntityType())
            .name(request.getName())
            .description(request.getDescription())
            .staticAttributes(request.getStaticAttributes())
            .dynamicState(request.getInitialState())
            .behavioralMetrics(DigitalTwin.BehavioralMetrics.builder().build())
            .temporalPatterns(DigitalTwin.TemporalPatterns.builder().build())
            .contextualMemory(DigitalTwin.ContextualMemory.builder().build())
            .currentState(initialState)
            .stateHistory(new ArrayList<>(List.of(initialState)))
            .health(DigitalTwin.TwinHealth.builder()
                .status(DigitalTwin.HealthStatus.HEALTHY)
                .healthScore(100.0)
                .lastHealthCheck(now)
                .build())
            .createdAt(now)
            .lastUpdatedAt(now)
            .tags(request.getTags())
            .tenantId(request.getTenantId())
            .version(1L)
            .build();
        
        return twinRepository.save(twin)
            .flatMap(saved -> stateCache.cacheTwin(saved).thenReturn(saved))
            .doOnSuccess(saved -> log.info("Created digital twin: {}", saved.getId()));
    }
    
    /**
     * Get a digital twin by ID
     */
    public Mono<DigitalTwin> getTwin(String twinId) {
        return stateCache.getCachedTwin(twinId)
            .switchIfEmpty(twinRepository.findById(twinId)
                .flatMap(twin -> stateCache.cacheTwin(twin).thenReturn(twin)));
    }
    
    /**
     * Get a snapshot of a digital twin
     */
    public Mono<TwinSnapshot> getTwinSnapshot(String twinId) {
        return getTwin(twinId)
            .map(twin -> TwinSnapshot.builder()
                .id(twin.getId())
                .entityType(twin.getEntityType())
                .name(twin.getName())
                .description(twin.getDescription())
                .staticAttributes(twin.getStaticAttributes())
                .dynamicState(twin.getDynamicState())
                .behavioralMetrics(twin.getBehavioralMetrics())
                .health(twin.getHealth())
                .currentStateName(twin.getCurrentState() != null ? 
                    twin.getCurrentState().getStateName() : null)
                .stateConfidence(twin.getCurrentState() != null ? 
                    twin.getCurrentState().getConfidence() : null)
                .lastUpdatedAt(twin.getLastUpdatedAt())
                .snapshotTime(Instant.now())
                .build());
    }
    
    /**
     * Process an event and update twin state
     */
    public Mono<DigitalTwin> processEvent(TwinEvent event) {
        Instant startTime = Instant.now();
        
        return getTwin(event.getTwinId())
            .switchIfEmpty(createTwinFromEvent(event))
            .flatMap(twin -> {
                // Update dynamic state from event payload
                Map<String, Object> newDynamicState = new HashMap<>(twin.getDynamicState());
                newDynamicState.putAll(event.getPayload());
                twin.setDynamicState(newDynamicState);
                
                // Perform state transition
                return transitionEngine.evaluateTransition(twin, event)
                    .flatMap(newState -> {
                        if (newState.isPresent()) {
                            return applyStateTransition(twin, newState.get(), event);
                        }
                        return Mono.just(twin);
                    });
            })
            .flatMap(twin -> {
                // Update behavioral metrics
                return metricsCalculator.updateMetrics(twin, event);
            })
            .flatMap(twin -> {
                // Update timestamps
                twin.setLastUpdatedAt(Instant.now());
                twin.setLastEventAt(event.getTimestamp());
                twin.setVersion(twin.getVersion() + 1);
                
                // Persist and cache
                return twinRepository.save(twin)
                    .flatMap(saved -> stateCache.cacheTwin(saved).thenReturn(saved));
            })
            .doOnSuccess(twin -> {
                long latency = Instant.now().toEpochMilli() - startTime.toEpochMilli();
                log.debug("Processed event {} for twin {} in {}ms", 
                    event.getId(), twin.getId(), latency);
            });
    }
    
    /**
     * Apply a state transition
     */
    private Mono<DigitalTwin> applyStateTransition(DigitalTwin twin, TwinState newState, TwinEvent trigger) {
        TwinState currentState = twin.getCurrentState();
        
        if (currentState != null) {
            currentState.setExitedAt(Instant.now());
            currentState.setDurationMs(
                currentState.getExitedAt().toEpochMilli() - currentState.getEnteredAt().toEpochMilli());
            twin.getStateHistory().add(currentState);
        }
        
        newState.setTwinId(twin.getId());
        newState.setPreviousStateId(currentState != null ? currentState.getId() : null);
        newState.setTransitionTrigger(trigger.getId());
        newState.setEnteredAt(Instant.now());
        
        twin.setCurrentState(newState);
        
        // Update contextual memory
        twin.getContextualMemory().getRecentActions().add(0, trigger.getEventType());
        if (twin.getContextualMemory().getRecentActions().size() > 100) {
            twin.getContextualMemory().setRecentActions(
                twin.getContextualMemory().getRecentActions().subList(0, 100));
        }
        
        log.info("State transition for twin {}: {} -> {}", 
            twin.getId(), 
            currentState != null ? currentState.getStateName() : "null",
            newState.getStateName());
        
        return Mono.just(twin);
    }
    
    /**
     * Create a twin from an event (lazy creation)
     */
    private Mono<DigitalTwin> createTwinFromEvent(TwinEvent event) {
        CreateTwinRequest request = CreateTwinRequest.builder()
            .entityType(event.getSourceType() != null ? event.getSourceType() : "UNKNOWN")
            .name("Auto-created: " + event.getTwinId())
            .initialState(event.getPayload())
            .build();
        
        // Override the generated ID with the event's twin ID
        return createTwin(request)
            .map(twin -> {
                twin.setId(event.getTwinId());
                return twin;
            })
            .flatMap(twinRepository::save);
    }
    
    /**
     * Get all twins
     */
    public Flux<DigitalTwin> getAllTwins() {
        return twinRepository.findAll();
    }
    
    /**
     * Get twins by entity type
     */
    public Flux<DigitalTwin> getTwinsByEntityType(String entityType) {
        return twinRepository.findByEntityType(entityType);
    }
    
    /**
     * Delete a twin
     */
    public Mono<Void> deleteTwin(String twinId) {
        return twinRepository.deleteById(twinId)
            .then(stateCache.removeTwin(twinId))
            .doOnSuccess(v -> log.info("Deleted digital twin: {}", twinId));
    }
}

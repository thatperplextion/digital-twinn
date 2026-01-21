package com.digitaltwin.dashboard.service;

import com.digitaltwin.common.dto.*;
import com.digitaltwin.common.model.*;
import com.digitaltwin.common.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

import java.time.Instant;
import java.util.*;

/**
 * Main dashboard service that aggregates data from all microservices
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {
    
    private final WebClient.Builder webClientBuilder;
    
    // Service URLs (in production, use service discovery)
    private static final String EVENT_GATEWAY_URL = "http://localhost:8081";
    private static final String STATE_ENGINE_URL = "http://localhost:8082";
    private static final String PREDICTION_ENGINE_URL = "http://localhost:8083";
    private static final String ANOMALY_ENGINE_URL = "http://localhost:8084";
    private static final String ACTION_ENGINE_URL = "http://localhost:8085";
    
    // In-memory store for demo (in production, query from services)
    private final Map<String, DigitalTwin> twinStore = new HashMap<>();
    private final Map<String, List<Prediction>> predictionStore = new HashMap<>();
    private final Map<String, List<Anomaly>> anomalyStore = new HashMap<>();
    private final Map<String, List<Action>> actionStore = new HashMap<>();
    
    // Stream sink for real-time updates
    private final Sinks.Many<StreamUpdate> updateSink = 
        Sinks.many().multicast().onBackpressureBuffer(10000);
    
    // ==================== Twin Management ====================
    
    public Flux<TwinSnapshot> getAllTwins(String entityType, String tenantId) {
        return Flux.fromIterable(twinStore.values())
            .filter(twin -> entityType == null || twin.getEntityType().equals(entityType))
            .filter(twin -> tenantId == null || tenantId.equals(twin.getTenantId()))
            .map(this::toSnapshot);
    }
    
    public Mono<TwinSnapshot> getTwinSnapshot(String twinId) {
        return Mono.justOrEmpty(twinStore.get(twinId))
            .map(this::toSnapshot)
            .switchIfEmpty(Mono.error(new RuntimeException("Twin not found: " + twinId)));
    }
    
    public Mono<DigitalTwin> createTwin(CreateTwinRequest request) {
        DigitalTwin twin = DigitalTwin.builder()
            .id(IdGenerator.generateTimeBasedId("TWIN"))
            .entityType(request.getEntityType())
            .name(request.getName())
            .description(request.getDescription())
            .staticAttributes(request.getStaticAttributes())
            .dynamicState(request.getInitialState())
            .behavioralMetrics(DigitalTwin.BehavioralMetrics.builder()
                .activityScore(0.5)
                .riskScore(0.1)
                .anomalyScore(0.0)
                .engagementScore(0.5)
                .performanceScore(0.8)
                .build())
            .temporalPatterns(DigitalTwin.TemporalPatterns.builder().build())
            .contextualMemory(DigitalTwin.ContextualMemory.builder().build())
            .currentState(TwinState.builder()
                .id(IdGenerator.generateId("STATE"))
                .stateName("INITIAL")
                .type(TwinState.StateType.INITIAL)
                .confidence(1.0)
                .enteredAt(Instant.now())
                .build())
            .stateHistory(new ArrayList<>())
            .health(DigitalTwin.TwinHealth.builder()
                .status(DigitalTwin.HealthStatus.HEALTHY)
                .healthScore(100.0)
                .lastHealthCheck(Instant.now())
                .build())
            .createdAt(Instant.now())
            .lastUpdatedAt(Instant.now())
            .tags(request.getTags())
            .tenantId(request.getTenantId())
            .version(1L)
            .build();
        
        twinStore.put(twin.getId(), twin);
        
        // Publish update
        publishUpdate(StreamUpdate.builder()
            .updateId(IdGenerator.generateId())
            .type(StreamUpdate.UpdateType.STATE_CHANGE)
            .twinId(twin.getId())
            .payload(twin)
            .timestamp(Instant.now())
            .build());
        
        return Mono.just(twin);
    }
    
    public Mono<Void> deleteTwin(String twinId) {
        twinStore.remove(twinId);
        predictionStore.remove(twinId);
        anomalyStore.remove(twinId);
        actionStore.remove(twinId);
        return Mono.empty();
    }
    
    // ==================== State ====================
    
    public Mono<TwinState> getCurrentState(String twinId) {
        return Mono.justOrEmpty(twinStore.get(twinId))
            .map(DigitalTwin::getCurrentState);
    }
    
    public Flux<TwinState> getStateHistory(String twinId, int limit) {
        return Mono.justOrEmpty(twinStore.get(twinId))
            .flatMapMany(twin -> Flux.fromIterable(twin.getStateHistory()))
            .take(limit);
    }
    
    // ==================== Predictions ====================
    
    public Flux<Prediction> getPredictions(String twinId) {
        return Flux.fromIterable(predictionStore.getOrDefault(twinId, List.of()));
    }
    
    public Mono<Map<String, Prediction>> getLatestPredictions(String twinId) {
        Map<String, Prediction> latest = new HashMap<>();
        List<Prediction> predictions = predictionStore.getOrDefault(twinId, List.of());
        
        for (Prediction p : predictions) {
            String type = p.getType().name();
            if (!latest.containsKey(type) || 
                p.getPredictionTime().isAfter(latest.get(type).getPredictionTime())) {
                latest.put(type, p);
            }
        }
        
        return Mono.just(latest);
    }
    
    // ==================== Anomalies ====================
    
    public Flux<Anomaly> getAnomalies(String twinId, boolean activeOnly) {
        return Flux.fromIterable(anomalyStore.getOrDefault(twinId, List.of()))
            .filter(a -> !activeOnly || a.getStatus() != Anomaly.AnomalyStatus.RESOLVED);
    }
    
    public Mono<Anomaly> resolveAnomaly(String anomalyId, String resolution) {
        for (List<Anomaly> anomalies : anomalyStore.values()) {
            for (Anomaly a : anomalies) {
                if (a.getId().equals(anomalyId)) {
                    a.setStatus(Anomaly.AnomalyStatus.RESOLVED);
                    a.setResolvedAt(Instant.now());
                    a.setRootCause(resolution);
                    return Mono.just(a);
                }
            }
        }
        return Mono.empty();
    }
    
    // ==================== Actions ====================
    
    public Flux<Action> getActions(String twinId) {
        return Flux.fromIterable(actionStore.getOrDefault(twinId, List.of()));
    }
    
    public Mono<Action> cancelAction(String actionId, String reason) {
        for (List<Action> actions : actionStore.values()) {
            for (Action a : actions) {
                if (a.getId().equals(actionId)) {
                    a.setStatus(Action.ActionStatus.CANCELLED);
                    a.getAuditLog().add("Cancelled: " + reason);
                    return Mono.just(a);
                }
            }
        }
        return Mono.empty();
    }
    
    // ==================== Metrics ====================
    
    public Mono<DigitalTwin.BehavioralMetrics> getMetrics(String twinId) {
        return Mono.justOrEmpty(twinStore.get(twinId))
            .map(DigitalTwin::getBehavioralMetrics);
    }
    
    public Mono<DigitalTwin.TemporalPatterns> getTemporalPatterns(String twinId) {
        return Mono.justOrEmpty(twinStore.get(twinId))
            .map(DigitalTwin::getTemporalPatterns);
    }
    
    // ==================== Explainability ====================
    
    public Mono<ExplainabilityReport> getExplainabilityReport(String twinId) {
        return Mono.justOrEmpty(twinStore.get(twinId))
            .map(twin -> ExplainabilityReport.builder()
                .id(IdGenerator.generateId("EXPLAIN"))
                .twinId(twinId)
                .type(ExplainabilityReport.ReportType.FULL_AUDIT)
                .summary("Digital twin analysis report")
                .generatedAt(Instant.now())
                .explanationConfidence(0.9)
                .build());
    }
    
    public Mono<ExplainabilityReport> getActionExplainability(String actionId) {
        return Mono.just(ExplainabilityReport.builder()
            .id(IdGenerator.generateId("EXPLAIN"))
            .type(ExplainabilityReport.ReportType.ACTION_DECISION)
            .summary("Action explanation")
            .generatedAt(Instant.now())
            .build());
    }
    
    // ==================== Streaming ====================
    
    public Flux<StreamUpdate> streamUpdates(String twinId) {
        return updateSink.asFlux()
            .filter(update -> twinId.equals(update.getTwinId()));
    }
    
    public Flux<StreamUpdate> streamAllUpdates() {
        return updateSink.asFlux();
    }
    
    public void publishUpdate(StreamUpdate update) {
        updateSink.tryEmitNext(update);
    }
    
    // ==================== System Status ====================
    
    public Mono<Map<String, Object>> getSystemStatus() {
        return Mono.just(Map.of(
            "status", "HEALTHY",
            "timestamp", Instant.now().toString(),
            "services", Map.of(
                "eventGateway", "UP",
                "stateEngine", "UP",
                "predictionEngine", "UP",
                "anomalyEngine", "UP",
                "actionEngine", "UP"
            )
        ));
    }
    
    public Mono<Map<String, Object>> getPlatformStats() {
        return Mono.just(Map.of(
            "totalTwins", twinStore.size(),
            "activePredictions", predictionStore.values().stream().mapToInt(List::size).sum(),
            "activeAnomalies", anomalyStore.values().stream()
                .flatMap(List::stream)
                .filter(a -> a.getStatus() != Anomaly.AnomalyStatus.RESOLVED)
                .count(),
            "pendingActions", actionStore.values().stream()
                .flatMap(List::stream)
                .filter(a -> a.getStatus() == Action.ActionStatus.PENDING)
                .count(),
            "timestamp", Instant.now().toString()
        ));
    }
    
    // ==================== Helper Methods ====================
    
    private TwinSnapshot toSnapshot(DigitalTwin twin) {
        return TwinSnapshot.builder()
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
            .build();
    }
    
    // For demo: add data stores access
    public Map<String, DigitalTwin> getTwinStore() { return twinStore; }
    public Map<String, List<Prediction>> getPredictionStore() { return predictionStore; }
    public Map<String, List<Anomaly>> getAnomalyStore() { return anomalyStore; }
    public Map<String, List<Action>> getActionStore() { return actionStore; }
}

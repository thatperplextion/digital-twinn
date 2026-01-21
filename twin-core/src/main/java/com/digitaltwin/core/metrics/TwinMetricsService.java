package com.digitaltwin.core.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Centralized metrics service for all microservices
 */
@Component
public class TwinMetricsService {
    
    private final MeterRegistry meterRegistry;
    private final ConcurrentHashMap<String, Counter> counters = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Timer> timers = new ConcurrentHashMap<>();
    
    public TwinMetricsService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }
    
    // Event Metrics
    public void recordEventReceived(String eventType) {
        getCounter("twin.events.received", "type", eventType).increment();
    }
    
    public void recordEventProcessed(String eventType, long processingTimeMs) {
        getCounter("twin.events.processed", "type", eventType).increment();
        getTimer("twin.events.processing.time", "type", eventType)
            .record(Duration.ofMillis(processingTimeMs));
    }
    
    public void recordEventError(String eventType, String errorType) {
        getCounter("twin.events.errors", "type", eventType, "error", errorType).increment();
    }
    
    // State Metrics
    public void recordStateTransition(String fromState, String toState) {
        getCounter("twin.state.transitions", "from", fromState, "to", toState).increment();
    }
    
    public void recordStateUpdateLatency(long latencyMs) {
        getTimer("twin.state.update.latency").record(Duration.ofMillis(latencyMs));
    }
    
    // Prediction Metrics
    public void recordPredictionGenerated(String predictionType) {
        getCounter("twin.predictions.generated", "type", predictionType).increment();
    }
    
    public void recordPredictionAccuracy(String predictionType, double accuracy) {
        meterRegistry.gauge("twin.predictions.accuracy", 
            io.micrometer.core.instrument.Tags.of("type", predictionType), accuracy);
    }
    
    // Anomaly Metrics
    public void recordAnomalyDetected(String anomalyType, String severity) {
        getCounter("twin.anomalies.detected", "type", anomalyType, "severity", severity).increment();
    }
    
    public void recordAnomalyResolved(String anomalyType) {
        getCounter("twin.anomalies.resolved", "type", anomalyType).increment();
    }
    
    // Action Metrics
    public void recordActionTriggered(String actionType) {
        getCounter("twin.actions.triggered", "type", actionType).increment();
    }
    
    public void recordActionCompleted(String actionType, boolean success) {
        getCounter("twin.actions.completed", "type", actionType, 
            "success", String.valueOf(success)).increment();
    }
    
    // Twin Metrics
    public void recordTwinCreated(String entityType) {
        getCounter("twin.created", "entityType", entityType).increment();
    }
    
    public void recordTwinDeleted(String entityType) {
        getCounter("twin.deleted", "entityType", entityType).increment();
    }
    
    public void recordActiveTwins(long count) {
        meterRegistry.gauge("twin.active.count", count);
    }
    
    // Helper methods
    private Counter getCounter(String name, String... tags) {
        String key = name + String.join("", tags);
        return counters.computeIfAbsent(key, k -> 
            Counter.builder(name)
                .tags(tags)
                .register(meterRegistry));
    }
    
    private Timer getTimer(String name, String... tags) {
        String key = name + String.join("", tags);
        return timers.computeIfAbsent(key, k -> 
            Timer.builder(name)
                .tags(tags)
                .register(meterRegistry));
    }
}

package com.digitaltwin.gateway.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service for collecting and reporting metrics
 */
@Service
@Slf4j
public class MetricsService {
    
    private final MeterRegistry meterRegistry;
    
    private final Counter eventsProcessedCounter;
    private final Counter eventsFailedCounter;
    private final Timer eventProcessingTimer;
    
    private final Map<String, AtomicLong> twinEventCounts = new ConcurrentHashMap<>();
    
    public MetricsService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        
        this.eventsProcessedCounter = Counter.builder("twin.events.processed")
            .description("Total events processed")
            .register(meterRegistry);
        
        this.eventsFailedCounter = Counter.builder("twin.events.failed")
            .description("Total events failed")
            .register(meterRegistry);
        
        this.eventProcessingTimer = Timer.builder("twin.events.processing.time")
            .description("Event processing time")
            .register(meterRegistry);
    }
    
    public void recordEventProcessed(String twinId) {
        eventsProcessedCounter.increment();
        twinEventCounts.computeIfAbsent(twinId, k -> new AtomicLong(0)).incrementAndGet();
    }
    
    public void recordEventFailed(String twinId) {
        eventsFailedCounter.increment();
    }
    
    public void recordProcessingTime(long durationMs) {
        eventProcessingTimer.record(durationMs, TimeUnit.MILLISECONDS);
    }
    
    public long getTotalEventsProcessed() {
        return (long) eventsProcessedCounter.count();
    }
    
    public long getTotalEventsFailed() {
        return (long) eventsFailedCounter.count();
    }
    
    public long getEventsForTwin(String twinId) {
        AtomicLong count = twinEventCounts.get(twinId);
        return count != null ? count.get() : 0;
    }
}

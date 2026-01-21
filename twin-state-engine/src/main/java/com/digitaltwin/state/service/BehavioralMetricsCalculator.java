package com.digitaltwin.state.service;

import com.digitaltwin.common.model.DigitalTwin;
import com.digitaltwin.common.model.TwinEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Calculator for behavioral metrics of digital twins
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BehavioralMetricsCalculator {
    
    private static final DateTimeFormatter HOUR_FORMAT = DateTimeFormatter.ofPattern("HH");
    private static final DateTimeFormatter DAY_FORMAT = DateTimeFormatter.ofPattern("EEEE");
    
    /**
     * Update behavioral metrics based on new event
     */
    public Mono<DigitalTwin> updateMetrics(DigitalTwin twin, TwinEvent event) {
        return Mono.fromCallable(() -> {
            DigitalTwin.BehavioralMetrics metrics = twin.getBehavioralMetrics();
            if (metrics == null) {
                metrics = DigitalTwin.BehavioralMetrics.builder().build();
                twin.setBehavioralMetrics(metrics);
            }
            
            // Update activity score
            updateActivityScore(metrics, event);
            
            // Update risk score
            updateRiskScore(metrics, event, twin);
            
            // Update engagement score
            updateEngagementScore(metrics, event, twin);
            
            // Update performance score
            updatePerformanceScore(metrics, event);
            
            // Update temporal patterns
            updateTemporalPatterns(twin.getTemporalPatterns(), event);
            
            metrics.setLastCalculatedAt(Instant.now());
            
            return twin;
        });
    }
    
    private void updateActivityScore(DigitalTwin.BehavioralMetrics metrics, TwinEvent event) {
        double currentScore = metrics.getActivityScore();
        double eventWeight = getEventWeight(event);
        
        // Exponential moving average
        double alpha = 0.1;
        double newScore = (alpha * eventWeight) + ((1 - alpha) * currentScore);
        
        metrics.setActivityScore(Math.min(1.0, Math.max(0.0, newScore)));
    }
    
    private void updateRiskScore(DigitalTwin.BehavioralMetrics metrics, TwinEvent event, DigitalTwin twin) {
        double currentRisk = metrics.getRiskScore();
        
        // Risk factors
        double priorityRisk = switch (event.getPriority()) {
            case CRITICAL -> 0.9;
            case HIGH -> 0.6;
            case MEDIUM -> 0.3;
            case LOW -> 0.1;
        };
        
        double anomalyContribution = metrics.getAnomalyScore() * 0.5;
        
        // Calculate new risk score
        double alpha = 0.2;
        double newRisk = (alpha * (priorityRisk + anomalyContribution) / 2) + ((1 - alpha) * currentRisk);
        
        metrics.setRiskScore(Math.min(1.0, Math.max(0.0, newRisk)));
    }
    
    private void updateEngagementScore(DigitalTwin.BehavioralMetrics metrics, TwinEvent event, DigitalTwin twin) {
        double currentEngagement = metrics.getEngagementScore();
        
        // Factors affecting engagement
        double recency = 1.0; // Most recent event is most impactful
        double frequency = calculateEventFrequency(twin);
        double diversity = calculateEventDiversity(twin);
        
        double engagementFactor = (recency * 0.4) + (frequency * 0.3) + (diversity * 0.3);
        
        double alpha = 0.15;
        double newEngagement = (alpha * engagementFactor) + ((1 - alpha) * currentEngagement);
        
        metrics.setEngagementScore(Math.min(1.0, Math.max(0.0, newEngagement)));
    }
    
    private void updatePerformanceScore(DigitalTwin.BehavioralMetrics metrics, TwinEvent event) {
        double currentPerformance = metrics.getPerformanceScore();
        
        // Performance based on event processing latency
        long latency = event.getProcessingLatencyMs() != null ? event.getProcessingLatencyMs() : 0;
        double latencyScore = Math.max(0, 1.0 - (latency / 1000.0)); // 1 second = 0 score
        
        double alpha = 0.1;
        double newPerformance = (alpha * latencyScore) + ((1 - alpha) * currentPerformance);
        
        metrics.setPerformanceScore(Math.min(1.0, Math.max(0.0, newPerformance)));
    }
    
    private void updateTemporalPatterns(DigitalTwin.TemporalPatterns patterns, TwinEvent event) {
        if (patterns == null) return;
        
        Instant eventTime = event.getTimestamp();
        String hour = HOUR_FORMAT.format(eventTime.atZone(ZoneId.systemDefault()));
        String day = DAY_FORMAT.format(eventTime.atZone(ZoneId.systemDefault()));
        
        // Update hourly activity
        patterns.getHourlyActivity().merge(hour, 1, Integer::sum);
        
        // Update daily activity
        patterns.getDailyActivity().merge(day, 1, Integer::sum);
        
        // Identify peak hours
        int maxActivity = patterns.getHourlyActivity().values().stream()
            .max(Integer::compare).orElse(0);
        
        if (maxActivity > 0) {
            patterns.setPeakActivityTimes(
                patterns.getHourlyActivity().entrySet().stream()
                    .filter(e -> e.getValue() >= maxActivity * 0.8)
                    .map(Map.Entry::getKey)
                    .toList()
            );
        }
    }
    
    private double getEventWeight(TwinEvent event) {
        return switch (event.getPriority()) {
            case CRITICAL -> 1.0;
            case HIGH -> 0.75;
            case MEDIUM -> 0.5;
            case LOW -> 0.25;
        };
    }
    
    private double calculateEventFrequency(DigitalTwin twin) {
        // Calculate events per hour based on temporal patterns
        Map<String, Integer> hourlyActivity = twin.getTemporalPatterns().getHourlyActivity();
        if (hourlyActivity.isEmpty()) return 0.5;
        
        double avgEvents = hourlyActivity.values().stream()
            .mapToInt(Integer::intValue)
            .average()
            .orElse(0.0);
        
        // Normalize to 0-1 (assuming 100 events/hour is max)
        return Math.min(1.0, avgEvents / 100.0);
    }
    
    private double calculateEventDiversity(DigitalTwin twin) {
        List<String> recentActions = twin.getContextualMemory().getRecentActions();
        if (recentActions.isEmpty()) return 0.5;
        
        // Count unique event types
        Set<String> uniqueTypes = new HashSet<>(recentActions);
        
        // Diversity = unique types / total actions (max 1.0)
        return Math.min(1.0, (double) uniqueTypes.size() / Math.min(recentActions.size(), 20));
    }
}

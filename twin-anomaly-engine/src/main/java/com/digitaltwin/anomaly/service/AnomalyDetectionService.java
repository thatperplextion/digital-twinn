package com.digitaltwin.anomaly.service;

import com.digitaltwin.common.model.Anomaly;
import com.digitaltwin.common.model.DigitalTwin;
import com.digitaltwin.common.model.TwinEvent;
import com.digitaltwin.common.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Core anomaly detection service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnomalyDetectionService {
    
    private final AnomalyCache anomalyCache;
    private final AlertService alertService;
    
    // Statistical windows for anomaly detection
    private final Map<String, DescriptiveStatistics> twinStatistics = new HashMap<>();
    
    private static final double Z_SCORE_THRESHOLD = 2.5;
    private static final double IQR_MULTIPLIER = 1.5;
    
    /**
     * Detect anomalies for a digital twin based on new event
     */
    public Mono<List<Anomaly>> detectAnomalies(DigitalTwin twin, TwinEvent event) {
        return Flux.merge(
            detectBehavioralDeviation(twin, event),
            detectTemporalAnomaly(twin, event),
            detectStatisticalOutlier(twin, event),
            detectSequenceIrregularity(twin, event),
            detectThresholdViolation(twin, event),
            detectDrift(twin)
        )
        .filter(Optional::isPresent)
        .map(Optional::get)
        .collectList()
        .flatMap(anomalies -> {
            if (!anomalies.isEmpty()) {
                // Update twin's anomaly score
                double maxScore = anomalies.stream()
                    .mapToDouble(Anomaly::getAnomalyScore)
                    .max().orElse(0);
                twin.getBehavioralMetrics().setAnomalyScore(maxScore);
                
                // Send alerts for critical anomalies
                return Flux.fromIterable(anomalies)
                    .filter(a -> a.getSeverity() == Anomaly.AnomalySeverity.CRITICAL ||
                                 a.getSeverity() == Anomaly.AnomalySeverity.HIGH)
                    .flatMap(alertService::sendAlert)
                    .then(cacheAnomalies(twin.getId(), anomalies));
            }
            return Mono.just(anomalies);
        })
        .doOnSuccess(anomalies -> {
            if (!anomalies.isEmpty()) {
                log.info("Detected {} anomalies for twin: {}", anomalies.size(), twin.getId());
            }
        });
    }
    
    /**
     * Detect behavioral deviations
     */
    public Mono<Optional<Anomaly>> detectBehavioralDeviation(DigitalTwin twin, TwinEvent event) {
        return Mono.fromCallable(() -> {
            List<String> recentActions = twin.getContextualMemory().getRecentActions();
            List<String> frequentPatterns = twin.getContextualMemory().getFrequentPatterns();
            
            if (recentActions.isEmpty() || frequentPatterns.isEmpty()) {
                return Optional.empty();
            }
            
            String currentAction = event.getEventType();
            
            // Check if current action is unusual
            Map<String, Long> actionFrequency = recentActions.stream()
                .collect(Collectors.groupingBy(a -> a, Collectors.counting()));
            
            long totalActions = recentActions.size();
            long currentActionCount = actionFrequency.getOrDefault(currentAction, 0L);
            double actionFrequencyRatio = (double) currentActionCount / totalActions;
            
            // Action is anomalous if it's very rare (< 1% of history) but happening now
            if (actionFrequencyRatio < 0.01 && totalActions > 50) {
                double anomalyScore = 1.0 - actionFrequencyRatio;
                
                return Optional.of(createAnomaly(
                    twin.getId(),
                    Anomaly.AnomalyType.BEHAVIORAL_DEVIATION,
                    determineSeverity(anomalyScore),
                    anomalyScore,
                    0.01,
                    "Unusual Action Detected",
                    String.format("Action '%s' is rare (%.2f%% of history)", currentAction, actionFrequencyRatio * 100),
                    List.of(currentAction),
                    List.of("First occurrence of action type", "Pattern break from normal behavior"),
                    event.getId()
                ));
            }
            
            return Optional.empty();
        });
    }
    
    /**
     * Detect temporal anomalies (unusual timing)
     */
    public Mono<Optional<Anomaly>> detectTemporalAnomaly(DigitalTwin twin, TwinEvent event) {
        return Mono.fromCallable(() -> {
            Map<String, Integer> hourlyActivity = twin.getTemporalPatterns().getHourlyActivity();
            List<String> dormantPeriods = twin.getTemporalPatterns().getDormantPeriods();
            
            if (hourlyActivity.isEmpty()) {
                return Optional.empty();
            }
            
            String currentHour = String.format("%02d", 
                event.getTimestamp().atZone(java.time.ZoneId.systemDefault()).getHour());
            
            // Check if activity during dormant period
            if (dormantPeriods.contains(currentHour)) {
                return Optional.of(createAnomaly(
                    twin.getId(),
                    Anomaly.AnomalyType.TEMPORAL_ANOMALY,
                    Anomaly.AnomalySeverity.MEDIUM,
                    0.7,
                    0.0,
                    "Activity During Dormant Period",
                    String.format("Activity detected at hour %s, which is typically dormant", currentHour),
                    List.of("timestamp", "activity_period"),
                    List.of("Activity outside normal hours", "Potential unauthorized access"),
                    event.getId()
                ));
            }
            
            // Check for unusually high activity in a normally quiet hour
            int currentHourActivity = hourlyActivity.getOrDefault(currentHour, 0);
            double avgActivity = hourlyActivity.values().stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0);
            
            if (avgActivity > 0 && currentHourActivity > avgActivity * 3) {
                double deviation = currentHourActivity / avgActivity;
                
                return Optional.of(createAnomaly(
                    twin.getId(),
                    Anomaly.AnomalyType.TEMPORAL_ANOMALY,
                    Anomaly.AnomalySeverity.LOW,
                    Math.min(1.0, deviation / 5),
                    avgActivity * 2,
                    "Unusual Activity Spike",
                    String.format("Activity at hour %s is %.1fx above average", currentHour, deviation),
                    List.of("hourly_activity"),
                    List.of("Sudden increase in activity"),
                    event.getId()
                ));
            }
            
            return Optional.empty();
        });
    }
    
    /**
     * Detect statistical outliers using Z-score and IQR methods
     */
    public Mono<Optional<Anomaly>> detectStatisticalOutlier(DigitalTwin twin, TwinEvent event) {
        return Mono.fromCallable(() -> {
            // Get or create statistics window for this twin
            DescriptiveStatistics stats = twinStatistics.computeIfAbsent(
                twin.getId(), 
                k -> new DescriptiveStatistics(100)
            );
            
            // Extract numeric value from event (e.g., sensor reading)
            Double value = extractNumericValue(event);
            if (value == null) {
                return Optional.empty();
            }
            
            // Need at least 10 data points for meaningful statistics
            if (stats.getN() < 10) {
                stats.addValue(value);
                return Optional.empty();
            }
            
            // Z-score method
            double mean = stats.getMean();
            double stdDev = stats.getStandardDeviation();
            double zScore = stdDev > 0 ? Math.abs((value - mean) / stdDev) : 0;
            
            // IQR method
            double q1 = stats.getPercentile(25);
            double q3 = stats.getPercentile(75);
            double iqr = q3 - q1;
            double lowerBound = q1 - (IQR_MULTIPLIER * iqr);
            double upperBound = q3 + (IQR_MULTIPLIER * iqr);
            boolean isIqrOutlier = value < lowerBound || value > upperBound;
            
            // Add value to statistics window
            stats.addValue(value);
            
            if (zScore > Z_SCORE_THRESHOLD || isIqrOutlier) {
                double anomalyScore = Math.min(1.0, zScore / 4);
                
                return Optional.of(createAnomaly(
                    twin.getId(),
                    Anomaly.AnomalyType.STATISTICAL_OUTLIER,
                    determineSeverity(anomalyScore),
                    anomalyScore,
                    Z_SCORE_THRESHOLD,
                    "Statistical Outlier Detected",
                    String.format("Value %.2f has Z-score of %.2f (threshold: %.1f)", value, zScore, Z_SCORE_THRESHOLD),
                    List.of("numeric_value"),
                    List.of("Value significantly deviates from historical distribution"),
                    event.getId()
                ));
            }
            
            return Optional.empty();
        });
    }
    
    /**
     * Detect sequence irregularities (unusual patterns)
     */
    public Mono<Optional<Anomaly>> detectSequenceIrregularity(DigitalTwin twin, TwinEvent event) {
        return Mono.fromCallable(() -> {
            List<String> recentActions = twin.getContextualMemory().getRecentActions();
            
            if (recentActions.size() < 5) {
                return Optional.empty();
            }
            
            // Build n-gram patterns (pairs)
            Map<String, Integer> pairFrequency = new HashMap<>();
            for (int i = 0; i < recentActions.size() - 1; i++) {
                String pair = recentActions.get(i) + "->" + recentActions.get(i + 1);
                pairFrequency.merge(pair, 1, Integer::sum);
            }
            
            // Check if the new transition is unusual
            if (!recentActions.isEmpty()) {
                String newPair = recentActions.get(0) + "->" + event.getEventType();
                int pairCount = pairFrequency.getOrDefault(newPair, 0);
                int totalPairs = recentActions.size() - 1;
                
                double pairFrequencyRatio = totalPairs > 0 ? (double) pairCount / totalPairs : 0;
                
                // New/rare sequence
                if (pairFrequencyRatio < 0.02 && totalPairs > 20) {
                    return Optional.of(createAnomaly(
                        twin.getId(),
                        Anomaly.AnomalyType.SEQUENCE_IRREGULARITY,
                        Anomaly.AnomalySeverity.LOW,
                        0.6,
                        0.02,
                        "Unusual Action Sequence",
                        String.format("Sequence '%s' is rare or new", newPair),
                        List.of("action_sequence"),
                        List.of("New pattern detected", "Deviation from established sequences"),
                        event.getId()
                    ));
                }
            }
            
            return Optional.empty();
        });
    }
    
    /**
     * Detect threshold violations
     */
    public Mono<Optional<Anomaly>> detectThresholdViolation(DigitalTwin twin, TwinEvent event) {
        return Mono.fromCallable(() -> {
            DigitalTwin.BehavioralMetrics metrics = twin.getBehavioralMetrics();
            List<Anomaly> violations = new ArrayList<>();
            
            // Check risk score threshold
            if (metrics.getRiskScore() > 0.8) {
                return Optional.of(createAnomaly(
                    twin.getId(),
                    Anomaly.AnomalyType.THRESHOLD_VIOLATION,
                    Anomaly.AnomalySeverity.CRITICAL,
                    metrics.getRiskScore(),
                    0.8,
                    "Critical Risk Level",
                    String.format("Risk score (%.2f) exceeds critical threshold (0.80)", metrics.getRiskScore()),
                    List.of("risk_score"),
                    List.of("Multiple risk factors combined"),
                    event.getId()
                ));
            }
            
            // Check activity score anomaly (too high or too low)
            if (metrics.getActivityScore() > 0.95 || metrics.getActivityScore() < 0.05) {
                String issue = metrics.getActivityScore() > 0.95 ? "Hyperactivity" : "Inactivity";
                return Optional.of(createAnomaly(
                    twin.getId(),
                    Anomaly.AnomalyType.THRESHOLD_VIOLATION,
                    Anomaly.AnomalySeverity.MEDIUM,
                    Math.abs(metrics.getActivityScore() - 0.5) * 2,
                    0.95,
                    issue + " Detected",
                    String.format("Activity score %.2f indicates %s", metrics.getActivityScore(), issue.toLowerCase()),
                    List.of("activity_score"),
                    List.of("Extreme activity level"),
                    event.getId()
                ));
            }
            
            return Optional.empty();
        });
    }
    
    /**
     * Detect drift in behavior patterns
     */
    public Mono<Optional<Anomaly>> detectDrift(DigitalTwin twin) {
        return Mono.fromCallable(() -> {
            Double trendDirection = twin.getTemporalPatterns().getTrendDirection();
            
            if (trendDirection != null && Math.abs(trendDirection) > 0.3) {
                String direction = trendDirection > 0 ? "increasing" : "decreasing";
                
                return Optional.of(createAnomaly(
                    twin.getId(),
                    Anomaly.AnomalyType.DRIFT_DETECTED,
                    Anomaly.AnomalySeverity.LOW,
                    Math.abs(trendDirection),
                    0.3,
                    "Behavioral Drift Detected",
                    String.format("Behavior trend is %s (%.2f)", direction, trendDirection),
                    List.of("trend_direction"),
                    List.of("Gradual shift in behavior patterns"),
                    null
                ));
            }
            
            return Optional.empty();
        });
    }
    
    /**
     * Get active anomalies for a twin
     */
    public Mono<List<Anomaly>> getActiveAnomalies(String twinId) {
        return anomalyCache.getActiveAnomalies(twinId).collectList();
    }
    
    /**
     * Resolve an anomaly
     */
    public Mono<Anomaly> resolveAnomaly(String anomalyId, String resolution) {
        return anomalyCache.getAnomaly(anomalyId)
            .map(anomaly -> {
                anomaly.setStatus(Anomaly.AnomalyStatus.RESOLVED);
                anomaly.setResolvedAt(Instant.now());
                anomaly.setRootCause(resolution);
                return anomaly;
            })
            .flatMap(anomaly -> anomalyCache.updateAnomaly(anomaly).thenReturn(anomaly));
    }
    
    // Helper methods
    
    private Anomaly createAnomaly(String twinId, Anomaly.AnomalyType type, 
                                   Anomaly.AnomalySeverity severity, double score,
                                   double threshold, String title, String description,
                                   List<String> affectedProperties, List<String> potentialCauses,
                                   String eventId) {
        return Anomaly.builder()
            .id(IdGenerator.generateTimeBasedId("ANOM"))
            .twinId(twinId)
            .type(type)
            .severity(severity)
            .anomalyScore(score)
            .threshold(threshold)
            .deviation(score - threshold)
            .title(title)
            .description(description)
            .affectedProperties(affectedProperties)
            .potentialCauses(potentialCauses)
            .status(Anomaly.AnomalyStatus.DETECTED)
            .detectedAt(Instant.now())
            .startedAt(Instant.now())
            .relatedEventIds(eventId != null ? List.of(eventId) : List.of())
            .explanation(generateExplanation(type, description, potentialCauses))
            .evidenceChain(List.of(
                "Event received at " + Instant.now(),
                "Anomaly detection triggered",
                description
            ))
            .build();
    }
    
    private Anomaly.AnomalySeverity determineSeverity(double score) {
        if (score >= 0.9) return Anomaly.AnomalySeverity.CRITICAL;
        if (score >= 0.7) return Anomaly.AnomalySeverity.HIGH;
        if (score >= 0.5) return Anomaly.AnomalySeverity.MEDIUM;
        if (score >= 0.3) return Anomaly.AnomalySeverity.LOW;
        return Anomaly.AnomalySeverity.INFO;
    }
    
    private Double extractNumericValue(TwinEvent event) {
        Map<String, Object> payload = event.getPayload();
        if (payload == null) return null;
        
        // Look for common numeric fields
        for (String key : List.of("value", "reading", "measurement", "score", "count")) {
            Object val = payload.get(key);
            if (val instanceof Number) {
                return ((Number) val).doubleValue();
            }
        }
        
        return null;
    }
    
    private String generateExplanation(Anomaly.AnomalyType type, String description, List<String> causes) {
        StringBuilder sb = new StringBuilder();
        sb.append("Anomaly Type: ").append(type).append("\n");
        sb.append("Finding: ").append(description).append("\n");
        sb.append("Potential Causes:\n");
        for (String cause : causes) {
            sb.append("  - ").append(cause).append("\n");
        }
        return sb.toString();
    }
    
    private Mono<List<Anomaly>> cacheAnomalies(String twinId, List<Anomaly> anomalies) {
        return Flux.fromIterable(anomalies)
            .flatMap(anomaly -> anomalyCache.cacheAnomaly(twinId, anomaly))
            .then(Mono.just(anomalies));
    }
}

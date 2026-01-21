package com.digitaltwin.prediction.service;

import com.digitaltwin.common.model.DigitalTwin;
import com.digitaltwin.common.model.Prediction;
import com.digitaltwin.common.model.TwinEvent;
import com.digitaltwin.common.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.math3.stat.regression.SimpleRegression;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Core prediction service for digital twins
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionService {
    
    private final PredictionCache predictionCache;
    private final MLServiceClient mlServiceClient;
    
    /**
     * Generate all predictions for a twin
     */
    public Mono<List<Prediction>> generatePredictions(DigitalTwin twin, TwinEvent latestEvent) {
        return Flux.merge(
            generateNextActionPrediction(twin, latestEvent),
            generateNextStatePrediction(twin),
            generateRiskForecast(twin),
            generateFailureProbability(twin),
            generateBehavioralTrajectory(twin)
        )
        .collectList()
        .flatMap(predictions -> cachePredictions(twin.getId(), predictions))
        .doOnSuccess(predictions -> 
            log.debug("Generated {} predictions for twin: {}", predictions.size(), twin.getId()));
    }
    
    /**
     * Predict the next action
     */
    public Mono<Prediction> generateNextActionPrediction(DigitalTwin twin, TwinEvent latestEvent) {
        return Mono.fromCallable(() -> {
            List<String> recentActions = twin.getContextualMemory().getRecentActions();
            
            if (recentActions.isEmpty()) {
                return createEmptyPrediction(twin.getId(), Prediction.PredictionType.NEXT_ACTION);
            }
            
            // Calculate action probabilities based on history
            Map<String, Long> actionCounts = recentActions.stream()
                .collect(Collectors.groupingBy(a -> a, Collectors.counting()));
            
            long total = recentActions.size();
            Map<String, Double> probabilities = new HashMap<>();
            
            actionCounts.forEach((action, count) -> 
                probabilities.put(action, (double) count / total));
            
            // Find most likely next action
            String predictedAction = probabilities.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("UNKNOWN");
            
            double confidence = probabilities.getOrDefault(predictedAction, 0.0);
            
            // Consider sequential patterns
            if (recentActions.size() >= 2) {
                String lastAction = recentActions.get(0);
                Map<String, Integer> followers = findFollowingActions(recentActions, lastAction);
                
                if (!followers.isEmpty()) {
                    int totalFollowers = followers.values().stream().mapToInt(Integer::intValue).sum();
                    
                    String patternPrediction = followers.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse(predictedAction);
                    
                    double patternConfidence = (double) followers.getOrDefault(patternPrediction, 0) / totalFollowers;
                    
                    // Use pattern prediction if more confident
                    if (patternConfidence > confidence) {
                        predictedAction = patternPrediction;
                        confidence = patternConfidence;
                    }
                }
            }
            
            return Prediction.builder()
                .id(IdGenerator.generateTimeBasedId("PRED"))
                .twinId(twin.getId())
                .type(Prediction.PredictionType.NEXT_ACTION)
                .predictedAction(predictedAction)
                .probabilityDistribution(probabilities)
                .confidence(confidence)
                .predictionTime(Instant.now())
                .targetTime(Instant.now().plus(Duration.ofMinutes(5)))
                .horizonMs(Duration.ofMinutes(5).toMillis())
                .contributingFactors(List.of("Historical patterns", "Recent actions", "Sequential analysis"))
                .featureImportance(Map.of(
                    "action_frequency", 0.4,
                    "sequential_pattern", 0.35,
                    "temporal_pattern", 0.25
                ))
                .explanation(String.format("Based on %d recent actions, '%s' is predicted with %.1f%% confidence",
                    recentActions.size(), predictedAction, confidence * 100))
                .modelId("action-predictor-v1")
                .modelVersion("1.0.0")
                .build();
        });
    }
    
    /**
     * Predict the next state
     */
    public Mono<Prediction> generateNextStatePrediction(DigitalTwin twin) {
        return Mono.fromCallable(() -> {
            List<com.digitaltwin.common.model.TwinState> stateHistory = twin.getStateHistory();
            String currentState = twin.getCurrentState() != null ? 
                twin.getCurrentState().getStateName() : "INITIAL";
            
            if (stateHistory.isEmpty()) {
                return createEmptyPrediction(twin.getId(), Prediction.PredictionType.NEXT_STATE);
            }
            
            // Markov chain transition probabilities
            Map<String, Map<String, Integer>> transitionMatrix = new HashMap<>();
            
            for (int i = 0; i < stateHistory.size() - 1; i++) {
                String from = stateHistory.get(i).getStateName();
                String to = stateHistory.get(i + 1).getStateName();
                
                transitionMatrix.computeIfAbsent(from, k -> new HashMap<>())
                    .merge(to, 1, Integer::sum);
            }
            
            // Get transitions from current state
            Map<String, Integer> currentTransitions = transitionMatrix.getOrDefault(currentState, new HashMap<>());
            
            if (currentTransitions.isEmpty()) {
                return createEmptyPrediction(twin.getId(), Prediction.PredictionType.NEXT_STATE);
            }
            
            int totalTransitions = currentTransitions.values().stream().mapToInt(Integer::intValue).sum();
            
            Map<String, Double> probabilities = new HashMap<>();
            currentTransitions.forEach((state, count) -> 
                probabilities.put(state, (double) count / totalTransitions));
            
            String predictedState = probabilities.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(currentState);
            
            double confidence = probabilities.getOrDefault(predictedState, 0.0);
            
            // Estimate time horizon based on average state duration
            long avgDuration = stateHistory.stream()
                .filter(s -> s.getDurationMs() != null)
                .mapToLong(com.digitaltwin.common.model.TwinState::getDurationMs)
                .average()
                .orElse(60000);
            
            return Prediction.builder()
                .id(IdGenerator.generateTimeBasedId("PRED"))
                .twinId(twin.getId())
                .type(Prediction.PredictionType.NEXT_STATE)
                .predictedState(predictedState)
                .probabilityDistribution(probabilities)
                .confidence(confidence)
                .predictionTime(Instant.now())
                .targetTime(Instant.now().plus(Duration.ofMillis(avgDuration)))
                .horizonMs(avgDuration)
                .contributingFactors(List.of("State transition history", "Markov chain analysis"))
                .featureImportance(Map.of(
                    "transition_frequency", 0.5,
                    "current_state", 0.3,
                    "state_duration", 0.2
                ))
                .explanation(String.format("From '%s', likely to transition to '%s' with %.1f%% probability",
                    currentState, predictedState, confidence * 100))
                .modelId("state-predictor-v1")
                .modelVersion("1.0.0")
                .build();
        });
    }
    
    /**
     * Generate risk forecast
     */
    public Mono<Prediction> generateRiskForecast(DigitalTwin twin) {
        return Mono.fromCallable(() -> {
            DigitalTwin.BehavioralMetrics metrics = twin.getBehavioralMetrics();
            
            double currentRisk = metrics.getRiskScore();
            double anomalyScore = metrics.getAnomalyScore();
            double activityScore = metrics.getActivityScore();
            
            // Risk factors
            List<String> riskFactors = new ArrayList<>();
            Map<String, Double> factorWeights = new HashMap<>();
            
            if (currentRisk > 0.7) {
                riskFactors.add("High current risk level");
                factorWeights.put("current_risk", 0.4);
            }
            if (anomalyScore > 0.5) {
                riskFactors.add("Elevated anomaly activity");
                factorWeights.put("anomaly_score", 0.3);
            }
            if (activityScore > 0.8 || activityScore < 0.1) {
                riskFactors.add("Unusual activity pattern");
                factorWeights.put("activity_pattern", 0.2);
            }
            
            // Project risk using linear regression on historical metrics
            double projectedRisk = projectRisk(twin);
            
            String riskLevel = determineRiskLevel(projectedRisk);
            double confidence = calculateRiskConfidence(twin);
            
            return Prediction.builder()
                .id(IdGenerator.generateTimeBasedId("PRED"))
                .twinId(twin.getId())
                .type(Prediction.PredictionType.RISK_FORECAST)
                .riskScore(projectedRisk)
                .riskLevel(riskLevel)
                .riskFactors(riskFactors)
                .probabilityDistribution(Map.of(
                    "LOW", projectedRisk < 0.3 ? 1 - projectedRisk : 0.1,
                    "MEDIUM", projectedRisk >= 0.3 && projectedRisk < 0.7 ? 0.6 : 0.2,
                    "HIGH", projectedRisk >= 0.7 ? projectedRisk : 0.1
                ))
                .confidence(confidence)
                .predictionTime(Instant.now())
                .targetTime(Instant.now().plus(Duration.ofHours(1)))
                .horizonMs(Duration.ofHours(1).toMillis())
                .contributingFactors(riskFactors)
                .featureImportance(factorWeights)
                .explanation(String.format("Risk projected at %.1f%% (%s level) based on %d factors",
                    projectedRisk * 100, riskLevel, riskFactors.size()))
                .modelId("risk-forecaster-v1")
                .modelVersion("1.0.0")
                .build();
        });
    }
    
    /**
     * Generate failure probability prediction
     */
    public Mono<Prediction> generateFailureProbability(DigitalTwin twin) {
        return Mono.fromCallable(() -> {
            DigitalTwin.TwinHealth health = twin.getHealth();
            double healthScore = health != null && health.getHealthScore() != null ? 
                health.getHealthScore() / 100.0 : 1.0;
            
            // Failure probability inversely related to health
            double failureProbability = 1.0 - healthScore;
            
            // Adjust based on active alerts
            int alertCount = health != null ? health.getActiveAlerts().size() : 0;
            failureProbability += Math.min(0.3, alertCount * 0.05);
            failureProbability = Math.min(1.0, failureProbability);
            
            // Time to failure estimate
            long mtbf = estimateMTBF(twin);
            
            return Prediction.builder()
                .id(IdGenerator.generateTimeBasedId("PRED"))
                .twinId(twin.getId())
                .type(Prediction.PredictionType.FAILURE_PROBABILITY)
                .riskScore(failureProbability)
                .riskLevel(failureProbability > 0.7 ? "CRITICAL" : 
                          failureProbability > 0.4 ? "WARNING" : "NORMAL")
                .riskFactors(List.of(
                    "Health score: " + healthScore,
                    "Active alerts: " + alertCount
                ))
                .probabilityDistribution(Map.of(
                    "NO_FAILURE", 1 - failureProbability,
                    "DEGRADED", failureProbability * 0.6,
                    "FAILURE", failureProbability * 0.4
                ))
                .confidence(0.75)
                .predictionTime(Instant.now())
                .targetTime(Instant.now().plus(Duration.ofHours(24)))
                .horizonMs(Duration.ofHours(24).toMillis())
                .contributingFactors(List.of("Health score", "Alert count", "Historical patterns"))
                .explanation(String.format("%.1f%% probability of failure within 24 hours",
                    failureProbability * 100))
                .modelId("failure-predictor-v1")
                .modelVersion("1.0.0")
                .build();
        });
    }
    
    /**
     * Generate behavioral trajectory prediction
     */
    public Mono<Prediction> generateBehavioralTrajectory(DigitalTwin twin) {
        return Mono.fromCallable(() -> {
            DigitalTwin.BehavioralMetrics metrics = twin.getBehavioralMetrics();
            
            // Predict trajectory based on current trends
            String trajectory = determineTrajectory(twin);
            double confidence = 0.7;
            
            return Prediction.builder()
                .id(IdGenerator.generateTimeBasedId("PRED"))
                .twinId(twin.getId())
                .type(Prediction.PredictionType.BEHAVIORAL_TRAJECTORY)
                .predictedState(trajectory)
                .probabilityDistribution(Map.of(
                    "IMPROVING", trajectory.equals("IMPROVING") ? 0.7 : 0.15,
                    "STABLE", trajectory.equals("STABLE") ? 0.7 : 0.15,
                    "DECLINING", trajectory.equals("DECLINING") ? 0.7 : 0.15
                ))
                .confidence(confidence)
                .predictionTime(Instant.now())
                .targetTime(Instant.now().plus(Duration.ofHours(6)))
                .horizonMs(Duration.ofHours(6).toMillis())
                .contributingFactors(List.of("Activity trend", "Engagement pattern", "Performance metrics"))
                .explanation(String.format("Behavioral trajectory: %s", trajectory))
                .modelId("trajectory-predictor-v1")
                .modelVersion("1.0.0")
                .build();
        });
    }
    
    // Helper methods
    
    private Map<String, Integer> findFollowingActions(List<String> actions, String targetAction) {
        Map<String, Integer> followers = new HashMap<>();
        for (int i = 0; i < actions.size() - 1; i++) {
            if (actions.get(i).equals(targetAction)) {
                followers.merge(actions.get(i + 1), 1, Integer::sum);
            }
        }
        return followers;
    }
    
    private double projectRisk(DigitalTwin twin) {
        // Use linear regression for risk projection
        SimpleRegression regression = new SimpleRegression();
        
        // Use state history for risk trend
        List<com.digitaltwin.common.model.TwinState> history = twin.getStateHistory();
        for (int i = 0; i < Math.min(history.size(), 20); i++) {
            com.digitaltwin.common.model.TwinState state = history.get(i);
            double riskIndicator = state.getType() == com.digitaltwin.common.model.TwinState.StateType.ALERT ? 0.8 : 0.2;
            regression.addData(i, riskIndicator);
        }
        
        if (regression.getN() < 2) {
            return twin.getBehavioralMetrics().getRiskScore();
        }
        
        // Project next risk value
        double projected = regression.predict(regression.getN() + 1);
        return Math.max(0, Math.min(1, projected));
    }
    
    private String determineRiskLevel(double risk) {
        if (risk >= 0.8) return "CRITICAL";
        if (risk >= 0.6) return "HIGH";
        if (risk >= 0.4) return "MEDIUM";
        if (risk >= 0.2) return "LOW";
        return "MINIMAL";
    }
    
    private double calculateRiskConfidence(DigitalTwin twin) {
        int dataPoints = twin.getStateHistory().size();
        return Math.min(0.95, 0.5 + (dataPoints * 0.01));
    }
    
    private long estimateMTBF(DigitalTwin twin) {
        // Mean Time Between Failures estimation
        return Duration.ofHours(24).toMillis();
    }
    
    private String determineTrajectory(DigitalTwin twin) {
        DigitalTwin.BehavioralMetrics metrics = twin.getBehavioralMetrics();
        
        double score = (metrics.getActivityScore() + metrics.getEngagementScore() + 
                       metrics.getPerformanceScore() - metrics.getRiskScore()) / 3;
        
        if (score > 0.6) return "IMPROVING";
        if (score < 0.4) return "DECLINING";
        return "STABLE";
    }
    
    private Prediction createEmptyPrediction(String twinId, Prediction.PredictionType type) {
        return Prediction.builder()
            .id(IdGenerator.generateTimeBasedId("PRED"))
            .twinId(twinId)
            .type(type)
            .confidence(0.0)
            .predictionTime(Instant.now())
            .explanation("Insufficient data for prediction")
            .build();
    }
    
    private Mono<List<Prediction>> cachePredictions(String twinId, List<Prediction> predictions) {
        return Flux.fromIterable(predictions)
            .flatMap(p -> predictionCache.cachePrediction(twinId, p))
            .then(Mono.just(predictions));
    }
}

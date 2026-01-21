package com.digitaltwin.state.service;

import com.digitaltwin.common.model.DigitalTwin;
import com.digitaltwin.common.model.TwinEvent;
import com.digitaltwin.common.model.TwinState;
import com.digitaltwin.common.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.*;

/**
 * Engine for evaluating and executing state transitions
 * Supports rule-based, probabilistic, and ML-assisted transitions
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StateTransitionEngine {
    
    private final TransitionRuleRepository ruleRepository;
    
    /**
     * Evaluate if a state transition should occur based on the event
     */
    public Mono<Optional<TwinState>> evaluateTransition(DigitalTwin twin, TwinEvent event) {
        return Mono.fromCallable(() -> {
            TwinState currentState = twin.getCurrentState();
            String currentStateName = currentState != null ? currentState.getStateName() : "INITIAL";
            
            // Try rule-based transition first
            Optional<TwinState> ruleBasedTransition = evaluateRuleBasedTransition(twin, event, currentStateName);
            if (ruleBasedTransition.isPresent()) {
                return ruleBasedTransition;
            }
            
            // Try probabilistic transition
            Optional<TwinState> probabilisticTransition = evaluateProbabilisticTransition(twin, event, currentStateName);
            if (probabilisticTransition.isPresent()) {
                return probabilisticTransition;
            }
            
            // Try ML-assisted transition
            Optional<TwinState> mlTransition = evaluateMLAssistedTransition(twin, event, currentStateName);
            if (mlTransition.isPresent()) {
                return mlTransition;
            }
            
            // Check for automatic state evolution
            return evaluateAutoEvolution(twin, event, currentStateName);
        });
    }
    
    /**
     * Rule-based transition evaluation
     */
    private Optional<TwinState> evaluateRuleBasedTransition(DigitalTwin twin, TwinEvent event, String currentState) {
        // Define transition rules (in production, load from database)
        Map<String, List<TransitionRule>> rules = getTransitionRules(twin.getEntityType());
        
        List<TransitionRule> applicableRules = rules.getOrDefault(currentState, Collections.emptyList());
        
        for (TransitionRule rule : applicableRules) {
            if (rule.matches(event, twin)) {
                log.debug("Rule '{}' triggered for twin {}", rule.getName(), twin.getId());
                return Optional.of(createNewState(rule.getTargetState(), TwinState.TransitionType.RULE_BASED, rule.getConfidence()));
            }
        }
        
        return Optional.empty();
    }
    
    /**
     * Probabilistic transition evaluation
     */
    private Optional<TwinState> evaluateProbabilisticTransition(DigitalTwin twin, TwinEvent event, String currentState) {
        // Calculate transition probabilities based on historical patterns
        Map<String, Double> probabilities = calculateTransitionProbabilities(twin, event, currentState);
        
        // Find the most likely transition above threshold
        double threshold = 0.7;
        return probabilities.entrySet().stream()
            .filter(e -> e.getValue() >= threshold)
            .max(Map.Entry.comparingByValue())
            .map(e -> createNewState(e.getKey(), TwinState.TransitionType.PROBABILISTIC, e.getValue()));
    }
    
    /**
     * ML-assisted transition evaluation (placeholder for ML integration)
     */
    private Optional<TwinState> evaluateMLAssistedTransition(DigitalTwin twin, TwinEvent event, String currentState) {
        // In production, call ML service for state prediction
        // For now, return empty
        return Optional.empty();
    }
    
    /**
     * Automatic state evolution based on patterns
     */
    private Optional<TwinState> evaluateAutoEvolution(DigitalTwin twin, TwinEvent event, String currentState) {
        // Check for activity-based state changes
        Double activityScore = twin.getBehavioralMetrics().getActivityScore();
        Double riskScore = twin.getBehavioralMetrics().getRiskScore();
        
        // High risk -> ALERT state
        if (riskScore != null && riskScore > 0.8 && !currentState.equals("ALERT")) {
            return Optional.of(createNewState("ALERT", TwinState.TransitionType.EVENT_DRIVEN, riskScore));
        }
        
        // Low activity -> IDLE state
        if (activityScore != null && activityScore < 0.1 && currentState.equals("ACTIVE")) {
            return Optional.of(createNewState("IDLE", TwinState.TransitionType.TIME_BASED, 0.9));
        }
        
        // High activity -> ACTIVE state
        if (activityScore != null && activityScore > 0.5 && currentState.equals("IDLE")) {
            return Optional.of(createNewState("ACTIVE", TwinState.TransitionType.EVENT_DRIVEN, activityScore));
        }
        
        return Optional.empty();
    }
    
    /**
     * Create a new state object
     */
    private TwinState createNewState(String stateName, TwinState.TransitionType type, Double confidence) {
        TwinState.StateType stateType = determineStateType(stateName);
        
        return TwinState.builder()
            .id(IdGenerator.generateId("STATE"))
            .stateName(stateName)
            .type(stateType)
            .transitionType(type)
            .confidence(confidence)
            .properties(new HashMap<>())
            .build();
    }
    
    private TwinState.StateType determineStateType(String stateName) {
        return switch (stateName.toUpperCase()) {
            case "INITIAL" -> TwinState.StateType.INITIAL;
            case "ACTIVE" -> TwinState.StateType.ACTIVE;
            case "IDLE" -> TwinState.StateType.IDLE;
            case "ALERT" -> TwinState.StateType.ALERT;
            case "ANOMALOUS" -> TwinState.StateType.ANOMALOUS;
            case "TRANSITIONING" -> TwinState.StateType.TRANSITIONING;
            case "TERMINAL" -> TwinState.StateType.TERMINAL;
            default -> TwinState.StateType.ACTIVE;
        };
    }
    
    /**
     * Get transition rules for an entity type
     */
    private Map<String, List<TransitionRule>> getTransitionRules(String entityType) {
        // In production, load from database
        Map<String, List<TransitionRule>> rules = new HashMap<>();
        
        // Default rules for all entity types
        rules.put("INITIAL", List.of(
            new TransitionRule("InitialToActive", "ACTIVE", 
                event -> event.getCategory() == TwinEvent.EventCategory.BEHAVIORAL_ACTION, 0.95)
        ));
        
        rules.put("ACTIVE", List.of(
            new TransitionRule("ActiveToAlert", "ALERT",
                event -> "ALERT".equals(event.getEventType()) || 
                         event.getPriority() == TwinEvent.EventPriority.CRITICAL, 0.99)
        ));
        
        rules.put("ALERT", List.of(
            new TransitionRule("AlertToActive", "ACTIVE",
                event -> "RESOLVED".equals(event.getEventType()), 0.95)
        ));
        
        return rules;
    }
    
    /**
     * Calculate transition probabilities based on history
     */
    private Map<String, Double> calculateTransitionProbabilities(DigitalTwin twin, TwinEvent event, String currentState) {
        Map<String, Double> probabilities = new HashMap<>();
        
        // Analyze historical transitions
        List<TwinState> history = twin.getStateHistory();
        if (history.isEmpty()) {
            return probabilities;
        }
        
        // Count transitions from current state
        Map<String, Integer> transitionCounts = new HashMap<>();
        int totalTransitions = 0;
        
        for (int i = 0; i < history.size() - 1; i++) {
            if (history.get(i).getStateName().equals(currentState)) {
                String nextState = history.get(i + 1).getStateName();
                transitionCounts.merge(nextState, 1, Integer::sum);
                totalTransitions++;
            }
        }
        
        // Calculate probabilities
        if (totalTransitions > 0) {
            for (Map.Entry<String, Integer> entry : transitionCounts.entrySet()) {
                probabilities.put(entry.getKey(), (double) entry.getValue() / totalTransitions);
            }
        }
        
        return probabilities;
    }
    
    /**
     * Inner class for transition rules
     */
    @RequiredArgsConstructor
    private static class TransitionRule {
        private final String name;
        private final String targetState;
        private final java.util.function.Predicate<TwinEvent> condition;
        private final double confidence;
        
        public String getName() { return name; }
        public String getTargetState() { return targetState; }
        public Double getConfidence() { return confidence; }
        
        public boolean matches(TwinEvent event, DigitalTwin twin) {
            return condition.test(event);
        }
    }
}

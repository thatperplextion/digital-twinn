package com.digitaltwin.action.service;

import com.digitaltwin.common.model.Anomaly;
import com.digitaltwin.common.model.DigitalTwin;
import com.digitaltwin.common.model.Prediction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

/**
 * Policy engine for evaluating action policies
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PolicyEngine {
    
    /**
     * Evaluate policies for a prediction
     */
    public Mono<List<String>> evaluatePolicies(DigitalTwin twin, Prediction prediction) {
        return Mono.fromCallable(() -> {
            List<String> matchedPolicies = new ArrayList<>();
            
            // High risk predictions
            if (prediction.getRiskScore() != null && prediction.getRiskScore() > 0.7) {
                matchedPolicies.add("HIGH_RISK_MITIGATION");
            }
            
            // High confidence predictions
            if (prediction.getConfidence() > 0.85) {
                matchedPolicies.add("HIGH_CONFIDENCE_ACTION");
            }
            
            // Failure probability
            if (prediction.getType() == Prediction.PredictionType.FAILURE_PROBABILITY &&
                prediction.getRiskScore() != null && prediction.getRiskScore() > 0.5) {
                matchedPolicies.add("PREVENTIVE_MAINTENANCE");
            }
            
            log.debug("Matched {} policies for prediction: {}", matchedPolicies.size(), prediction.getId());
            return matchedPolicies;
        });
    }
    
    /**
     * Evaluate policies for an anomaly
     */
    public Mono<List<String>> evaluatePolicies(DigitalTwin twin, Anomaly anomaly) {
        return Mono.fromCallable(() -> {
            List<String> matchedPolicies = new ArrayList<>();
            
            // Critical anomalies always trigger action
            if (anomaly.getSeverity() == Anomaly.AnomalySeverity.CRITICAL) {
                matchedPolicies.add("CRITICAL_ANOMALY_RESPONSE");
            }
            
            // High severity anomalies
            if (anomaly.getSeverity() == Anomaly.AnomalySeverity.HIGH) {
                matchedPolicies.add("HIGH_SEVERITY_RESPONSE");
            }
            
            // Threshold violations
            if (anomaly.getType() == Anomaly.AnomalyType.THRESHOLD_VIOLATION) {
                matchedPolicies.add("THRESHOLD_BREACH_POLICY");
            }
            
            // Security-related anomalies
            if (anomaly.getType() == Anomaly.AnomalyType.BEHAVIORAL_DEVIATION &&
                anomaly.getAnomalyScore() > 0.8) {
                matchedPolicies.add("SECURITY_RESPONSE");
            }
            
            log.debug("Matched {} policies for anomaly: {}", matchedPolicies.size(), anomaly.getId());
            return matchedPolicies;
        });
    }
}

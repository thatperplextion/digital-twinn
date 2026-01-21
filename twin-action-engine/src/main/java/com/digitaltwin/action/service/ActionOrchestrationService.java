package com.digitaltwin.action.service;

import com.digitaltwin.common.model.*;
import com.digitaltwin.common.dto.ExplainabilityReport;
import com.digitaltwin.common.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.*;

/**
 * Core service for autonomous action orchestration
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ActionOrchestrationService {
    
    private final ActionExecutor actionExecutor;
    private final PolicyEngine policyEngine;
    private final ActionRepository actionRepository;
    
    /**
     * Process a prediction and determine if action is needed
     */
    public Mono<Optional<Action>> processPredict(DigitalTwin twin, Prediction prediction) {
        return policyEngine.evaluatePolicies(twin, prediction)
            .flatMap(policies -> {
                if (policies.isEmpty()) {
                    return Mono.just(Optional.empty());
                }
                
                // Create action based on prediction and policies
                Action action = createActionFromPrediction(twin, prediction, policies);
                return executeAction(action).map(Optional::of);
            })
            .doOnSuccess(opt -> opt.ifPresent(action -> 
                log.info("Action triggered from prediction: {} -> {}", prediction.getType(), action.getType())));
    }
    
    /**
     * Process an anomaly and trigger appropriate action
     */
    public Mono<Optional<Action>> processAnomaly(DigitalTwin twin, Anomaly anomaly) {
        return policyEngine.evaluatePolicies(twin, anomaly)
            .flatMap(policies -> {
                if (policies.isEmpty()) {
                    return Mono.just(Optional.empty());
                }
                
                // Create action based on anomaly
                Action action = createActionFromAnomaly(twin, anomaly, policies);
                return executeAction(action).map(Optional::of);
            })
            .doOnSuccess(opt -> opt.ifPresent(action -> 
                log.info("Action triggered from anomaly: {} -> {}", anomaly.getType(), action.getType())));
    }
    
    /**
     * Execute an action
     */
    public Mono<Action> executeAction(Action action) {
        action.setStartedAt(Instant.now());
        action.setStatus(Action.ActionStatus.RUNNING);
        
        return actionRepository.save(action)
            .flatMap(actionExecutor::execute)
            .flatMap(result -> {
                action.setCompletedAt(Instant.now());
                action.setExecutionTimeMs(
                    action.getCompletedAt().toEpochMilli() - action.getStartedAt().toEpochMilli());
                action.setSuccess(result.isSuccess());
                action.setResult(result.getMessage());
                action.setResultData(result.getData());
                action.setStatus(result.isSuccess() ? 
                    Action.ActionStatus.COMPLETED : Action.ActionStatus.FAILED);
                
                if (!result.isSuccess()) {
                    action.setErrorMessage(result.getError());
                    action.setRetryCount(action.getRetryCount() + 1);
                }
                
                // Add audit log entry
                action.getAuditLog().add(String.format("[%s] Action %s: %s", 
                    Instant.now(), action.getStatus(), result.getMessage()));
                
                return actionRepository.save(action);
            })
            .doOnSuccess(a -> log.info("Action completed: {} - {}", a.getId(), a.getStatus()))
            .doOnError(e -> log.error("Action failed: {}", action.getId(), e));
    }
    
    /**
     * Get action history for a twin
     */
    public Flux<Action> getActionHistory(String twinId) {
        return actionRepository.findByTwinId(twinId);
    }
    
    /**
     * Get pending actions
     */
    public Flux<Action> getPendingActions(String twinId) {
        return actionRepository.findByTwinId(twinId)
            .filter(action -> action.getStatus() == Action.ActionStatus.PENDING ||
                             action.getStatus() == Action.ActionStatus.SCHEDULED);
    }
    
    /**
     * Cancel a pending action
     */
    public Mono<Action> cancelAction(String actionId, String reason) {
        return actionRepository.findById(actionId)
            .flatMap(action -> {
                if (action.getStatus() != Action.ActionStatus.PENDING &&
                    action.getStatus() != Action.ActionStatus.SCHEDULED) {
                    return Mono.error(new IllegalStateException("Cannot cancel action in state: " + action.getStatus()));
                }
                
                action.setStatus(Action.ActionStatus.CANCELLED);
                action.getAuditLog().add(String.format("[%s] Cancelled: %s", Instant.now(), reason));
                
                return actionRepository.save(action);
            });
    }
    
    /**
     * Rollback an action
     */
    public Mono<Action> rollbackAction(String actionId) {
        return actionRepository.findById(actionId)
            .flatMap(action -> {
                if (!action.getRollbackable()) {
                    return Mono.error(new IllegalStateException("Action is not rollbackable"));
                }
                
                // Create rollback action
                Action rollback = Action.builder()
                    .id(IdGenerator.generateTimeBasedId("ACT"))
                    .twinId(action.getTwinId())
                    .name("Rollback: " + action.getName())
                    .type(action.getType())
                    .priority(Action.ActionPriority.HIGH)
                    .triggerType(Action.TriggerType.MANUAL)
                    .triggerReason("Rollback of action: " + action.getId())
                    .parameters(action.getParameters())
                    .status(Action.ActionStatus.PENDING)
                    .build();
                
                action.setRollbackActionId(rollback.getId());
                action.setStatus(Action.ActionStatus.ROLLED_BACK);
                
                return actionRepository.save(action)
                    .then(executeAction(rollback));
            });
    }
    
    /**
     * Generate explainability report for an action
     */
    public Mono<ExplainabilityReport> generateExplainabilityReport(String actionId) {
        return actionRepository.findById(actionId)
            .map(action -> {
                List<ExplainabilityReport.DecisionStep> decisionChain = new ArrayList<>();
                
                // Build decision chain
                decisionChain.add(ExplainabilityReport.DecisionStep.builder()
                    .stepNumber(1)
                    .stepType("TRIGGER")
                    .description("Action triggered by: " + action.getTriggerType())
                    .data(Map.of("triggerId", action.getTriggerId(), 
                                "reason", action.getTriggerReason()))
                    .timestamp(action.getScheduledAt())
                    .reasoning(action.getTriggerReason())
                    .build());
                
                decisionChain.add(ExplainabilityReport.DecisionStep.builder()
                    .stepNumber(2)
                    .stepType("POLICY_EVALUATION")
                    .description("Policy evaluation completed")
                    .timestamp(action.getStartedAt())
                    .reasoning("Action approved based on policy rules")
                    .build());
                
                decisionChain.add(ExplainabilityReport.DecisionStep.builder()
                    .stepNumber(3)
                    .stepType("EXECUTION")
                    .description("Action executed: " + action.getName())
                    .data(action.getResultData())
                    .timestamp(action.getCompletedAt())
                    .reasoning(action.getResult())
                    .build());
                
                return ExplainabilityReport.builder()
                    .id(IdGenerator.generateId("EXPLAIN"))
                    .twinId(action.getTwinId())
                    .type(ExplainabilityReport.ReportType.ACTION_DECISION)
                    .decisionChain(decisionChain)
                    .contributingFactors(Map.of(
                        "trigger_type", 0.4,
                        "policy_match", 0.3,
                        "priority", 0.2,
                        "context", 0.1
                    ))
                    .summary(action.getExplanation())
                    .detailedExplanation(generateDetailedExplanation(action))
                    .generatedAt(Instant.now())
                    .explanationConfidence(0.9)
                    .build();
            });
    }
    
    // Helper methods
    
    private Action createActionFromPrediction(DigitalTwin twin, Prediction prediction, 
                                               List<String> policies) {
        Action.ActionType actionType = determineActionType(prediction);
        
        return Action.builder()
            .id(IdGenerator.generateTimeBasedId("ACT"))
            .twinId(twin.getId())
            .name(generateActionName(prediction))
            .type(actionType)
            .priority(determinePriority(prediction))
            .triggerId(prediction.getId())
            .triggerType(Action.TriggerType.PREDICTION)
            .triggerReason(prediction.getExplanation())
            .parameters(Map.of(
                "prediction_type", prediction.getType().name(),
                "confidence", prediction.getConfidence(),
                "risk_score", prediction.getRiskScore() != null ? prediction.getRiskScore() : 0
            ))
            .status(Action.ActionStatus.PENDING)
            .scheduledAt(Instant.now())
            .rollbackable(true)
            .decisionChain(prediction.getContributingFactors())
            .explanation(prediction.getExplanation())
            .build();
    }
    
    private Action createActionFromAnomaly(DigitalTwin twin, Anomaly anomaly, 
                                            List<String> policies) {
        Action.ActionType actionType = anomaly.getSeverity() == Anomaly.AnomalySeverity.CRITICAL ?
            Action.ActionType.AUTO_INTERVENTION : Action.ActionType.RISK_MITIGATION;
        
        return Action.builder()
            .id(IdGenerator.generateTimeBasedId("ACT"))
            .twinId(twin.getId())
            .name("Mitigate: " + anomaly.getTitle())
            .type(actionType)
            .priority(mapSeverityToPriority(anomaly.getSeverity()))
            .triggerId(anomaly.getId())
            .triggerType(Action.TriggerType.ANOMALY)
            .triggerReason(anomaly.getDescription())
            .parameters(Map.of(
                "anomaly_type", anomaly.getType().name(),
                "severity", anomaly.getSeverity().name(),
                "anomaly_score", anomaly.getAnomalyScore()
            ))
            .status(Action.ActionStatus.PENDING)
            .scheduledAt(Instant.now())
            .rollbackable(true)
            .decisionChain(anomaly.getPotentialCauses())
            .explanation(anomaly.getExplanation())
            .build();
    }
    
    private Action.ActionType determineActionType(Prediction prediction) {
        return switch (prediction.getType()) {
            case RISK_FORECAST, FAILURE_PROBABILITY -> Action.ActionType.RISK_MITIGATION;
            case BEHAVIORAL_TRAJECTORY -> Action.ActionType.SYSTEM_TUNING;
            default -> Action.ActionType.RESOURCE_OPTIMIZATION;
        };
    }
    
    private Action.ActionPriority determinePriority(Prediction prediction) {
        if (prediction.getRiskScore() != null && prediction.getRiskScore() > 0.8) {
            return Action.ActionPriority.IMMEDIATE;
        }
        if (prediction.getConfidence() > 0.9) {
            return Action.ActionPriority.HIGH;
        }
        return Action.ActionPriority.NORMAL;
    }
    
    private Action.ActionPriority mapSeverityToPriority(Anomaly.AnomalySeverity severity) {
        return switch (severity) {
            case CRITICAL -> Action.ActionPriority.IMMEDIATE;
            case HIGH -> Action.ActionPriority.HIGH;
            case MEDIUM -> Action.ActionPriority.NORMAL;
            default -> Action.ActionPriority.LOW;
        };
    }
    
    private String generateActionName(Prediction prediction) {
        return switch (prediction.getType()) {
            case RISK_FORECAST -> "Risk Mitigation Action";
            case FAILURE_PROBABILITY -> "Preventive Maintenance";
            case BEHAVIORAL_TRAJECTORY -> "Behavior Optimization";
            case NEXT_ACTION -> "Proactive Response";
            default -> "Automated Action";
        };
    }
    
    private String generateDetailedExplanation(Action action) {
        StringBuilder sb = new StringBuilder();
        sb.append("## Action Explanation\n\n");
        sb.append("### Trigger\n");
        sb.append(String.format("- Type: %s\n", action.getTriggerType()));
        sb.append(String.format("- Reason: %s\n\n", action.getTriggerReason()));
        sb.append("### Decision Chain\n");
        for (int i = 0; i < action.getDecisionChain().size(); i++) {
            sb.append(String.format("%d. %s\n", i + 1, action.getDecisionChain().get(i)));
        }
        sb.append("\n### Result\n");
        sb.append(String.format("- Status: %s\n", action.getStatus()));
        sb.append(String.format("- Outcome: %s\n", action.getResult()));
        return sb.toString();
    }
}

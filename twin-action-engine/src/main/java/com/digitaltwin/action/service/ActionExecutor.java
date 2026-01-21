package com.digitaltwin.action.service;

import com.digitaltwin.common.model.Action;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

/**
 * Executor for various action types
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ActionExecutor {
    
    private final WebClient.Builder webClientBuilder;
    
    public Mono<ActionResult> execute(Action action) {
        log.info("Executing action: {} ({})", action.getId(), action.getType());
        
        return switch (action.getType()) {
            case RISK_MITIGATION -> executeRiskMitigation(action);
            case SYSTEM_TUNING -> executeSystemTuning(action);
            case AUTO_INTERVENTION -> executeAutoIntervention(action);
            case RESOURCE_OPTIMIZATION -> executeResourceOptimization(action);
            case ALERT_NOTIFICATION -> executeAlertNotification(action);
            case POLICY_ENFORCEMENT -> executePolicyEnforcement(action);
            case DATA_CORRECTION -> executeDataCorrection(action);
            case WORKFLOW_TRIGGER -> executeWorkflowTrigger(action);
            default -> executeCustomAction(action);
        };
    }
    
    private Mono<ActionResult> executeRiskMitigation(Action action) {
        return Mono.fromCallable(() -> {
            // Simulate risk mitigation logic
            log.info("Executing risk mitigation for twin: {}", action.getTwinId());
            
            Map<String, Object> resultData = new HashMap<>();
            resultData.put("mitigationApplied", true);
            resultData.put("riskReduced", true);
            resultData.put("previousRiskScore", action.getParameters().get("risk_score"));
            resultData.put("newRiskScore", 0.3);
            
            return ActionResult.builder()
                .success(true)
                .message("Risk mitigation applied successfully")
                .data(resultData)
                .build();
        });
    }
    
    private Mono<ActionResult> executeSystemTuning(Action action) {
        return Mono.fromCallable(() -> {
            log.info("Executing system tuning for twin: {}", action.getTwinId());
            
            return ActionResult.builder()
                .success(true)
                .message("System parameters tuned successfully")
                .data(Map.of("tuningApplied", true, "parametersAdjusted", 3))
                .build();
        });
    }
    
    private Mono<ActionResult> executeAutoIntervention(Action action) {
        return Mono.fromCallable(() -> {
            log.info("Executing auto intervention for twin: {}", action.getTwinId());
            
            // Critical intervention - might involve system restart, failover, etc.
            return ActionResult.builder()
                .success(true)
                .message("Automatic intervention completed")
                .data(Map.of("interventionType", "FAILOVER", "systemStabilized", true))
                .build();
        });
    }
    
    private Mono<ActionResult> executeResourceOptimization(Action action) {
        return Mono.fromCallable(() -> {
            log.info("Executing resource optimization for twin: {}", action.getTwinId());
            
            return ActionResult.builder()
                .success(true)
                .message("Resources optimized")
                .data(Map.of("resourcesSaved", "15%", "performanceImproved", true))
                .build();
        });
    }
    
    private Mono<ActionResult> executeAlertNotification(Action action) {
        return Mono.fromCallable(() -> {
            log.info("Sending alert notification for twin: {}", action.getTwinId());
            
            // In production, send to notification service (email, SMS, Slack, etc.)
            return ActionResult.builder()
                .success(true)
                .message("Alert notification sent")
                .data(Map.of("notificationsSent", 1, "channels", "email,slack"))
                .build();
        });
    }
    
    private Mono<ActionResult> executePolicyEnforcement(Action action) {
        return Mono.fromCallable(() -> {
            log.info("Enforcing policy for twin: {}", action.getTwinId());
            
            return ActionResult.builder()
                .success(true)
                .message("Policy enforced successfully")
                .data(Map.of("policyId", "POL-001", "enforced", true))
                .build();
        });
    }
    
    private Mono<ActionResult> executeDataCorrection(Action action) {
        return Mono.fromCallable(() -> {
            log.info("Executing data correction for twin: {}", action.getTwinId());
            
            return ActionResult.builder()
                .success(true)
                .message("Data corrected")
                .data(Map.of("recordsCorrected", 5, "validationPassed", true))
                .build();
        });
    }
    
    private Mono<ActionResult> executeWorkflowTrigger(Action action) {
        return Mono.fromCallable(() -> {
            log.info("Triggering workflow for twin: {}", action.getTwinId());
            
            return ActionResult.builder()
                .success(true)
                .message("Workflow triggered")
                .data(Map.of("workflowId", "WF-" + System.currentTimeMillis(), "status", "STARTED"))
                .build();
        });
    }
    
    private Mono<ActionResult> executeCustomAction(Action action) {
        return Mono.fromCallable(() -> {
            log.info("Executing custom action: {} for twin: {}", action.getName(), action.getTwinId());
            
            return ActionResult.builder()
                .success(true)
                .message("Custom action completed")
                .data(action.getParameters())
                .build();
        });
    }
    
    @Data
    @Builder
    public static class ActionResult {
        private boolean success;
        private String message;
        private String error;
        private Map<String, Object> data;
    }
}

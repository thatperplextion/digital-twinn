package com.digitaltwin.common.model;

import lombok.*;
import java.time.Instant;
import java.util.*;

/**
 * Represents an autonomous action triggered by the system
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Action {
    
    private String id;
    private String twinId;
    private String name;
    private ActionType type;
    private ActionPriority priority;
    
    // Trigger information
    private String triggerId;
    private TriggerType triggerType;
    private String triggerReason;
    
    // Action details
    @Builder.Default
    private Map<String, Object> parameters = new HashMap<>();
    @Builder.Default
    private List<String> steps = new ArrayList<>();
    
    // Target
    private String targetSystem;
    private String targetEndpoint;
    
    // Execution
    private ActionStatus status;
    private Instant scheduledAt;
    private Instant startedAt;
    private Instant completedAt;
    private Long executionTimeMs;
    
    // Result
    private Boolean success;
    private String result;
    @Builder.Default
    private Map<String, Object> resultData = new HashMap<>();
    private String errorMessage;
    
    // Retry policy
    private Integer maxRetries;
    @Builder.Default
    private Integer retryCount = 0;
    private Long retryDelayMs;
    
    // Rollback
    private Boolean rollbackable;
    private String rollbackActionId;
    
    // Audit
    private String initiatedBy;
    private String approvedBy;
    @Builder.Default
    private List<String> auditLog = new ArrayList<>();
    
    // Explainability
    private String explanation;
    @Builder.Default
    private List<String> decisionChain = new ArrayList<>();
    
    public enum ActionType {
        RISK_MITIGATION,
        SYSTEM_TUNING,
        AUTO_INTERVENTION,
        RESOURCE_OPTIMIZATION,
        ALERT_NOTIFICATION,
        POLICY_ENFORCEMENT,
        DATA_CORRECTION,
        WORKFLOW_TRIGGER,
        CUSTOM
    }
    
    public enum ActionPriority {
        IMMEDIATE, HIGH, NORMAL, LOW, DEFERRED
    }
    
    public enum TriggerType {
        PREDICTION, ANOMALY, RULE, SCHEDULE, 
        MANUAL, SYSTEM, THRESHOLD, PATTERN
    }
    
    public enum ActionStatus {
        PENDING, APPROVED, SCHEDULED, RUNNING, 
        COMPLETED, FAILED, CANCELLED, ROLLED_BACK
    }
}

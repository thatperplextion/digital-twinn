package com.digitaltwin.common.model;

import lombok.*;
import java.time.Instant;
import java.util.*;

/**
 * Core Digital Twin Entity
 * Represents a live virtual replica of a real-world entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DigitalTwin {
    
    private String id;
    private String entityType;
    private String name;
    private String description;
    
    // Static Attributes - rarely change
    @Builder.Default
    private Map<String, Object> staticAttributes = new HashMap<>();
    
    // Dynamic State Variables - change frequently
    @Builder.Default
    private Map<String, Object> dynamicState = new HashMap<>();
    
    // Behavioral Metrics
    @Builder.Default
    private BehavioralMetrics behavioralMetrics = new BehavioralMetrics();
    
    // Temporal Patterns
    @Builder.Default
    private TemporalPatterns temporalPatterns = new TemporalPatterns();
    
    // Contextual Memory
    @Builder.Default
    private ContextualMemory contextualMemory = new ContextualMemory();
    
    // Current State
    private TwinState currentState;
    
    // Previous States for transition tracking
    @Builder.Default
    private List<TwinState> stateHistory = new ArrayList<>();
    
    // Health & Status
    private TwinHealth health;
    
    // Timestamps
    private Instant createdAt;
    private Instant lastUpdatedAt;
    private Instant lastEventAt;
    
    // Version for optimistic locking
    private Long version;
    
    // Tags for categorization
    @Builder.Default
    private Set<String> tags = new HashSet<>();
    
    // Owner/Tenant ID for multi-tenancy
    private String tenantId;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BehavioralMetrics {
        @Builder.Default
        private double activityScore = 0.0;
        @Builder.Default
        private double riskScore = 0.0;
        @Builder.Default
        private double anomalyScore = 0.0;
        @Builder.Default
        private double engagementScore = 0.0;
        @Builder.Default
        private double performanceScore = 0.0;
        @Builder.Default
        private Map<String, Double> customMetrics = new HashMap<>();
        private Instant lastCalculatedAt;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemporalPatterns {
        @Builder.Default
        private Map<String, Integer> hourlyActivity = new HashMap<>();
        @Builder.Default
        private Map<String, Integer> dailyActivity = new HashMap<>();
        @Builder.Default
        private Map<String, Integer> weeklyActivity = new HashMap<>();
        @Builder.Default
        private List<String> peakActivityTimes = new ArrayList<>();
        @Builder.Default
        private List<String> dormantPeriods = new ArrayList<>();
        private Double seasonalityIndex;
        private Double trendDirection;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContextualMemory {
        @Builder.Default
        private List<String> recentActions = new ArrayList<>();
        @Builder.Default
        private List<String> frequentPatterns = new ArrayList<>();
        @Builder.Default
        private Map<String, Object> preferences = new HashMap<>();
        @Builder.Default
        private Map<String, Object> associations = new HashMap<>();
        @Builder.Default
        private List<String> historicalEmbeddings = new ArrayList<>();
        private Integer memoryWindowSize;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TwinHealth {
        private HealthStatus status;
        private Double healthScore;
        private Instant lastHealthCheck;
        @Builder.Default
        private List<String> activeAlerts = new ArrayList<>();
        @Builder.Default
        private Map<String, String> diagnostics = new HashMap<>();
    }
    
    public enum HealthStatus {
        HEALTHY, DEGRADED, CRITICAL, UNKNOWN, OFFLINE
    }
}

package com.digitaltwin.dashboard.controller;

import com.digitaltwin.common.dto.*;
import com.digitaltwin.common.model.*;
import com.digitaltwin.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Main Dashboard API Controller
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dashboard", description = "Digital Twin Dashboard API")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    // ==================== Twin Management ====================
    
    @GetMapping("/twins")
    @Operation(summary = "Get all digital twins")
    public Flux<TwinSnapshot> getAllTwins(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String tenantId) {
        return dashboardService.getAllTwins(entityType, tenantId);
    }
    
    @GetMapping("/twins/{twinId}")
    @Operation(summary = "Get digital twin snapshot")
    public Mono<TwinSnapshot> getTwinSnapshot(@PathVariable String twinId) {
        return dashboardService.getTwinSnapshot(twinId);
    }
    
    @PostMapping("/twins")
    @Operation(summary = "Create a new digital twin")
    public Mono<DigitalTwin> createTwin(@RequestBody CreateTwinRequest request) {
        return dashboardService.createTwin(request);
    }
    
    @DeleteMapping("/twins/{twinId}")
    @Operation(summary = "Delete a digital twin")
    public Mono<Void> deleteTwin(@PathVariable String twinId) {
        return dashboardService.deleteTwin(twinId);
    }
    
    // ==================== State & History ====================
    
    @GetMapping("/twins/{twinId}/state")
    @Operation(summary = "Get current state of a twin")
    public Mono<TwinState> getCurrentState(@PathVariable String twinId) {
        return dashboardService.getCurrentState(twinId);
    }
    
    @GetMapping("/twins/{twinId}/state-history")
    @Operation(summary = "Get state history of a twin")
    public Flux<TwinState> getStateHistory(
            @PathVariable String twinId,
            @RequestParam(defaultValue = "100") int limit) {
        return dashboardService.getStateHistory(twinId, limit);
    }
    
    // ==================== Predictions ====================
    
    @GetMapping("/twins/{twinId}/predictions")
    @Operation(summary = "Get predictions for a twin")
    public Flux<Prediction> getPredictions(@PathVariable String twinId) {
        return dashboardService.getPredictions(twinId);
    }
    
    @GetMapping("/twins/{twinId}/predictions/latest")
    @Operation(summary = "Get latest prediction of each type")
    public Mono<Map<String, Prediction>> getLatestPredictions(@PathVariable String twinId) {
        return dashboardService.getLatestPredictions(twinId);
    }
    
    // ==================== Anomalies ====================
    
    @GetMapping("/twins/{twinId}/anomalies")
    @Operation(summary = "Get anomalies for a twin")
    public Flux<Anomaly> getAnomalies(
            @PathVariable String twinId,
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        return dashboardService.getAnomalies(twinId, activeOnly);
    }
    
    @PostMapping("/anomalies/{anomalyId}/resolve")
    @Operation(summary = "Resolve an anomaly")
    public Mono<Anomaly> resolveAnomaly(
            @PathVariable String anomalyId,
            @RequestBody Map<String, String> resolution) {
        return dashboardService.resolveAnomaly(anomalyId, resolution.get("resolution"));
    }
    
    // ==================== Actions ====================
    
    @GetMapping("/twins/{twinId}/actions")
    @Operation(summary = "Get action history for a twin")
    public Flux<Action> getActions(@PathVariable String twinId) {
        return dashboardService.getActions(twinId);
    }
    
    @PostMapping("/actions/{actionId}/cancel")
    @Operation(summary = "Cancel a pending action")
    public Mono<Action> cancelAction(
            @PathVariable String actionId,
            @RequestBody Map<String, String> request) {
        return dashboardService.cancelAction(actionId, request.get("reason"));
    }
    
    // ==================== Metrics & Analytics ====================
    
    @GetMapping("/twins/{twinId}/metrics")
    @Operation(summary = "Get behavioral metrics")
    public Mono<DigitalTwin.BehavioralMetrics> getMetrics(@PathVariable String twinId) {
        return dashboardService.getMetrics(twinId);
    }
    
    @GetMapping("/twins/{twinId}/temporal-patterns")
    @Operation(summary = "Get temporal patterns")
    public Mono<DigitalTwin.TemporalPatterns> getTemporalPatterns(@PathVariable String twinId) {
        return dashboardService.getTemporalPatterns(twinId);
    }
    
    // ==================== Explainability ====================
    
    @GetMapping("/twins/{twinId}/explain")
    @Operation(summary = "Get explainability report for twin's current state")
    public Mono<ExplainabilityReport> getExplainabilityReport(@PathVariable String twinId) {
        return dashboardService.getExplainabilityReport(twinId);
    }
    
    @GetMapping("/actions/{actionId}/explain")
    @Operation(summary = "Get explainability report for an action")
    public Mono<ExplainabilityReport> getActionExplainability(@PathVariable String actionId) {
        return dashboardService.getActionExplainability(actionId);
    }
    
    // ==================== Streaming ====================
    
    @GetMapping(value = "/twins/{twinId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream real-time updates for a twin")
    public Flux<StreamUpdate> streamUpdates(@PathVariable String twinId) {
        return dashboardService.streamUpdates(twinId);
    }
    
    @GetMapping(value = "/stream/all", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream all updates")
    public Flux<StreamUpdate> streamAllUpdates() {
        return dashboardService.streamAllUpdates();
    }
    
    // ==================== System Status ====================
    
    @GetMapping("/status")
    @Operation(summary = "Get system status")
    public Mono<Map<String, Object>> getSystemStatus() {
        return dashboardService.getSystemStatus();
    }
    
    @GetMapping("/stats")
    @Operation(summary = "Get platform statistics")
    public Mono<Map<String, Object>> getPlatformStats() {
        return dashboardService.getPlatformStats();
    }
}

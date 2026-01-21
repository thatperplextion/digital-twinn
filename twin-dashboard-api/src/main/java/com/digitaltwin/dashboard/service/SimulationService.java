package com.digitaltwin.dashboard.service;

import com.digitaltwin.common.dto.*;
import com.digitaltwin.common.model.*;
import com.digitaltwin.common.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

/**
 * Service for simulation and demo features
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SimulationService {
    
    private final DashboardService dashboardService;
    
    private static final List<String> SCENARIOS = List.of(
        "smart-city-traffic",
        "healthcare-patient-monitoring",
        "manufacturing-predictive-maintenance",
        "financial-fraud-detection",
        "cybersecurity-threat-detection"
    );
    
    private static final List<String> EVENT_TYPES = List.of(
        "USER_ACTION", "SENSOR_READING", "SYSTEM_EVENT", 
        "TRANSACTION", "HEARTBEAT", "METRIC"
    );
    
    public Flux<EventResponse> generateEvents(String twinId, int count, int intervalMs) {
        return Flux.interval(Duration.ofMillis(intervalMs))
            .take(count)
            .map(i -> generateRandomEvent(twinId, i))
            .doOnNext(event -> updateTwinFromEvent(twinId, event));
    }
    
    private EventResponse generateRandomEvent(String twinId, long sequence) {
        Random random = new Random();
        String eventType = EVENT_TYPES.get(random.nextInt(EVENT_TYPES.size()));
        
        // Update twin state
        DigitalTwin twin = dashboardService.getTwinStore().get(twinId);
        if (twin != null) {
            twin.getBehavioralMetrics().setActivityScore(
                Math.min(1.0, twin.getBehavioralMetrics().getActivityScore() + 0.05));
            twin.setLastUpdatedAt(Instant.now());
            
            // Update temporal patterns
            String hour = String.format("%02d", Instant.now().atZone(java.time.ZoneId.systemDefault()).getHour());
            twin.getTemporalPatterns().getHourlyActivity().merge(hour, 1, Integer::sum);
            
            // Add to recent actions
            twin.getContextualMemory().getRecentActions().add(0, eventType);
            if (twin.getContextualMemory().getRecentActions().size() > 50) {
                twin.getContextualMemory().setRecentActions(
                    new ArrayList<>(twin.getContextualMemory().getRecentActions().subList(0, 50)));
            }
        }
        
        // Publish stream update
        dashboardService.publishUpdate(StreamUpdate.builder()
            .updateId(IdGenerator.generateId())
            .type(StreamUpdate.UpdateType.METRIC_UPDATE)
            .twinId(twinId)
            .changes(Map.of("eventType", eventType, "sequence", sequence))
            .timestamp(Instant.now())
            .sequenceNumber(sequence)
            .build());
        
        return EventResponse.builder()
            .eventId(IdGenerator.generateTimeBasedId("EVT"))
            .twinId(twinId)
            .status("PROCESSED")
            .receivedAt(Instant.now())
            .processingLatencyMs((long) (Math.random() * 50))
            .message("Event " + sequence + " processed: " + eventType)
            .build();
    }
    
    private void updateTwinFromEvent(String twinId, EventResponse event) {
        // Twin state updates handled in generateRandomEvent
    }
    
    public Mono<Map<String, Object>> runScenario(String scenarioName, Map<String, Object> parameters) {
        return switch (scenarioName) {
            case "smart-city-traffic" -> runSmartCityScenario(parameters);
            case "healthcare-patient-monitoring" -> runHealthcareScenario(parameters);
            case "manufacturing-predictive-maintenance" -> runManufacturingScenario(parameters);
            case "financial-fraud-detection" -> runFinancialScenario(parameters);
            case "cybersecurity-threat-detection" -> runCybersecurityScenario(parameters);
            default -> Mono.just(Map.of("error", "Unknown scenario: " + scenarioName));
        };
    }
    
    private Mono<Map<String, Object>> runSmartCityScenario(Map<String, Object> params) {
        // Create traffic sensor twins
        List<String> createdTwins = new ArrayList<>();
        
        for (int i = 1; i <= 5; i++) {
            CreateTwinRequest request = CreateTwinRequest.builder()
                .entityType("TRAFFIC_SENSOR")
                .name("Traffic Sensor " + i)
                .description("Smart city traffic monitoring sensor")
                .staticAttributes(Map.of(
                    "location", "Intersection " + i,
                    "sensorType", "CAMERA_LIDAR"
                ))
                .initialState(Map.of(
                    "vehicleCount", 0,
                    "averageSpeed", 50,
                    "congestionLevel", "LOW"
                ))
                .tags(Set.of("smart-city", "traffic"))
                .build();
            
            dashboardService.createTwin(request).subscribe(twin -> {
                createdTwins.add(twin.getId());
                generateEvents(twin.getId(), 20, 500).subscribe();
            });
        }
        
        return Mono.just(Map.of(
            "scenario", "smart-city-traffic",
            "status", "RUNNING",
            "twinsCreated", 5,
            "message", "Smart city traffic scenario started"
        ));
    }
    
    private Mono<Map<String, Object>> runHealthcareScenario(Map<String, Object> params) {
        for (int i = 1; i <= 3; i++) {
            CreateTwinRequest request = CreateTwinRequest.builder()
                .entityType("PATIENT")
                .name("Patient " + i)
                .description("Patient digital twin for monitoring")
                .staticAttributes(Map.of(
                    "age", 30 + i * 10,
                    "bloodType", "O+"
                ))
                .initialState(Map.of(
                    "heartRate", 72,
                    "bloodPressure", "120/80",
                    "temperature", 98.6
                ))
                .tags(Set.of("healthcare", "patient"))
                .build();
            
            dashboardService.createTwin(request).subscribe(twin -> 
                generateEvents(twin.getId(), 30, 1000).subscribe());
        }
        
        return Mono.just(Map.of(
            "scenario", "healthcare-patient-monitoring",
            "status", "RUNNING",
            "message", "Healthcare monitoring scenario started"
        ));
    }
    
    private Mono<Map<String, Object>> runManufacturingScenario(Map<String, Object> params) {
        CreateTwinRequest request = CreateTwinRequest.builder()
            .entityType("MACHINE")
            .name("CNC Machine 1")
            .description("Manufacturing machine digital twin")
            .staticAttributes(Map.of(
                "model", "CNC-5000",
                "installDate", "2023-01-15"
            ))
            .initialState(Map.of(
                "temperature", 45.0,
                "vibration", 0.5,
                "rpm", 3000
            ))
            .tags(Set.of("manufacturing", "machine"))
            .build();
        
        return dashboardService.createTwin(request)
            .flatMap(twin -> {
                generateEvents(twin.getId(), 50, 500).subscribe();
                return Mono.just(Map.<String, Object>of(
                    "scenario", "manufacturing-predictive-maintenance",
                    "status", "RUNNING",
                    "twinId", twin.getId()
                ));
            });
    }
    
    private Mono<Map<String, Object>> runFinancialScenario(Map<String, Object> params) {
        CreateTwinRequest request = CreateTwinRequest.builder()
            .entityType("ACCOUNT")
            .name("Account Digital Twin")
            .description("Financial account for fraud detection")
            .staticAttributes(Map.of(
                "accountType", "CHECKING",
                "openDate", "2022-06-01"
            ))
            .initialState(Map.of(
                "balance", 10000.0,
                "lastTransaction", Instant.now().toString()
            ))
            .tags(Set.of("financial", "fraud-detection"))
            .build();
        
        return dashboardService.createTwin(request)
            .flatMap(twin -> {
                generateEvents(twin.getId(), 40, 300).subscribe();
                return Mono.just(Map.<String, Object>of(
                    "scenario", "financial-fraud-detection",
                    "status", "RUNNING",
                    "twinId", twin.getId()
                ));
            });
    }
    
    private Mono<Map<String, Object>> runCybersecurityScenario(Map<String, Object> params) {
        CreateTwinRequest request = CreateTwinRequest.builder()
            .entityType("NETWORK_DEVICE")
            .name("Firewall Twin")
            .description("Network device for threat detection")
            .staticAttributes(Map.of(
                "deviceType", "FIREWALL",
                "firmwareVersion", "2.1.0"
            ))
            .initialState(Map.of(
                "packetsProcessed", 0,
                "threatsBlocked", 0,
                "cpuUsage", 30.0
            ))
            .tags(Set.of("cybersecurity", "network"))
            .build();
        
        return dashboardService.createTwin(request)
            .flatMap(twin -> {
                generateEvents(twin.getId(), 100, 100).subscribe();
                return Mono.just(Map.<String, Object>of(
                    "scenario", "cybersecurity-threat-detection",
                    "status", "RUNNING",
                    "twinId", twin.getId()
                ));
            });
    }
    
    public Mono<Map<String, Object>> triggerAnomaly(String twinId, String anomalyType) {
        DigitalTwin twin = dashboardService.getTwinStore().get(twinId);
        if (twin == null) {
            return Mono.just(Map.of("error", "Twin not found"));
        }
        
        Anomaly.AnomalyType type = Anomaly.AnomalyType.valueOf(anomalyType);
        
        Anomaly anomaly = Anomaly.builder()
            .id(IdGenerator.generateTimeBasedId("ANOM"))
            .twinId(twinId)
            .type(type)
            .severity(Anomaly.AnomalySeverity.HIGH)
            .anomalyScore(0.85)
            .threshold(0.5)
            .deviation(0.35)
            .title("Simulated " + type)
            .description("This is a simulated anomaly for demonstration")
            .status(Anomaly.AnomalyStatus.DETECTED)
            .detectedAt(Instant.now())
            .startedAt(Instant.now())
            .potentialCauses(List.of("Simulated cause 1", "Simulated cause 2"))
            .explanation("Anomaly triggered via simulation API")
            .build();
        
        dashboardService.getAnomalyStore()
            .computeIfAbsent(twinId, k -> new ArrayList<>())
            .add(anomaly);
        
        // Update twin metrics
        twin.getBehavioralMetrics().setAnomalyScore(0.85);
        twin.getBehavioralMetrics().setRiskScore(0.75);
        
        // Publish update
        dashboardService.publishUpdate(StreamUpdate.builder()
            .updateId(IdGenerator.generateId())
            .type(StreamUpdate.UpdateType.ANOMALY_DETECTED)
            .twinId(twinId)
            .payload(anomaly)
            .timestamp(Instant.now())
            .build());
        
        return Mono.just(Map.of(
            "anomalyId", anomaly.getId(),
            "type", anomalyType,
            "severity", anomaly.getSeverity().name(),
            "message", "Anomaly triggered successfully"
        ));
    }
    
    public Mono<Map<String, Object>> cloneTwin(String twinId, String prefix) {
        DigitalTwin original = dashboardService.getTwinStore().get(twinId);
        if (original == null) {
            return Mono.just(Map.of("error", "Twin not found"));
        }
        
        String cloneId = prefix + "-" + IdGenerator.generateId().substring(0, 8);
        
        DigitalTwin clone = DigitalTwin.builder()
            .id(cloneId)
            .entityType(original.getEntityType())
            .name(prefix + ": " + original.getName())
            .description("Clone of " + original.getId())
            .staticAttributes(new HashMap<>(original.getStaticAttributes()))
            .dynamicState(new HashMap<>(original.getDynamicState()))
            .behavioralMetrics(DigitalTwin.BehavioralMetrics.builder()
                .activityScore(original.getBehavioralMetrics().getActivityScore())
                .riskScore(original.getBehavioralMetrics().getRiskScore())
                .build())
            .temporalPatterns(DigitalTwin.TemporalPatterns.builder().build())
            .contextualMemory(DigitalTwin.ContextualMemory.builder().build())
            .currentState(original.getCurrentState())
            .stateHistory(new ArrayList<>())
            .health(DigitalTwin.TwinHealth.builder()
                .status(DigitalTwin.HealthStatus.HEALTHY)
                .healthScore(100.0)
                .build())
            .createdAt(Instant.now())
            .lastUpdatedAt(Instant.now())
            .tags(new HashSet<>(original.getTags()))
            .version(1L)
            .build();
        
        dashboardService.getTwinStore().put(cloneId, clone);
        
        return Mono.just(Map.of(
            "originalId", twinId,
            "cloneId", cloneId,
            "message", "Twin cloned successfully"
        ));
    }
    
    public Mono<Map<String, Object>> replayState(String twinId, String timestamp) {
        // In production, query historical state from time-series database
        return Mono.just(Map.of(
            "twinId", twinId,
            "requestedTime", timestamp,
            "message", "Time travel feature - historical state replay",
            "note", "In production, this would query time-series data"
        ));
    }
    
    public Mono<Map<String, Object>> whatIfAnalysis(String twinId, Map<String, Object> hypotheticalState) {
        DigitalTwin twin = dashboardService.getTwinStore().get(twinId);
        if (twin == null) {
            return Mono.just(Map.of("error", "Twin not found"));
        }
        
        // Simulate what-if scenario
        Map<String, Object> projectedOutcome = new HashMap<>();
        projectedOutcome.put("originalState", twin.getDynamicState());
        projectedOutcome.put("hypotheticalState", hypotheticalState);
        projectedOutcome.put("projectedRiskScore", calculateProjectedRisk(hypotheticalState));
        projectedOutcome.put("projectedAnomalyProbability", calculateAnomalyProbability(hypotheticalState));
        projectedOutcome.put("recommendations", generateRecommendations(hypotheticalState));
        
        return Mono.just(projectedOutcome);
    }
    
    private double calculateProjectedRisk(Map<String, Object> state) {
        // Simplified risk calculation
        return Math.random() * 0.5 + 0.2;
    }
    
    private double calculateAnomalyProbability(Map<String, Object> state) {
        return Math.random() * 0.3;
    }
    
    private List<String> generateRecommendations(Map<String, Object> state) {
        return List.of(
            "Monitor closely for the next 24 hours",
            "Consider adjusting threshold parameters",
            "Review historical patterns for similar states"
        );
    }
    
    public Flux<String> listScenarios() {
        return Flux.fromIterable(SCENARIOS);
    }
}

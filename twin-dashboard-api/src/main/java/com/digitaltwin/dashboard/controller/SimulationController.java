package com.digitaltwin.dashboard.controller;

import com.digitaltwin.common.dto.EventResponse;
import com.digitaltwin.dashboard.service.SimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Controller for simulation and demo features
 */
@RestController
@RequestMapping("/api/v1/simulation")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Simulation", description = "Simulation and demo endpoints")
public class SimulationController {
    
    private final SimulationService simulationService;
    
    @PostMapping("/generate-events/{twinId}")
    @Operation(summary = "Generate simulated events for a twin")
    public Flux<EventResponse> generateEvents(
            @PathVariable String twinId,
            @RequestParam(defaultValue = "10") int count,
            @RequestParam(defaultValue = "1000") int intervalMs) {
        return simulationService.generateEvents(twinId, count, intervalMs);
    }
    
    @PostMapping("/scenario/{scenarioName}")
    @Operation(summary = "Run a predefined scenario")
    public Mono<Map<String, Object>> runScenario(
            @PathVariable String scenarioName,
            @RequestBody(required = false) Map<String, Object> parameters) {
        return simulationService.runScenario(scenarioName, parameters);
    }
    
    @PostMapping("/trigger-anomaly/{twinId}")
    @Operation(summary = "Trigger a simulated anomaly")
    public Mono<Map<String, Object>> triggerAnomaly(
            @PathVariable String twinId,
            @RequestParam(defaultValue = "BEHAVIORAL_DEVIATION") String anomalyType) {
        return simulationService.triggerAnomaly(twinId, anomalyType);
    }
    
    @PostMapping("/clone/{twinId}")
    @Operation(summary = "Clone a digital twin for simulation")
    public Mono<Map<String, Object>> cloneTwin(
            @PathVariable String twinId,
            @RequestParam(defaultValue = "SIMULATION") String prefix) {
        return simulationService.cloneTwin(twinId, prefix);
    }
    
    @PostMapping("/time-travel/{twinId}")
    @Operation(summary = "Replay twin state at a specific time")
    public Mono<Map<String, Object>> timeTravel(
            @PathVariable String twinId,
            @RequestParam String timestamp) {
        return simulationService.replayState(twinId, timestamp);
    }
    
    @PostMapping("/what-if/{twinId}")
    @Operation(summary = "Run what-if scenario")
    public Mono<Map<String, Object>> whatIfAnalysis(
            @PathVariable String twinId,
            @RequestBody Map<String, Object> hypotheticalState) {
        return simulationService.whatIfAnalysis(twinId, hypotheticalState);
    }
    
    @GetMapping("/scenarios")
    @Operation(summary = "List available scenarios")
    public Flux<String> listScenarios() {
        return simulationService.listScenarios();
    }
}

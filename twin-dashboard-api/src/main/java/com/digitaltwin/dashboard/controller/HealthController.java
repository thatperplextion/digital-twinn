package com.digitaltwin.dashboard.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Health and root endpoint controller
 */
@RestController
public class HealthController {
    
    @GetMapping("/")
    public Mono<Map<String, Object>> root() {
        return Mono.just(Map.of(
            "service", "Digital Twin Dashboard API",
            "status", "running",
            "version", "1.0.0",
            "docs", "/swagger-ui.html"
        ));
    }
    
    @GetMapping("/health")
    public Mono<Map<String, String>> health() {
        return Mono.just(Map.of("status", "UP"));
    }
    
    @GetMapping("/api/v1/health")
    public Mono<Map<String, String>> apiHealth() {
        return Mono.just(Map.of("status", "UP"));
    }
}

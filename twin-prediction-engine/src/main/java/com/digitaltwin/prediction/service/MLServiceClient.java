package com.digitaltwin.prediction.service;

import com.digitaltwin.common.model.DigitalTwin;
import com.digitaltwin.common.model.Prediction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * Client for external ML service (Python-based)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MLServiceClient {
    
    private final WebClient.Builder webClientBuilder;
    
    private static final String ML_SERVICE_URL = "http://localhost:5000";
    
    public Mono<Prediction> getMLPrediction(DigitalTwin twin, String predictionType) {
        return webClientBuilder.build()
            .post()
            .uri(ML_SERVICE_URL + "/predict")
            .bodyValue(twin)
            .retrieve()
            .bodyToMono(Prediction.class)
            .onErrorResume(e -> {
                log.warn("ML service unavailable, using fallback: {}", e.getMessage());
                return Mono.empty();
            });
    }
}

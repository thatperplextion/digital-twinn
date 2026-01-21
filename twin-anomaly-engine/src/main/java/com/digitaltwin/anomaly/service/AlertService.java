package com.digitaltwin.anomaly.service;

import com.digitaltwin.common.model.Anomaly;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * Service for sending alerts based on anomalies
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    private static final String ALERTS_TOPIC = "twin-alerts";
    
    public Mono<Void> sendAlert(Anomaly anomaly) {
        return Mono.fromFuture(() -> 
            kafkaTemplate.send(ALERTS_TOPIC, anomaly.getTwinId(), anomaly).toCompletableFuture())
            .doOnSuccess(result -> 
                log.info("Alert sent for anomaly: {} ({})", anomaly.getId(), anomaly.getSeverity()))
            .doOnError(e -> 
                log.error("Failed to send alert for anomaly: {}", anomaly.getId(), e))
            .then();
    }
}

package com.digitaltwin.state.consumer;

import com.digitaltwin.common.model.TwinEvent;
import com.digitaltwin.state.service.TwinStateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Kafka consumer for twin events
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EventConsumer {
    
    private final TwinStateService twinStateService;
    
    @KafkaListener(
        topics = "twin-events",
        groupId = "state-engine",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeEvent(TwinEvent event) {
        log.debug("Received event: {} for twin: {}", event.getId(), event.getTwinId());
        
        twinStateService.processEvent(event)
            .doOnSuccess(twin -> log.debug("Processed event for twin: {}", twin.getId()))
            .doOnError(e -> log.error("Failed to process event: {}", event.getId(), e))
            .subscribe();
    }
}

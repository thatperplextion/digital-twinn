package com.digitaltwin.core.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Shared Kafka topic configuration
 */
@Configuration
public class CoreKafkaConfig {
    
    public static final String TWIN_EVENTS_TOPIC = "twin-events";
    public static final String TWIN_ALERTS_TOPIC = "twin-alerts";
    public static final String TWIN_PREDICTIONS_TOPIC = "twin-predictions";
    public static final String TWIN_ACTIONS_TOPIC = "twin-actions";
    public static final String TWIN_STATE_CHANGES_TOPIC = "twin-state-changes";
    
    @Bean
    public NewTopic twinEventsTopic() {
        return TopicBuilder.name(TWIN_EVENTS_TOPIC)
            .partitions(12)
            .replicas(1)
            .build();
    }
    
    @Bean
    public NewTopic twinAlertsTopic() {
        return TopicBuilder.name(TWIN_ALERTS_TOPIC)
            .partitions(6)
            .replicas(1)
            .build();
    }
    
    @Bean
    public NewTopic twinPredictionsTopic() {
        return TopicBuilder.name(TWIN_PREDICTIONS_TOPIC)
            .partitions(6)
            .replicas(1)
            .build();
    }
    
    @Bean
    public NewTopic twinActionsTopic() {
        return TopicBuilder.name(TWIN_ACTIONS_TOPIC)
            .partitions(6)
            .replicas(1)
            .build();
    }
    
    @Bean
    public NewTopic twinStateChangesTopic() {
        return TopicBuilder.name(TWIN_STATE_CHANGES_TOPIC)
            .partitions(12)
            .replicas(1)
            .build();
    }
}

package com.digitaltwin.gateway.service;

import com.digitaltwin.common.dto.StreamUpdate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import jakarta.annotation.PostConstruct;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing real-time streaming subscriptions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StreamingService {
    
    private final ReactiveRedisTemplate<String, String> redisTemplate;
    
    // Multi-subscriber sink for broadcasting updates
    private final Sinks.Many<StreamUpdate> updateSink = 
        Sinks.many().multicast().onBackpressureBuffer(10000);
    
    // Track subscriptions per session
    private final Map<String, String> sessionSubscriptions = new ConcurrentHashMap<>();
    
    private static final String UPDATES_CHANNEL = "twin-updates";
    
    @PostConstruct
    public void initialize() {
        // Subscribe to Redis pub/sub for cluster-wide update distribution
        redisTemplate.listenTo(ChannelTopic.of(UPDATES_CHANNEL))
            .subscribe(message -> {
                log.debug("Received update from Redis channel");
                // Parse and emit update
            });
    }
    
    /**
     * Subscribe to updates for a specific twin or all twins
     */
    public Flux<StreamUpdate> subscribeToUpdates(String twinId) {
        return updateSink.asFlux()
            .filter(update -> "*".equals(twinId) || twinId.equals(update.getTwinId()))
            .doOnSubscribe(sub -> log.debug("New subscription for twin: {}", twinId))
            .doOnCancel(() -> log.debug("Subscription cancelled for twin: {}", twinId));
    }
    
    /**
     * Publish an update to all subscribers
     */
    public void publishUpdate(StreamUpdate update) {
        Sinks.EmitResult result = updateSink.tryEmitNext(update);
        if (result.isFailure()) {
            log.warn("Failed to emit update: {} - {}", update.getUpdateId(), result);
        }
        
        // Also publish to Redis for cluster distribution
        redisTemplate.convertAndSend(UPDATES_CHANNEL, update.toString())
            .subscribe();
    }
    
    /**
     * Unsubscribe a session
     */
    public void unsubscribe(String sessionId) {
        sessionSubscriptions.remove(sessionId);
        log.debug("Session unsubscribed: {}", sessionId);
    }
    
    /**
     * Get active subscription count
     */
    public int getActiveSubscriptionCount() {
        return sessionSubscriptions.size();
    }
}

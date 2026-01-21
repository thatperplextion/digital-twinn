package com.digitaltwin.state.service;

import com.digitaltwin.common.model.DigitalTwin;
import com.digitaltwin.common.util.JsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Cache for digital twin state in Redis
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StateCache {
    
    private final ReactiveRedisTemplate<String, String> redisTemplate;
    
    private static final String TWIN_KEY_PREFIX = "twin:";
    private static final String STATE_KEY_PREFIX = "twin:state:";
    private static final Duration DEFAULT_TTL = Duration.ofHours(24);
    
    /**
     * Cache a digital twin
     */
    public Mono<Boolean> cacheTwin(DigitalTwin twin) {
        String key = TWIN_KEY_PREFIX + twin.getId();
        String value = JsonUtils.toJson(twin);
        
        return redisTemplate.opsForValue()
            .set(key, value, DEFAULT_TTL)
            .doOnSuccess(success -> log.debug("Cached twin: {}", twin.getId()))
            .doOnError(e -> log.error("Failed to cache twin: {}", twin.getId(), e));
    }
    
    /**
     * Get a cached digital twin
     */
    public Mono<DigitalTwin> getCachedTwin(String twinId) {
        String key = TWIN_KEY_PREFIX + twinId;
        
        return redisTemplate.opsForValue()
            .get(key)
            .map(json -> JsonUtils.fromJson(json, DigitalTwin.class))
            .doOnSuccess(twin -> {
                if (twin != null) {
                    log.debug("Cache hit for twin: {}", twinId);
                } else {
                    log.debug("Cache miss for twin: {}", twinId);
                }
            });
    }
    
    /**
     * Remove a twin from cache
     */
    public Mono<Void> removeTwin(String twinId) {
        String key = TWIN_KEY_PREFIX + twinId;
        
        return redisTemplate.delete(key)
            .doOnSuccess(count -> log.debug("Removed twin from cache: {}", twinId))
            .then();
    }
    
    /**
     * Update twin state in cache
     */
    public Mono<Boolean> updateTwinState(String twinId, String stateName) {
        String key = STATE_KEY_PREFIX + twinId;
        
        return redisTemplate.opsForValue()
            .set(key, stateName, DEFAULT_TTL);
    }
    
    /**
     * Get current state name from cache
     */
    public Mono<String> getCurrentStateName(String twinId) {
        String key = STATE_KEY_PREFIX + twinId;
        
        return redisTemplate.opsForValue().get(key);
    }
    
    /**
     * Refresh TTL for a twin
     */
    public Mono<Boolean> refreshTwin(String twinId) {
        String key = TWIN_KEY_PREFIX + twinId;
        
        return redisTemplate.expire(key, DEFAULT_TTL);
    }
}

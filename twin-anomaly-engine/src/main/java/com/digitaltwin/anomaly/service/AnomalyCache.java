package com.digitaltwin.anomaly.service;

import com.digitaltwin.common.model.Anomaly;
import com.digitaltwin.common.util.JsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Cache for anomalies
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AnomalyCache {
    
    private final ReactiveRedisTemplate<String, String> redisTemplate;
    
    private static final String ANOMALY_KEY_PREFIX = "anomaly:";
    private static final String TWIN_ANOMALIES_PREFIX = "anomalies:twin:";
    private static final String ACTIVE_ANOMALIES_KEY = "anomalies:active";
    private static final Duration DEFAULT_TTL = Duration.ofHours(24);
    
    public Mono<Boolean> cacheAnomaly(String twinId, Anomaly anomaly) {
        String key = ANOMALY_KEY_PREFIX + anomaly.getId();
        String listKey = TWIN_ANOMALIES_PREFIX + twinId;
        
        return redisTemplate.opsForValue()
            .set(key, JsonUtils.toJson(anomaly), DEFAULT_TTL)
            .then(redisTemplate.opsForList().rightPush(listKey, anomaly.getId()))
            .then(redisTemplate.opsForSet().add(ACTIVE_ANOMALIES_KEY, anomaly.getId()))
            .thenReturn(true);
    }
    
    public Mono<Anomaly> getAnomaly(String anomalyId) {
        String key = ANOMALY_KEY_PREFIX + anomalyId;
        
        return redisTemplate.opsForValue()
            .get(key)
            .map(json -> JsonUtils.fromJson(json, Anomaly.class));
    }
    
    public Flux<Anomaly> getActiveAnomalies(String twinId) {
        String listKey = TWIN_ANOMALIES_PREFIX + twinId;
        
        return redisTemplate.opsForList()
            .range(listKey, 0, -1)
            .flatMap(this::getAnomaly)
            .filter(anomaly -> anomaly.getStatus() != Anomaly.AnomalyStatus.RESOLVED);
    }
    
    public Mono<Boolean> updateAnomaly(Anomaly anomaly) {
        String key = ANOMALY_KEY_PREFIX + anomaly.getId();
        
        return redisTemplate.opsForValue()
            .set(key, JsonUtils.toJson(anomaly), DEFAULT_TTL)
            .doOnSuccess(success -> {
                if (anomaly.getStatus() == Anomaly.AnomalyStatus.RESOLVED) {
                    redisTemplate.opsForSet().remove(ACTIVE_ANOMALIES_KEY, anomaly.getId()).subscribe();
                }
            });
    }
}

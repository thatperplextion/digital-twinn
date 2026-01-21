package com.digitaltwin.state.repository;

import com.digitaltwin.common.model.DigitalTwin;
import com.digitaltwin.common.util.JsonUtils;
import com.digitaltwin.state.service.TwinRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Redis-based implementation of TwinRepository
 * In production, combine with PostgreSQL for persistence
 */
@Repository
@RequiredArgsConstructor
@Slf4j
public class RedisTwinRepository implements TwinRepository {
    
    private final ReactiveRedisTemplate<String, String> redisTemplate;
    
    private static final String TWIN_KEY_PREFIX = "twin:";
    private static final String TWIN_SET_KEY = "twins:all";
    private static final String TWIN_TYPE_PREFIX = "twins:type:";
    private static final String TWIN_TENANT_PREFIX = "twins:tenant:";
    private static final Duration DEFAULT_TTL = Duration.ofDays(30);
    
    @Override
    public Mono<DigitalTwin> save(DigitalTwin twin) {
        String key = TWIN_KEY_PREFIX + twin.getId();
        String json = JsonUtils.toJson(twin);
        
        return redisTemplate.opsForValue()
            .set(key, json, DEFAULT_TTL)
            .then(redisTemplate.opsForSet().add(TWIN_SET_KEY, twin.getId()))
            .then(redisTemplate.opsForSet().add(TWIN_TYPE_PREFIX + twin.getEntityType(), twin.getId()))
            .then(twin.getTenantId() != null ? 
                redisTemplate.opsForSet().add(TWIN_TENANT_PREFIX + twin.getTenantId(), twin.getId()) : 
                Mono.just(1L))
            .thenReturn(twin)
            .doOnSuccess(saved -> log.debug("Saved twin: {}", saved.getId()));
    }
    
    @Override
    public Mono<DigitalTwin> findById(String id) {
        String key = TWIN_KEY_PREFIX + id;
        
        return redisTemplate.opsForValue()
            .get(key)
            .map(json -> JsonUtils.fromJson(json, DigitalTwin.class));
    }
    
    @Override
    public Flux<DigitalTwin> findAll() {
        return redisTemplate.opsForSet()
            .members(TWIN_SET_KEY)
            .flatMap(this::findById);
    }
    
    @Override
    public Flux<DigitalTwin> findByEntityType(String entityType) {
        return redisTemplate.opsForSet()
            .members(TWIN_TYPE_PREFIX + entityType)
            .flatMap(this::findById);
    }
    
    @Override
    public Flux<DigitalTwin> findByTenantId(String tenantId) {
        return redisTemplate.opsForSet()
            .members(TWIN_TENANT_PREFIX + tenantId)
            .flatMap(this::findById);
    }
    
    @Override
    public Mono<Void> deleteById(String id) {
        return findById(id)
            .flatMap(twin -> {
                String key = TWIN_KEY_PREFIX + id;
                return redisTemplate.delete(key)
                    .then(redisTemplate.opsForSet().remove(TWIN_SET_KEY, id))
                    .then(redisTemplate.opsForSet().remove(TWIN_TYPE_PREFIX + twin.getEntityType(), id))
                    .then(twin.getTenantId() != null ?
                        redisTemplate.opsForSet().remove(TWIN_TENANT_PREFIX + twin.getTenantId(), id) :
                        Mono.just(1L));
            })
            .then()
            .doOnSuccess(v -> log.debug("Deleted twin: {}", id));
    }
    
    @Override
    public Mono<Boolean> existsById(String id) {
        String key = TWIN_KEY_PREFIX + id;
        return redisTemplate.hasKey(key);
    }
    
    @Override
    public Mono<Long> count() {
        return redisTemplate.opsForSet().size(TWIN_SET_KEY);
    }
}

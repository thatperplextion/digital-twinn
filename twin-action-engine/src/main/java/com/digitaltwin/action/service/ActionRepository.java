package com.digitaltwin.action.service;

import com.digitaltwin.common.model.Action;
import com.digitaltwin.common.util.JsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Repository for actions
 */
@Repository
@RequiredArgsConstructor
@Slf4j
public class ActionRepository {
    
    private final ReactiveRedisTemplate<String, String> redisTemplate;
    
    private static final String ACTION_KEY_PREFIX = "action:";
    private static final String TWIN_ACTIONS_PREFIX = "actions:twin:";
    private static final Duration DEFAULT_TTL = Duration.ofDays(7);
    
    public Mono<Action> save(Action action) {
        String key = ACTION_KEY_PREFIX + action.getId();
        String listKey = TWIN_ACTIONS_PREFIX + action.getTwinId();
        
        return redisTemplate.opsForValue()
            .set(key, JsonUtils.toJson(action), DEFAULT_TTL)
            .then(redisTemplate.opsForList().rightPush(listKey, action.getId()))
            .thenReturn(action);
    }
    
    public Mono<Action> findById(String id) {
        String key = ACTION_KEY_PREFIX + id;
        
        return redisTemplate.opsForValue()
            .get(key)
            .map(json -> JsonUtils.fromJson(json, Action.class));
    }
    
    public Flux<Action> findByTwinId(String twinId) {
        String listKey = TWIN_ACTIONS_PREFIX + twinId;
        
        return redisTemplate.opsForList()
            .range(listKey, 0, -1)
            .flatMap(this::findById);
    }
}

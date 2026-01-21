package com.digitaltwin.core.health;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.ReactiveHealthIndicator;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Health indicator for Redis connectivity
 */
@Component
@RequiredArgsConstructor
public class RedisHealthIndicator implements ReactiveHealthIndicator {
    
    private final ReactiveRedisTemplate<String, Object> redisTemplate;
    
    @Override
    public Mono<Health> health() {
        return redisTemplate.getConnectionFactory()
            .getReactiveConnection()
            .ping()
            .map(result -> Health.up()
                .withDetail("redis", "Available")
                .withDetail("ping", result)
                .build())
            .onErrorResume(ex -> Mono.just(Health.down()
                .withDetail("redis", "Unavailable")
                .withException(ex)
                .build()));
    }
}

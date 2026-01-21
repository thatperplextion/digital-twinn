package com.digitaltwin.prediction.service;

import com.digitaltwin.common.model.Prediction;
import com.digitaltwin.common.util.JsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Cache for predictions
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PredictionCache {
    
    private final ReactiveRedisTemplate<String, String> redisTemplate;
    
    private static final String PREDICTION_KEY_PREFIX = "prediction:";
    private static final String TWIN_PREDICTIONS_PREFIX = "predictions:twin:";
    private static final Duration DEFAULT_TTL = Duration.ofHours(1);
    
    public Mono<Boolean> cachePrediction(String twinId, Prediction prediction) {
        String key = PREDICTION_KEY_PREFIX + prediction.getId();
        String listKey = TWIN_PREDICTIONS_PREFIX + twinId;
        
        return redisTemplate.opsForValue()
            .set(key, JsonUtils.toJson(prediction), DEFAULT_TTL)
            .then(redisTemplate.opsForList().rightPush(listKey, prediction.getId()))
            .then(redisTemplate.expire(listKey, DEFAULT_TTL))
            .thenReturn(true);
    }
    
    public Mono<Prediction> getPrediction(String predictionId) {
        String key = PREDICTION_KEY_PREFIX + predictionId;
        
        return redisTemplate.opsForValue()
            .get(key)
            .map(json -> JsonUtils.fromJson(json, Prediction.class));
    }
    
    public Flux<Prediction> getPredictionsForTwin(String twinId) {
        String listKey = TWIN_PREDICTIONS_PREFIX + twinId;
        
        return redisTemplate.opsForList()
            .range(listKey, 0, -1)
            .flatMap(this::getPrediction);
    }
}

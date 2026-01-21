package com.digitaltwin.state.service;

import com.digitaltwin.common.model.DigitalTwin;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository interface for Digital Twin persistence
 */
public interface TwinRepository {
    
    Mono<DigitalTwin> save(DigitalTwin twin);
    
    Mono<DigitalTwin> findById(String id);
    
    Flux<DigitalTwin> findAll();
    
    Flux<DigitalTwin> findByEntityType(String entityType);
    
    Flux<DigitalTwin> findByTenantId(String tenantId);
    
    Mono<Void> deleteById(String id);
    
    Mono<Boolean> existsById(String id);
    
    Mono<Long> count();
}

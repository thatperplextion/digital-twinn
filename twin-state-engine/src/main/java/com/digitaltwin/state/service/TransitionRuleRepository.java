package com.digitaltwin.state.service;

import reactor.core.publisher.Flux;

/**
 * Repository interface for Transition Rules
 */
public interface TransitionRuleRepository {
    
    Flux<Object> findByEntityType(String entityType);
    
    Flux<Object> findBySourceState(String sourceState);
}

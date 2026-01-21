package com.digitaltwin.state.repository;

import com.digitaltwin.state.service.TransitionRuleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

/**
 * In-memory implementation of TransitionRuleRepository
 */
@Repository
@Slf4j
public class InMemoryTransitionRuleRepository implements TransitionRuleRepository {
    
    @Override
    public Flux<Object> findByEntityType(String entityType) {
        // In production, load from database
        return Flux.empty();
    }
    
    @Override
    public Flux<Object> findBySourceState(String sourceState) {
        // In production, load from database
        return Flux.empty();
    }
}

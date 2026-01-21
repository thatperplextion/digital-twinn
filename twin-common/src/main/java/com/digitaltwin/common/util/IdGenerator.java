package com.digitaltwin.common.util;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Utility class for generating unique identifiers
 */
public final class IdGenerator {
    
    private static final AtomicLong SEQUENCE = new AtomicLong(0);
    
    private IdGenerator() {}
    
    /**
     * Generate a unique UUID-based ID
     */
    public static String generateId() {
        return UUID.randomUUID().toString();
    }
    
    /**
     * Generate a prefixed ID (e.g., TWIN-uuid, EVENT-uuid)
     */
    public static String generateId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8);
    }
    
    /**
     * Generate a time-based ID
     */
    public static String generateTimeBasedId(String prefix) {
        return String.format("%s-%d-%04d", 
            prefix, 
            Instant.now().toEpochMilli(), 
            SEQUENCE.incrementAndGet() % 10000);
    }
    
    /**
     * Generate a correlation ID
     */
    public static String generateCorrelationId() {
        return "COR-" + UUID.randomUUID().toString();
    }
    
    /**
     * Generate a trace ID
     */
    public static String generateTraceId() {
        return "TRC-" + Long.toHexString(System.currentTimeMillis()) + 
               Long.toHexString(SEQUENCE.incrementAndGet());
    }
}

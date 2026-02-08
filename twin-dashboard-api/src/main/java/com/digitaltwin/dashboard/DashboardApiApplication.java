package com.digitaltwin.dashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration;

/**
 * Dashboard API Application - Main entry point for the Digital Twin Platform
 */
@SpringBootApplication(exclude = {
    KafkaAutoConfiguration.class,
    RedisAutoConfiguration.class,
    RedisReactiveAutoConfiguration.class
})
public class DashboardApiApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(DashboardApiApplication.class, args);
    }
}

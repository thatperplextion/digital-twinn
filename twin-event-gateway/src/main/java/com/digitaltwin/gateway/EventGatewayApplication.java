package com.digitaltwin.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Event Gateway Application - Entry point for event ingestion
 */
@SpringBootApplication
@EnableScheduling
public class EventGatewayApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(EventGatewayApplication.class, args);
    }
}

package com.digitaltwin.anomaly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Anomaly Detection Engine Application
 */
@SpringBootApplication
@EnableScheduling
public class AnomalyEngineApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(AnomalyEngineApplication.class, args);
    }
}

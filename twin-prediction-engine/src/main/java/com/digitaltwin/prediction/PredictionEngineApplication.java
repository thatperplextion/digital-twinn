package com.digitaltwin.prediction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Prediction Engine Application - Generates predictive insights
 */
@SpringBootApplication
@EnableScheduling
public class PredictionEngineApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(PredictionEngineApplication.class, args);
    }
}

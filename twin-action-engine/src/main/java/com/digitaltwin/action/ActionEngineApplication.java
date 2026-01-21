package com.digitaltwin.action;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Action Engine Application - Autonomous action orchestration
 */
@SpringBootApplication
@EnableScheduling
public class ActionEngineApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ActionEngineApplication.class, args);
    }
}

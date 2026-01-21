package com.digitaltwin.state;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * State Engine Application - Manages digital twin states
 */
@SpringBootApplication
@EnableScheduling
public class StateEngineApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(StateEngineApplication.class, args);
    }
}

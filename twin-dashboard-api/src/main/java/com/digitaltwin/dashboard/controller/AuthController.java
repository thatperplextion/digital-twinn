package com.digitaltwin.dashboard.controller;

import com.digitaltwin.dashboard.dto.AuthRequest;
import com.digitaltwin.dashboard.dto.AuthResponse;
import com.digitaltwin.dashboard.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Authentication Controller - Production Ready
 */
@RestController
@RequestMapping("/api/v1/auth")
@Slf4j
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {
    
    private final JwtService jwtService;
    
    @Value("${ADMIN_USERNAME:admin}")
    private String adminUsername;
    
    @Value("${ADMIN_PASSWORD:admin123}")
    private String adminPassword;
    
    private Map<String, String> users;
    private Map<String, Set<String>> userRoles;
    
    public AuthController(JwtService jwtService) {
        this.jwtService = jwtService;
    }
    
    @PostConstruct
    public void init() {
        // Initialize users from environment variables
        users = new HashMap<>();
        users.put(adminUsername, adminPassword);
        users.put("operator", "operator123");  // Can be made configurable too
        users.put("viewer", "viewer123");
        
        userRoles = new HashMap<>();
        userRoles.put(adminUsername, Set.of("ADMIN", "OPERATOR", "VIEWER"));
        userRoles.put("operator", Set.of("OPERATOR", "VIEWER"));
        userRoles.put("viewer", Set.of("VIEWER"));
        
        log.info("Auth configured with admin user: {}", adminUsername);
    }
    
    @PostMapping("/login")
    @Operation(summary = "Login and get JWT token")
    public Mono<AuthResponse> login(@RequestBody AuthRequest request) {
        return Mono.fromCallable(() -> {
            String storedPassword = users.get(request.getUsername());
            
            if (storedPassword == null || !storedPassword.equals(request.getPassword())) {
                log.warn("Failed login attempt for user: {}", request.getUsername());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }
            
            Set<String> roles = userRoles.get(request.getUsername());
            String token = jwtService.generateToken(request.getUsername(), roles);
            
            log.info("Successful login for user: {}", request.getUsername());
            
            return AuthResponse.builder()
                .token(token)
                .username(request.getUsername())
                .roles(roles)
                .expiresIn(86400) // 24 hours
                .build();
        });
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT token")
    public Mono<AuthResponse> refreshToken(@RequestHeader("Authorization") String authHeader) {
        return Mono.fromCallable(() -> {
            String token = authHeader.replace("Bearer ", "");
            String newToken = jwtService.refreshToken(token);
            String username = jwtService.extractUsername(token);
            Set<String> roles = userRoles.get(username);
            
            return AuthResponse.builder()
                .token(newToken)
                .username(username)
                .roles(roles)
                .expiresIn(86400)
                .build();
        });
    }
    
    @GetMapping("/validate")
    @Operation(summary = "Validate JWT token")
    public Mono<Map<String, Object>> validateToken(@RequestHeader("Authorization") String authHeader) {
        return Mono.fromCallable(() -> {
            String token = authHeader.replace("Bearer ", "");
            boolean valid = jwtService.validateToken(token);
            String username = valid ? jwtService.extractUsername(token) : null;
            
            return Map.of(
                "valid", valid,
                "username", username != null ? username : ""
            );
        });
    }
}

package com.digitaltwin.dashboard.controller;

import com.digitaltwin.dashboard.dto.AuthRequest;
import com.digitaltwin.dashboard.dto.AuthResponse;
import com.digitaltwin.dashboard.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Set;

/**
 * Authentication Controller
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {
    
    private final JwtService jwtService;
    
    // Demo users (in production, use proper user management)
    private static final Map<String, String> DEMO_USERS = Map.of(
        "admin", "admin123",
        "operator", "operator123",
        "viewer", "viewer123"
    );
    
    private static final Map<String, Set<String>> USER_ROLES = Map.of(
        "admin", Set.of("ADMIN", "OPERATOR", "VIEWER"),
        "operator", Set.of("OPERATOR", "VIEWER"),
        "viewer", Set.of("VIEWER")
    );
    
    @PostMapping("/login")
    @Operation(summary = "Login and get JWT token")
    public Mono<AuthResponse> login(@RequestBody AuthRequest request) {
        return Mono.fromCallable(() -> {
            String storedPassword = DEMO_USERS.get(request.getUsername());
            
            if (storedPassword == null || !storedPassword.equals(request.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }
            
            Set<String> roles = USER_ROLES.get(request.getUsername());
            String token = jwtService.generateToken(request.getUsername(), roles);
            
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
            Set<String> roles = USER_ROLES.get(username);
            
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

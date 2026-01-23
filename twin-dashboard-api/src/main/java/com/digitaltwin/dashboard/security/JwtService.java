package com.digitaltwin.dashboard.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * JWT Service for token generation and validation
 */
@Service
@Slf4j
public class JwtService {
    
    @Value("${JWT_SECRET:your-256-bit-secret-key-for-jwt-signing-minimum-32-chars}")
    private String secretKey;
    
    @Value("${jwt.expiration:86400000}")
    private long expirationMs;
    
    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    public String generateToken(String username, Set<String> roles) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        
        return Jwts.builder()
            .subject(username)
            .claim("roles", roles)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(getSigningKey())
            .compact();
    }
    
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }
    
    @SuppressWarnings("unchecked")
    public Set<String> extractRoles(String token) {
        List<String> roles = extractAllClaims(token).get("roles", List.class);
        return roles != null ? new HashSet<>(roles) : Set.of();
    }
    
    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
    
    public String refreshToken(String token) {
        Claims claims = extractAllClaims(token);
        String username = claims.getSubject();
        @SuppressWarnings("unchecked")
        List<String> rolesList = claims.get("roles", List.class);
        Set<String> roles = rolesList != null ? new HashSet<>(rolesList) : Set.of();
        return generateToken(username, roles);
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}

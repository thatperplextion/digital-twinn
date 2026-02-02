# Security Configuration and Best Practices

## Overview

This document outlines security configurations and best practices for the Digital Twin Platform.

## Authentication & Authorization

### JWT Configuration

All services use JWT-based authentication:

```yaml
# application-security.yml
security:
  jwt:
    secret: ${JWT_SECRET}  # Must be set via environment variable
    expiration: 86400000   # 24 hours
    issuer: digital-twin-platform
    audience: digital-twin-services
```

### API Key Authentication

For service-to-service communication:

```yaml
security:
  api-keys:
    enabled: true
    header-name: X-API-Key
    keys:
      - name: event-gateway
        key: ${EVENT_GATEWAY_API_KEY}
      - name: ml-service
        key: ${ML_SERVICE_API_KEY}
```

### RBAC (Role-Based Access Control)

| Role | Permissions |
|------|-------------|
| ADMIN | Full access to all resources |
| OPERATOR | Read/write twins, execute actions |
| ANALYST | Read twins, predictions, anomalies |
| VIEWER | Read-only access |

```java
@PreAuthorize("hasRole('OPERATOR') or hasRole('ADMIN')")
public Twin updateTwin(String id, TwinUpdate update) {
    // ...
}
```

## Network Security

### HTTPS/TLS Configuration

```yaml
server:
  ssl:
    enabled: true
    key-store: ${SSL_KEYSTORE_PATH}
    key-store-password: ${SSL_KEYSTORE_PASSWORD}
    key-store-type: PKCS12
    protocol: TLSv1.3
```

### CORS Configuration

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "https://dashboard.example.com"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("X-Request-Id"));
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

### Rate Limiting

```yaml
resilience4j:
  ratelimiter:
    instances:
      api:
        limit-for-period: 100
        limit-refresh-period: 1s
        timeout-duration: 0s
```

## Data Security

### Encryption at Rest

#### Database Encryption

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/digitaltwin?ssl=true&sslmode=require
```

#### Redis Encryption

```yaml
spring:
  redis:
    ssl: true
    password: ${REDIS_PASSWORD}
```

### Sensitive Data Handling

```java
@Entity
public class Twin {
    @Column
    @Convert(converter = EncryptedStringConverter.class)
    private String sensitiveMetadata;
}
```

### Data Masking in Logs

```xml
<!-- logback-spring.xml -->
<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <fieldNames>
            <message>msg</message>
        </fieldNames>
        <maskFieldValue>password,secret,apiKey,token</maskFieldValue>
    </encoder>
</appender>
```

## Kafka Security

### SASL/SSL Configuration

```yaml
spring:
  kafka:
    security:
      protocol: SASL_SSL
    properties:
      sasl.mechanism: SCRAM-SHA-512
      sasl.jaas.config: >
        org.apache.kafka.common.security.scram.ScramLoginModule required
        username="${KAFKA_USERNAME}"
        password="${KAFKA_PASSWORD}";
    ssl:
      trust-store-location: ${KAFKA_TRUSTSTORE_PATH}
      trust-store-password: ${KAFKA_TRUSTSTORE_PASSWORD}
```

### Topic ACLs

```bash
# Create ACL for event-gateway
kafka-acls.sh --authorizer-properties zookeeper.connect=localhost:2181 \
  --add --allow-principal User:event-gateway \
  --operation Write --topic twin-events
```

## Container Security

### Docker Security Best Practices

```dockerfile
# Use non-root user
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -D appuser
USER appuser

# Don't expose unnecessary ports
EXPOSE 8080

# Use health checks
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1
```

### Kubernetes Security

```yaml
apiVersion: v1
kind: Pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    fsGroup: 1001
  containers:
    - name: twin-service
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL
```

## Secrets Management

### Environment Variables

```yaml
# docker-compose.yml
services:
  twin-state-engine:
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - DB_PASSWORD=${DB_PASSWORD}
    secrets:
      - db_password
      
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### HashiCorp Vault Integration

```yaml
spring:
  cloud:
    vault:
      uri: https://vault.example.com
      token: ${VAULT_TOKEN}
      kv:
        enabled: true
        backend: secret
        default-context: digital-twin
```

## API Security

### Input Validation

```java
@PostMapping("/twins")
public ResponseEntity<Twin> createTwin(
    @Valid @RequestBody TwinCreateRequest request
) {
    // Request is validated automatically
}

public class TwinCreateRequest {
    @NotBlank
    @Size(max = 100)
    private String name;
    
    @Pattern(regexp = "^[a-zA-Z0-9-_]+$")
    private String type;
}
```

### SQL Injection Prevention

Always use parameterized queries:

```java
@Query("SELECT t FROM Twin t WHERE t.name = :name")
Optional<Twin> findByName(@Param("name") String name);
```

### XSS Prevention (Dashboard)

```typescript
// Use React's built-in escaping
function TwinName({ name }: { name: string }) {
  return <span>{name}</span>;  // Automatically escaped
}

// For HTML content, use sanitization
import DOMPurify from 'dompurify';
const safeHtml = DOMPurify.sanitize(untrustedHtml);
```

## Audit Logging

### Configuration

```java
@Aspect
@Component
public class AuditAspect {
    @Around("@annotation(Audited)")
    public Object audit(ProceedingJoinPoint joinPoint) throws Throwable {
        String user = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        String action = joinPoint.getSignature().getName();
        
        log.info("AUDIT: user={} action={} args={}", 
            user, action, Arrays.toString(joinPoint.getArgs()));
            
        return joinPoint.proceed();
    }
}
```

### Audit Events

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "eventType": "TWIN_UPDATED",
  "user": "operator@example.com",
  "twinId": "twin-001",
  "changes": {
    "name": { "old": "Sensor A", "new": "Sensor A-1" }
  },
  "ip": "192.168.1.100"
}
```

## Security Headers

```java
@Configuration
public class SecurityHeadersConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.headers(headers -> headers
            .contentSecurityPolicy(csp -> csp
                .policyDirectives("default-src 'self'; script-src 'self'"))
            .frameOptions(frame -> frame.deny())
            .xssProtection(xss -> xss.enable())
            .contentTypeOptions(content -> {})  // X-Content-Type-Options: nosniff
        );
        return http.build();
    }
}
```

## Vulnerability Management

### Dependency Scanning

```yaml
# .github/workflows/security.yml
- name: Dependency Check
  uses: dependency-check/Dependency-Check_Action@main
  with:
    project: 'digital-twin'
    path: '.'
    format: 'HTML'
    
- name: Snyk Security Scan
  uses: snyk/actions/maven@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Container Scanning

```yaml
- name: Trivy Container Scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'digital-twin/state-engine:latest'
    format: 'sarif'
    output: 'trivy-results.sarif'
```

## Security Checklist

### Pre-Production

- [ ] All secrets stored in environment variables or vault
- [ ] TLS enabled for all services
- [ ] Database connections encrypted
- [ ] Kafka SASL/SSL configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Container images scanned
- [ ] Dependencies scanned for vulnerabilities

### Production

- [ ] Audit logging enabled
- [ ] Monitoring alerts for security events
- [ ] Incident response plan documented
- [ ] Regular security reviews scheduled
- [ ] Backup and recovery tested
- [ ] Access reviews conducted quarterly

## Incident Response

1. **Detection** - Automated alerts for suspicious activity
2. **Containment** - Isolate affected services
3. **Investigation** - Analyze logs and traces
4. **Eradication** - Remove threat vectors
5. **Recovery** - Restore services safely
6. **Lessons Learned** - Update security measures

## Contact

For security issues, contact: security@example.com

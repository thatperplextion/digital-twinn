# Application Monitoring & Performance Guide

## Overview

This guide covers monitoring, observability, and performance optimization for the Digital Twin Platform.

## Monitoring Stack

### Prometheus Metrics

All services expose metrics on `/actuator/prometheus`:

| Service | Metrics Port | Health Port |
|---------|--------------|-------------|
| Event Gateway | 8081 | 8081 |
| State Engine | 8082 | 8082 |
| Prediction Engine | 8083 | 8083 |
| Anomaly Engine | 8084 | 8084 |
| Action Engine | 8085 | 8085 |
| Dashboard API | 8080 | 8080 |

### Key Metrics

#### Application Metrics

```promql
# Request rate
rate(http_server_requests_seconds_count[5m])

# Request latency (p95)
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))

# Error rate
rate(http_server_requests_seconds_count{status=~"5.."}[5m])
```

#### JVM Metrics

```promql
# Heap usage
jvm_memory_used_bytes{area="heap"}

# GC pause time
rate(jvm_gc_pause_seconds_sum[5m])

# Thread count
jvm_threads_live_threads
```

#### Kafka Metrics

```promql
# Consumer lag
kafka_consumer_records_lag_max

# Messages consumed
rate(kafka_consumer_records_consumed_total[5m])

# Producer send rate
rate(kafka_producer_record_send_total[5m])
```

## Grafana Dashboards

### Default Dashboards

1. **Service Overview** - Health, request rates, error rates
2. **JVM Performance** - Memory, GC, threads
3. **Kafka Monitoring** - Topics, consumer groups, lag
4. **Twin Analytics** - Active twins, state changes, predictions

### Custom Dashboard Setup

```json
{
  "dashboard": {
    "title": "Digital Twin Overview",
    "panels": [
      {
        "title": "Active Twins",
        "type": "stat",
        "targets": [{
          "expr": "twin_active_count"
        }]
      },
      {
        "title": "Prediction Accuracy",
        "type": "gauge",
        "targets": [{
          "expr": "prediction_accuracy_percent"
        }]
      }
    ]
  }
}
```

## Distributed Tracing

### Jaeger Configuration

Access Jaeger UI at: `http://localhost:16686`

#### Trace Propagation

All services propagate trace context via headers:
- `traceparent` (W3C Trace Context)
- `b3` (Zipkin B3 format)

#### Custom Spans

```java
@Observed(name = "twin.state.update")
public void updateTwinState(String twinId, State state) {
    // Method is automatically traced
}
```

### Trace Sampling

Configure in `application.yml`:

```yaml
management:
  tracing:
    sampling:
      probability: 1.0  # Sample all traces in dev
```

## Alerting Rules

### Critical Alerts

```yaml
groups:
  - name: critical
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          
      - alert: HighErrorRate
        expr: rate(http_server_requests_seconds_count{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.service }}"
```

### Warning Alerts

```yaml
groups:
  - name: warnings
    rules:
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
          
      - alert: KafkaLag
        expr: kafka_consumer_records_lag_max > 1000
        for: 5m
        labels:
          severity: warning
```

## Performance Optimization

### JVM Tuning

```bash
# Production JVM settings
JAVA_OPTS="-Xms512m -Xmx2g \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/var/log/heapdump.hprof"
```

### Database Optimization

#### Connection Pool

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 20000
```

#### Query Optimization

- Use `@QueryHints` for read-only queries
- Implement pagination for large result sets
- Add appropriate indexes

### Kafka Optimization

```yaml
spring:
  kafka:
    consumer:
      max-poll-records: 500
      fetch-max-wait: 500ms
    producer:
      batch-size: 16384
      linger: 5ms
      compression-type: lz4
```

### Redis Caching

```yaml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 3600000  # 1 hour
      cache-null-values: false
```

## Health Checks

### Endpoints

All services expose:
- `/actuator/health` - Overall health
- `/actuator/health/liveness` - Liveness probe
- `/actuator/health/readiness` - Readiness probe

### Custom Health Indicators

```java
@Component
public class KafkaHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        if (kafkaConnected()) {
            return Health.up().build();
        }
        return Health.down()
            .withDetail("error", "Kafka not reachable")
            .build();
    }
}
```

## Log Aggregation

### Structured Logging

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "service": "twin-state-engine",
  "traceId": "abc123",
  "spanId": "def456",
  "message": "Twin state updated",
  "twinId": "twin-001"
}
```

### Log Levels

| Environment | Default Level | Debug Packages |
|-------------|---------------|----------------|
| Development | DEBUG | all |
| Staging | INFO | com.digitaltwin |
| Production | WARN | none |

## Dashboard UI Performance

### Bundle Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          state: ['zustand', '@tanstack/react-query'],
        },
      },
    },
  },
});
```

### Lazy Loading

```typescript
const TwinDetails = lazy(() => import('./pages/TwinDetails'));
const Analytics = lazy(() => import('./pages/Analytics'));
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check for memory leaks with heap dump
   - Review query result sizes
   - Adjust cache eviction policies

2. **Slow Response Times**
   - Check database query plans
   - Review Kafka consumer lag
   - Analyze distributed traces

3. **Connection Timeouts**
   - Verify network connectivity
   - Check connection pool saturation
   - Review service health

### Debug Commands

```bash
# Check service logs
docker-compose logs -f twin-state-engine

# JVM thread dump
jcmd <pid> Thread.print

# Kafka consumer groups
kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --all-groups

# Redis cache stats
redis-cli INFO stats
```

## Best Practices

1. **Set up alerts** before going to production
2. **Monitor business metrics** alongside technical metrics
3. **Implement circuit breakers** for external dependencies
4. **Use correlation IDs** for request tracking
5. **Review dashboards weekly** for anomalies
6. **Load test** before major releases
7. **Document runbooks** for common issues

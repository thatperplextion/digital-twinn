# Changelog

All notable changes to the Digital Twin Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Makefile for common development commands (build, test, run, logs)
- CONTRIBUTING.md with development guidelines and coding standards
- Global ErrorBoundary component for crash handling in React UI
- React Query hooks for data fetching with caching and invalidation
- WebSocket hooks for real-time event streaming
- OpenTelemetry configuration for distributed tracing
- Jaeger integration for trace visualization
- Prometheus alerting rules for services and infrastructure
- Development docker-compose with Kafka UI, Redis Commander, and pgAdmin
- Reusable UI components (LoadingSpinner, Skeleton, StatusBadge, ProgressBar)
- GitHub Actions CI/CD pipeline
- Dependabot configuration for automated dependency updates

### Changed
- Updated Prometheus configuration to include alerting rules
- Enhanced docker-compose.yml with Jaeger service

### Fixed
- (No fixes in this release)

### Security
- (No security updates in this release)

---

## [1.0.0] - 2026-01-15

### Added
- Initial release of Digital Twin Platform
- Event Gateway for high-throughput event ingestion
- State Engine for real-time state computation
- Prediction Engine for ML-powered forecasting
- Anomaly Engine for multi-algorithm detection
- Action Engine for policy-driven automation
- Dashboard API with REST and WebSocket support
- React Dashboard UI with command center
- ML Service for Python-based predictions
- Docker Compose for container orchestration
- PostgreSQL database with optimized schema
- Redis for caching and pub/sub
- Kafka for event streaming
- Prometheus and Grafana for monitoring

### Infrastructure
- Multi-module Maven project structure
- Spring Boot 3.2 with WebFlux
- React 18 with TypeScript and Vite
- Tailwind CSS for styling
- JWT authentication

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-01-15 | Initial release |
| 1.1.0 | (Unreleased) | Developer experience improvements |

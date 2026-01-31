# ============================================
# Digital Twin Platform - Makefile
# ============================================
# Usage: make <target>
# ============================================

.PHONY: help build test run stop clean dev logs

# Default target
help:
	@echo "Digital Twin Platform - Available Commands"
	@echo "==========================================="
	@echo "  make build       - Build all Java services"
	@echo "  make test        - Run all tests"
	@echo "  make run         - Start all services with Docker"
	@echo "  make stop        - Stop all services"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make dev         - Start development environment"
	@echo "  make logs        - View service logs"
	@echo "  make ui          - Start dashboard UI in dev mode"
	@echo "  make db-reset    - Reset database"
	@echo "  make lint        - Run linters"

# ==================== Build ====================

build:
	@echo "Building Java services..."
	./mvnw clean package -DskipTests

build-docker:
	@echo "Building Docker images..."
	docker-compose build

# ==================== Test ====================

test:
	@echo "Running all tests..."
	./mvnw test

test-java:
	@echo "Running Java tests..."
	./mvnw test

test-ui:
	@echo "Running UI tests..."
	cd dashboard-ui && npm test

test-ml:
	@echo "Running ML service tests..."
	cd ml-service && python -m pytest

# ==================== Run ====================

run:
	@echo "Starting all services..."
	docker-compose up -d

run-infra:
	@echo "Starting infrastructure only..."
	docker-compose up -d zookeeper kafka redis postgres prometheus grafana

run-services:
	@echo "Starting microservices..."
	docker-compose up -d event-gateway state-engine prediction-engine anomaly-engine action-engine dashboard-api

dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.yml up -d zookeeper kafka redis postgres
	@echo "Infrastructure started. Run services locally with your IDE."

ui:
	@echo "Starting dashboard UI in development mode..."
	cd dashboard-ui && npm run dev

# ==================== Stop & Clean ====================

stop:
	@echo "Stopping all services..."
	docker-compose down

stop-all:
	@echo "Stopping all services and removing volumes..."
	docker-compose down -v

clean:
	@echo "Cleaning build artifacts..."
	./mvnw clean
	cd dashboard-ui && rm -rf node_modules dist
	cd ml-service && rm -rf __pycache__ .pytest_cache

# ==================== Logs ====================

logs:
	docker-compose logs -f

logs-gateway:
	docker-compose logs -f event-gateway

logs-state:
	docker-compose logs -f state-engine

logs-prediction:
	docker-compose logs -f prediction-engine

logs-anomaly:
	docker-compose logs -f anomaly-engine

logs-action:
	docker-compose logs -f action-engine

logs-api:
	docker-compose logs -f dashboard-api

# ==================== Database ====================

db-reset:
	@echo "Resetting database..."
	docker-compose stop postgres
	docker-compose rm -f postgres
	docker volume rm digital-twin_postgres-data || true
	docker-compose up -d postgres

db-shell:
	docker-compose exec postgres psql -U dtuser -d digitaltwin

# ==================== Linting ====================

lint:
	@echo "Running linters..."
	cd dashboard-ui && npm run lint
	cd ml-service && flake8 .

lint-fix:
	@echo "Fixing lint issues..."
	cd dashboard-ui && npm run lint -- --fix

# ==================== Utilities ====================

status:
	docker-compose ps

health:
	@echo "Checking service health..."
	@curl -s http://localhost:8081/actuator/health | jq . || echo "Event Gateway: DOWN"
	@curl -s http://localhost:8082/actuator/health | jq . || echo "State Engine: DOWN"
	@curl -s http://localhost:8083/actuator/health | jq . || echo "Prediction Engine: DOWN"
	@curl -s http://localhost:8084/actuator/health | jq . || echo "Anomaly Engine: DOWN"
	@curl -s http://localhost:8085/actuator/health | jq . || echo "Action Engine: DOWN"
	@curl -s http://localhost:8080/actuator/health | jq . || echo "Dashboard API: DOWN"
	@curl -s http://localhost:5000/health | jq . || echo "ML Service: DOWN"

kafka-topics:
	docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

redis-cli:
	docker-compose exec redis redis-cli -a redis123

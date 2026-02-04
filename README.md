# 🌐 Real-Time Autonomous Digital Twin Engine

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Java](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green.svg)
![React](https://img.shields.io/badge/React-18.2-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6.svg)
![License](https://img.shields.io/badge/license-MIT-purple.svg)

**A next-generation platform for Predictive Behavior Modeling & Decision Intelligence**

</div>

---

## 🎯 Overview

The Digital Twin Engine is a sophisticated, cloud-native platform that creates intelligent virtual replicas of real-world entities. It continuously:

- **Ingests real-time events** from IoT sensors, APIs, and streaming sources
- **Updates internal state models** dynamically using behavioral algorithms
- **Predicts future behavior** using ML-powered temporal analysis
- **Detects anomalies** instantly using multi-algorithm detection
- **Triggers automated actions** through a policy-driven orchestration engine
- **Provides explainable insights** through an interactive command center

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DIGITAL TWIN ENGINE                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐      │
│  │   Event      │──▶│    State     │──▶│  Prediction  │──▶│   Anomaly    │      │
│  │   Gateway    │   │    Engine    │   │    Engine    │   │   Engine     │      │
│  │   :8081      │   │    :8082     │   │    :8083     │   │   :8084      │      │
│  └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘      │
│         │                  │                  │                  │               │
│         │                  │                  │                  │               │
│         └──────────────────┴──────────────────┴──────────────────┘               │
│                                     │                                            │
│                              ┌──────┴──────┐                                     │
│                              │    Kafka    │                                     │
│                              │   :9092     │                                     │
│                              └──────┬──────┘                                     │
│                                     │                                            │
│  ┌──────────────┐   ┌──────────────┴──────────────┐   ┌──────────────┐          │
│  │   Action     │◀──│       Dashboard API         │──▶│   ML Service │          │
│  │   Engine     │   │         :8080               │   │    :5000     │          │
│  │   :8085      │   └─────────────────────────────┘   └──────────────┘          │
│  └──────────────┘                  │                                             │
│                                    │                                             │
│                           ┌────────┴────────┐                                    │
│                           │  Dashboard UI   │                                    │
│                           │     :3000       │                                    │
│                           └─────────────────┘                                    │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                              INFRASTRUCTURE                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│  │  Redis  │  │PostgreSQL│  │ Kafka   │  │Prometheus│  │ Grafana │               │
│  │  :6379  │  │  :5432  │  │ :9092   │  │  :9090  │  │  :3001  │               │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Docker** & **Docker Compose** v2.0+
- **Java 21** (for local development)
- **Node.js 20+** (for frontend development)
- **Maven 3.9+** (for building Java services)

### 1. Clone & Start Infrastructure

```bash
# Clone the repository
git clone <repository-url>
cd digital-twin

# Start all services
docker-compose up -d
```

### 2. Access the Platform

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard UI** | http://localhost:3000 | Main command center |
| **Dashboard API** | http://localhost:8080 | REST API & WebSocket |
| **Event Gateway** | http://localhost:8081 | Event ingestion |
| **Grafana** | http://localhost:3001 | Metrics visualization |
| **Prometheus** | http://localhost:9090 | Metrics collection |

### 3. Send Test Events

```bash
# Send a sensor event
curl -X POST http://localhost:8081/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "twinId": "TWIN-001",
    "eventType": "SENSOR_READING",
    "source": "temperature-sensor-a1",
    "payload": {
      "temperature": 72.5,
      "humidity": 45.2
    }
  }'
```

## 📁 Project Structure

```
digital-twin/
├── twin-common/           # Shared models, DTOs, utilities
├── twin-core/             # Core twin lifecycle management
├── twin-event-gateway/    # Event ingestion & validation
├── twin-state-engine/     # State modeling & transitions
├── twin-prediction-engine/# ML-powered predictions
├── twin-anomaly-engine/   # Anomaly detection algorithms
├── twin-action-engine/    # Automated action orchestration
├── twin-dashboard-api/    # REST API & WebSocket gateway
├── dashboard-ui/          # React dashboard frontend
├── ml-service/            # Python ML microservice
├── config/                # Configuration files
├── scripts/               # Database init & utilities
└── docker-compose.yml     # Container orchestration
```

## 🧩 Core Components

### 1. Event Gateway (`twin-event-gateway`)
- High-throughput event ingestion (100K+ events/sec)
- Schema validation and enrichment
- Multi-protocol support (REST, WebSocket, gRPC)
- Dead letter queue for failed events

### 2. State Engine (`twin-state-engine`)
- Real-time state computation
- Behavioral metrics tracking
- Temporal pattern analysis
- State machine transitions

### 3. Prediction Engine (`twin-prediction-engine`)
- Time-series forecasting
- Behavioral pattern prediction
- ML model integration
- Confidence scoring

### 4. Anomaly Engine (`twin-anomaly-engine`)
- Multi-algorithm detection (statistical, ML, rule-based)
- Real-time alerting
- Root cause analysis
- False positive learning

### 5. Action Engine (`twin-action-engine`)
- Policy-driven automation
- Workflow orchestration
- Multi-step action chains
- Rollback capabilities

### 6. Dashboard UI (`dashboard-ui`)
- Real-time command center
- Interactive twin explorer
- Prediction & anomaly visualization
- Simulation sandbox

## 🎨 Dashboard Features

### Command Center
- Live event stream visualization
- System health metrics
- Real-time KPIs

### Twin Explorer
- Grid/list view of all twins
- Detailed twin inspection
- State history timeline
- Explainability insights

### Predictions
- Accuracy trend charts
- Type distribution
- Confidence indicators
- Detailed explanations

### Anomalies
- Severity-based filtering
- Trend analysis
- Root cause display
- Investigation workflow

### Actions
- Execution history
- Status tracking
- Side effect logging
- Manual triggers

### Simulation
- Hypothetical scenarios
- What-if analysis
- Future state prediction
- Time-travel debugging

## 🛠️ Development

### Build Backend

```bash
# Build all Java modules
mvn clean install

# Build specific module
mvn clean install -pl twin-event-gateway
```

### Run Frontend Locally

```bash
cd dashboard-ui

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Run Tests

```bash
# Backend tests
mvn test

# Frontend tests
cd dashboard-ui && npm test
```

## 📊 API Reference

### Digital Twin API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/twins` | GET | List all twins |
| `/api/twins/{id}` | GET | Get twin details |
| `/api/twins` | POST | Create new twin |
| `/api/twins/{id}/state` | GET | Get current state |

### Event API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/events` | POST | Ingest event |
| `/api/events/batch` | POST | Batch ingest |
| `/api/events/{twinId}/history` | GET | Event history |

### Prediction API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predictions/{twinId}` | GET | Get predictions |
| `/api/predictions/generate` | POST | Generate prediction |

### Streaming API

| Endpoint | Protocol | Description |
|----------|----------|-------------|
| `/api/dashboard/stream` | SSE | Live metrics |
| `/ws/twins/{id}` | WebSocket | Twin updates |

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka brokers |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `POSTGRES_HOST` | `localhost` | Database host |
| `ML_SERVICE_URL` | `http://localhost:5000` | ML service URL |

## 📈 Performance

- **Event throughput**: 100,000+ events/second
- **State latency**: <50ms average
- **Prediction latency**: <200ms
- **Dashboard refresh**: 100ms real-time updates

## 🎯 Use Cases

- **Smart Cities**: Traffic, utilities, infrastructure monitoring
- **Healthcare**: Patient digital twins, medical device monitoring
- **Manufacturing (Industry 4.0)**: Machine twins, predictive maintenance
- **Financial Services**: User behavior modeling, fraud detection
- **Logistics**: Fleet tracking, route optimization

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">



</div>


-- ============================================
-- PostgreSQL Initialization Script
-- Digital Twin Platform
-- ============================================
-- This script sets up the database schema for
-- storing digital twins, events, predictions,
-- anomalies, and actions.
-- ============================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==================== Schema ====================

-- Digital Twins table
CREATE TABLE digital_twins (
    id VARCHAR(64) PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tenant_id VARCHAR(64),
    static_attributes JSONB DEFAULT '{}',
    dynamic_state JSONB DEFAULT '{}',
    behavioral_metrics JSONB DEFAULT '{}',
    temporal_patterns JSONB DEFAULT '{}',
    contextual_memory JSONB DEFAULT '{}',
    current_state JSONB,
    health JSONB DEFAULT '{}',
    tags TEXT[],
    version BIGINT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Twin Events table (for audit/history)
CREATE TABLE twin_events (
    id VARCHAR(64) PRIMARY KEY,
    twin_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    source VARCHAR(255),
    payload JSONB,
    correlation_id VARCHAR(64),
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- State History table
CREATE TABLE state_history (
    id VARCHAR(64) PRIMARY KEY,
    twin_id VARCHAR(64) NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    state_type VARCHAR(50),
    confidence DOUBLE PRECISION,
    dynamic_values JSONB,
    metadata JSONB,
    entered_at TIMESTAMP WITH TIME ZONE,
    exited_at TIMESTAMP WITH TIME ZONE,
    transition_type VARCHAR(50),
    transition_probability DOUBLE PRECISION
);

-- Predictions table
CREATE TABLE predictions (
    id VARCHAR(64) PRIMARY KEY,
    twin_id VARCHAR(64) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    predicted_value JSONB,
    confidence DOUBLE PRECISION,
    probability DOUBLE PRECISION,
    model_id VARCHAR(64),
    model_version VARCHAR(20),
    supporting_factors JSONB,
    prediction_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    target_time TIMESTAMP WITH TIME ZONE,
    horizon_seconds INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Anomalies table
CREATE TABLE anomalies (
    id VARCHAR(64) PRIMARY KEY,
    twin_id VARCHAR(64) NOT NULL,
    anomaly_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20),
    anomaly_score DOUBLE PRECISION,
    threshold DOUBLE PRECISION,
    deviation DOUBLE PRECISION,
    title VARCHAR(255),
    description TEXT,
    affected_attributes TEXT[],
    status VARCHAR(30) DEFAULT 'DETECTED',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    expected_values JSONB,
    actual_values JSONB,
    potential_causes TEXT[],
    root_cause TEXT,
    explanation TEXT,
    metadata JSONB
);

-- Actions table
CREATE TABLE actions (
    id VARCHAR(64) PRIMARY KEY,
    twin_id VARCHAR(64) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    description TEXT,
    status VARCHAR(30) DEFAULT 'PENDING',
    priority VARCHAR(20),
    trigger_type VARCHAR(50),
    trigger_id VARCHAR(64),
    target_system VARCHAR(255),
    target_endpoint VARCHAR(255),
    payload JSONB,
    expected_outcome JSONB,
    actual_outcome JSONB,
    rollback_action JSONB,
    requires_approval BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 60,
    error_message TEXT,
    audit_log TEXT[]
);

-- ==================== Indexes ====================

CREATE INDEX idx_twins_entity_type ON digital_twins(entity_type);
CREATE INDEX idx_twins_tenant_id ON digital_twins(tenant_id);
CREATE INDEX idx_twins_created_at ON digital_twins(created_at);
CREATE INDEX idx_twins_tags ON digital_twins USING GIN(tags);
CREATE INDEX idx_twins_dynamic_state ON digital_twins USING GIN(dynamic_state);

CREATE INDEX idx_events_twin_id ON twin_events(twin_id);
CREATE INDEX idx_events_type ON twin_events(event_type);
CREATE INDEX idx_events_received_at ON twin_events(received_at);
CREATE INDEX idx_events_correlation ON twin_events(correlation_id);

CREATE INDEX idx_state_history_twin_id ON state_history(twin_id);
CREATE INDEX idx_state_history_entered_at ON state_history(entered_at);

CREATE INDEX idx_predictions_twin_id ON predictions(twin_id);
CREATE INDEX idx_predictions_type ON predictions(prediction_type);
CREATE INDEX idx_predictions_time ON predictions(prediction_time);

CREATE INDEX idx_anomalies_twin_id ON anomalies(twin_id);
CREATE INDEX idx_anomalies_type ON anomalies(anomaly_type);
CREATE INDEX idx_anomalies_status ON anomalies(status);
CREATE INDEX idx_anomalies_detected_at ON anomalies(detected_at);

CREATE INDEX idx_actions_twin_id ON actions(twin_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_created_at ON actions(created_at);

-- ==================== Functions ====================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_last_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating timestamps
CREATE TRIGGER update_twins_timestamp
    BEFORE UPDATE ON digital_twins
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_at();

-- ==================== Views ====================

-- Active anomalies view
CREATE VIEW active_anomalies AS
SELECT * FROM anomalies
WHERE status NOT IN ('RESOLVED', 'DISMISSED')
ORDER BY detected_at DESC;

-- Pending actions view
CREATE VIEW pending_actions AS
SELECT * FROM actions
WHERE status IN ('PENDING', 'AWAITING_APPROVAL')
ORDER BY created_at DESC;

-- Twin health summary view
CREATE VIEW twin_health_summary AS
SELECT 
    dt.id,
    dt.name,
    dt.entity_type,
    dt.health->>'status' as health_status,
    (dt.health->>'healthScore')::DOUBLE PRECISION as health_score,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status NOT IN ('RESOLVED', 'DISMISSED')) as active_anomalies,
    COUNT(DISTINCT ac.id) FILTER (WHERE ac.status = 'PENDING') as pending_actions
FROM digital_twins dt
LEFT JOIN anomalies a ON dt.id = a.twin_id
LEFT JOIN actions ac ON dt.id = ac.twin_id
GROUP BY dt.id, dt.name, dt.entity_type, dt.health;

COMMENT ON TABLE digital_twins IS 'Core table storing digital twin entities';
COMMENT ON TABLE twin_events IS 'Event log for all twin activities';
COMMENT ON TABLE predictions IS 'Machine learning predictions for twins';
COMMENT ON TABLE anomalies IS 'Detected anomalies and their status';
COMMENT ON TABLE actions IS 'Autonomous and manual actions taken on twins';

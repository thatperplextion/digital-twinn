"""
Digital Twin ML Service
Advanced machine learning predictions for digital twin behaviors
"""

import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
import redis
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Redis connection
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    decode_responses=True
)

# Prometheus metrics
PREDICTION_COUNTER = Counter('ml_predictions_total', 'Total predictions made', ['type'])
PREDICTION_LATENCY = Histogram('ml_prediction_latency_seconds', 'Prediction latency')
ANOMALY_DETECTION_COUNTER = Counter('ml_anomaly_detections_total', 'Total anomaly detections')

# In-memory model store (in production, use model registry)
models = {}
scalers = {}


class PredictionRequest(BaseModel):
    twin_id: str
    prediction_type: str
    features: Dict[str, Any]
    context: Optional[Dict[str, Any]] = None


class AnomalyRequest(BaseModel):
    twin_id: str
    metrics: Dict[str, float]
    history: Optional[List[Dict[str, float]]] = None


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'ml-service'
    })


@app.route('/metrics', methods=['GET'])
def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}


@app.route('/api/v1/predict', methods=['POST'])
def predict():
    """
    Generate predictions using ML models
    """
    with PREDICTION_LATENCY.time():
        data = request.json
        
        twin_id = data.get('twin_id')
        prediction_type = data.get('prediction_type')
        features = data.get('features', {})
        context = data.get('context', {})
        
        PREDICTION_COUNTER.labels(type=prediction_type).inc()
        
        try:
            result = generate_prediction(twin_id, prediction_type, features, context)
            return jsonify(result)
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return jsonify({'error': str(e)}), 500


def generate_prediction(twin_id: str, pred_type: str, features: Dict, context: Dict) -> Dict:
    """Generate prediction based on type"""
    
    if pred_type == 'NEXT_ACTION':
        return predict_next_action(twin_id, features, context)
    elif pred_type == 'NEXT_STATE':
        return predict_next_state(twin_id, features, context)
    elif pred_type == 'RISK_FORECAST':
        return predict_risk(twin_id, features, context)
    elif pred_type == 'FAILURE_PROBABILITY':
        return predict_failure(twin_id, features, context)
    elif pred_type == 'BEHAVIORAL_TRAJECTORY':
        return predict_trajectory(twin_id, features, context)
    else:
        return predict_generic(twin_id, pred_type, features, context)


def predict_next_action(twin_id: str, features: Dict, context: Dict) -> Dict:
    """Predict next likely action using action sequence patterns"""
    
    recent_actions = context.get('recent_actions', [])
    
    # Simple Markov-like prediction
    action_counts = {}
    for i in range(len(recent_actions) - 1):
        current = recent_actions[i]
        next_action = recent_actions[i + 1]
        if current not in action_counts:
            action_counts[current] = {}
        action_counts[current][next_action] = action_counts[current].get(next_action, 0) + 1
    
    # Predict based on last action
    last_action = recent_actions[-1] if recent_actions else 'UNKNOWN'
    predictions = []
    
    if last_action in action_counts:
        total = sum(action_counts[last_action].values())
        for action, count in action_counts[last_action].items():
            predictions.append({
                'action': action,
                'probability': count / total,
                'confidence': min(0.9, count / 10)  # Cap confidence
            })
    
    # Add default predictions if none found
    if not predictions:
        predictions = [
            {'action': 'CONTINUE', 'probability': 0.5, 'confidence': 0.3},
            {'action': 'UPDATE', 'probability': 0.3, 'confidence': 0.3},
            {'action': 'IDLE', 'probability': 0.2, 'confidence': 0.3}
        ]
    
    predictions.sort(key=lambda x: x['probability'], reverse=True)
    
    return {
        'prediction_type': 'NEXT_ACTION',
        'twin_id': twin_id,
        'predictions': predictions[:5],
        'model_version': '1.0.0',
        'generated_at': datetime.utcnow().isoformat()
    }


def predict_next_state(twin_id: str, features: Dict, context: Dict) -> Dict:
    """Predict next state using state transition patterns"""
    
    current_state = features.get('current_state', 'ACTIVE')
    state_history = context.get('state_history', [])
    
    # Build transition matrix
    transitions = {}
    for i in range(len(state_history) - 1):
        current = state_history[i]
        next_state = state_history[i + 1]
        if current not in transitions:
            transitions[current] = {}
        transitions[current][next_state] = transitions[current].get(next_state, 0) + 1
    
    # Get probabilities for current state
    predictions = []
    if current_state in transitions:
        total = sum(transitions[current_state].values())
        for state, count in transitions[current_state].items():
            predictions.append({
                'state': state,
                'probability': count / total,
                'confidence': min(0.85, (count / 5) * 0.85)
            })
    
    if not predictions:
        predictions = [
            {'state': 'ACTIVE', 'probability': 0.6, 'confidence': 0.4},
            {'state': 'IDLE', 'probability': 0.3, 'confidence': 0.4},
            {'state': 'TRANSITIONING', 'probability': 0.1, 'confidence': 0.4}
        ]
    
    predictions.sort(key=lambda x: x['probability'], reverse=True)
    
    return {
        'prediction_type': 'NEXT_STATE',
        'twin_id': twin_id,
        'current_state': current_state,
        'predictions': predictions[:5],
        'model_version': '1.0.0',
        'generated_at': datetime.utcnow().isoformat()
    }


def predict_risk(twin_id: str, features: Dict, context: Dict) -> Dict:
    """Predict risk score using behavioral metrics"""
    
    metrics = features.get('behavioral_metrics', {})
    
    # Calculate composite risk score
    anomaly_score = metrics.get('anomaly_score', 0)
    activity_deviation = abs(metrics.get('activity_score', 0.5) - 0.5)
    performance_drop = max(0, 0.8 - metrics.get('performance_score', 0.8))
    
    # Weighted risk calculation
    risk_score = (
        anomaly_score * 0.4 +
        activity_deviation * 0.3 +
        performance_drop * 0.3
    )
    
    # Determine risk level
    if risk_score > 0.7:
        risk_level = 'CRITICAL'
    elif risk_score > 0.5:
        risk_level = 'HIGH'
    elif risk_score > 0.3:
        risk_level = 'MEDIUM'
    else:
        risk_level = 'LOW'
    
    return {
        'prediction_type': 'RISK_FORECAST',
        'twin_id': twin_id,
        'risk_score': round(risk_score, 4),
        'risk_level': risk_level,
        'confidence': 0.75,
        'contributing_factors': [
            {'factor': 'anomaly_score', 'weight': 0.4, 'value': anomaly_score},
            {'factor': 'activity_deviation', 'weight': 0.3, 'value': activity_deviation},
            {'factor': 'performance_drop', 'weight': 0.3, 'value': performance_drop}
        ],
        'model_version': '1.0.0',
        'generated_at': datetime.utcnow().isoformat()
    }


def predict_failure(twin_id: str, features: Dict, context: Dict) -> Dict:
    """Predict failure probability"""
    
    metrics = features.get('behavioral_metrics', {})
    health = features.get('health', {})
    
    health_score = health.get('health_score', 100) / 100
    error_rate = health.get('error_rate', 0)
    uptime = health.get('uptime', 1.0)
    
    # Failure probability model
    base_failure = 0.01  # 1% base failure rate
    health_factor = (1 - health_score) * 0.3
    error_factor = min(error_rate * 0.1, 0.3)
    uptime_factor = (1 - uptime) * 0.2
    
    failure_probability = min(0.95, base_failure + health_factor + error_factor + uptime_factor)
    
    # Time to failure estimate (in hours)
    if failure_probability > 0.5:
        ttf_hours = max(1, (1 - failure_probability) * 48)
    else:
        ttf_hours = (1 - failure_probability) * 168  # Up to a week
    
    return {
        'prediction_type': 'FAILURE_PROBABILITY',
        'twin_id': twin_id,
        'failure_probability': round(failure_probability, 4),
        'time_to_failure_hours': round(ttf_hours, 1),
        'confidence': 0.7,
        'risk_factors': [
            {'factor': 'health_score', 'impact': round(health_factor, 4)},
            {'factor': 'error_rate', 'impact': round(error_factor, 4)},
            {'factor': 'uptime', 'impact': round(uptime_factor, 4)}
        ],
        'model_version': '1.0.0',
        'generated_at': datetime.utcnow().isoformat()
    }


def predict_trajectory(twin_id: str, features: Dict, context: Dict) -> Dict:
    """Predict behavioral trajectory over time"""
    
    metrics = features.get('behavioral_metrics', {})
    horizon_hours = context.get('horizon_hours', 24)
    
    current_activity = metrics.get('activity_score', 0.5)
    current_risk = metrics.get('risk_score', 0.1)
    current_performance = metrics.get('performance_score', 0.8)
    
    # Generate trajectory points
    trajectory = []
    for hour in range(0, horizon_hours + 1, max(1, horizon_hours // 10)):
        # Simple linear extrapolation with noise
        noise = np.random.normal(0, 0.05)
        trajectory.append({
            'hour': hour,
            'activity_score': round(max(0, min(1, current_activity + noise)), 4),
            'risk_score': round(max(0, min(1, current_risk + hour * 0.001 + noise)), 4),
            'performance_score': round(max(0, min(1, current_performance - hour * 0.001 + noise)), 4)
        })
    
    # Trend analysis
    trend = 'STABLE'
    if trajectory[-1]['risk_score'] - trajectory[0]['risk_score'] > 0.1:
        trend = 'DEGRADING'
    elif trajectory[-1]['performance_score'] - trajectory[0]['performance_score'] > 0.05:
        trend = 'IMPROVING'
    
    return {
        'prediction_type': 'BEHAVIORAL_TRAJECTORY',
        'twin_id': twin_id,
        'trajectory': trajectory,
        'trend': trend,
        'horizon_hours': horizon_hours,
        'confidence': 0.65,
        'model_version': '1.0.0',
        'generated_at': datetime.utcnow().isoformat()
    }


def predict_generic(twin_id: str, pred_type: str, features: Dict, context: Dict) -> Dict:
    """Generic prediction handler"""
    return {
        'prediction_type': pred_type,
        'twin_id': twin_id,
        'result': 'Generic prediction',
        'confidence': 0.5,
        'model_version': '1.0.0',
        'generated_at': datetime.utcnow().isoformat()
    }


@app.route('/api/v1/detect-anomaly', methods=['POST'])
def detect_anomaly():
    """
    Detect anomalies using ML models
    """
    ANOMALY_DETECTION_COUNTER.inc()
    
    data = request.json
    twin_id = data.get('twin_id')
    metrics = data.get('metrics', {})
    history = data.get('history', [])
    
    try:
        result = detect_anomalies(twin_id, metrics, history)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        return jsonify({'error': str(e)}), 500


def detect_anomalies(twin_id: str, metrics: Dict, history: List) -> Dict:
    """Detect anomalies using Isolation Forest"""
    
    anomalies = []
    
    # Convert metrics to feature vector
    feature_names = list(metrics.keys())
    current_values = [metrics.get(k, 0) for k in feature_names]
    
    if len(history) >= 10:
        # Build historical data matrix
        X = []
        for h in history:
            X.append([h.get(k, 0) for k in feature_names])
        X = np.array(X)
        
        # Fit Isolation Forest
        iso_forest = IsolationForest(contamination=0.1, random_state=42)
        iso_forest.fit(X)
        
        # Score current point
        current_array = np.array([current_values])
        score = iso_forest.decision_function(current_array)[0]
        is_anomaly = iso_forest.predict(current_array)[0] == -1
        
        if is_anomaly:
            # Determine which metrics are anomalous
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            current_scaled = scaler.transform(current_array)
            
            for i, name in enumerate(feature_names):
                z_score = abs(current_scaled[0][i])
                if z_score > 2:
                    anomalies.append({
                        'metric': name,
                        'value': metrics[name],
                        'z_score': round(z_score, 2),
                        'deviation': 'HIGH' if z_score > 3 else 'MODERATE'
                    })
    else:
        # Fallback to simple statistical detection
        for name, value in metrics.items():
            if isinstance(value, (int, float)):
                if value > 0.9 or value < 0.1:
                    anomalies.append({
                        'metric': name,
                        'value': value,
                        'reason': 'EXTREME_VALUE'
                    })
    
    is_anomalous = len(anomalies) > 0
    
    return {
        'twin_id': twin_id,
        'is_anomalous': is_anomalous,
        'anomaly_score': len(anomalies) / max(len(metrics), 1),
        'anomalies': anomalies,
        'metrics_analyzed': len(metrics),
        'history_size': len(history),
        'model_version': '1.0.0',
        'generated_at': datetime.utcnow().isoformat()
    }


@app.route('/api/v1/train', methods=['POST'])
def train_model():
    """
    Train or retrain a model for a specific twin
    """
    data = request.json
    twin_id = data.get('twin_id')
    model_type = data.get('model_type')
    training_data = data.get('training_data', [])
    
    logger.info(f"Training {model_type} model for twin {twin_id}")
    
    # In production, this would trigger async training job
    return jsonify({
        'status': 'TRAINING_STARTED',
        'twin_id': twin_id,
        'model_type': model_type,
        'training_samples': len(training_data),
        'message': 'Model training initiated'
    })


@app.route('/api/v1/models', methods=['GET'])
def list_models():
    """List available models"""
    return jsonify({
        'models': [
            {'id': 'next_action_predictor', 'type': 'NEXT_ACTION', 'version': '1.0.0'},
            {'id': 'state_predictor', 'type': 'NEXT_STATE', 'version': '1.0.0'},
            {'id': 'risk_predictor', 'type': 'RISK_FORECAST', 'version': '1.0.0'},
            {'id': 'failure_predictor', 'type': 'FAILURE_PROBABILITY', 'version': '1.0.0'},
            {'id': 'trajectory_predictor', 'type': 'BEHAVIORAL_TRAJECTORY', 'version': '1.0.0'},
            {'id': 'anomaly_detector', 'type': 'ANOMALY_DETECTION', 'version': '1.0.0'}
        ]
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    

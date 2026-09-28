/**
 * Application Constants
 * Centralized configuration values for the Digital Twin Dashboard
 */

// ==================== API Configuration ====================

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

// ==================== Feature Flags ====================

export const FEATURES = {
  PREDICTIONS_ENABLED: true,
  ANOMALY_DETECTION_ENABLED: true,
  ACTIONS_ENABLED: true,
  SIMULATION_ENABLED: true,
  DARK_MODE_ONLY: false,
}

// ==================== Pagination ====================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
}

// ==================== Refresh Intervals (ms) ====================

export const REFRESH_INTERVALS = {
  DASHBOARD_STATS: 30000,      // 30 seconds
  TWINS_LIST: 15000,           // 15 seconds
  PREDICTIONS: 30000,          // 30 seconds
  ANOMALIES: 10000,            // 10 seconds (more frequent for alerts)
  ACTIONS: 15000,              // 15 seconds
  STREAM_RECONNECT: 3000,      // 3 seconds
}

// ==================== Limits ====================

export const LIMITS = {
  MAX_STREAM_UPDATES: 500,
  MAX_PREDICTIONS_CACHE: 1000,
  MAX_ANOMALIES_CACHE: 1000,
  MAX_ACTIONS_CACHE: 1000,
  MAX_NOTIFICATIONS: 50,
}

// ==================== Twin Status ====================

export const TWIN_STATUS = {
  HEALTHY: 'HEALTHY',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
  UNKNOWN: 'UNKNOWN',
  OFFLINE: 'OFFLINE',
}

// ==================== Anomaly Severity ====================

export const ANOMALY_SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO',
}

export const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',  // red-500
  HIGH: '#f97316',      // orange-500
  MEDIUM: '#eab308',    // yellow-500
  LOW: '#3b82f6',       // blue-500
  INFO: '#6b7280',      // gray-500
}

// ==================== Action Status ====================

export const ACTION_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  AWAITING_APPROVAL: 'AWAITING_APPROVAL',
}

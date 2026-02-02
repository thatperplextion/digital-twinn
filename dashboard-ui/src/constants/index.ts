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
} as const;

// ==================== Feature Flags ====================

export const FEATURES = {
  PREDICTIONS_ENABLED: true,
  ANOMALY_DETECTION_ENABLED: true,
  ACTIONS_ENABLED: true,
  SIMULATION_ENABLED: true,
  DARK_MODE_ONLY: false,
} as const;

// ==================== Pagination ====================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// ==================== Refresh Intervals (ms) ====================

export const REFRESH_INTERVALS = {
  DASHBOARD_STATS: 30000,      // 30 seconds
  TWINS_LIST: 15000,           // 15 seconds
  PREDICTIONS: 30000,          // 30 seconds
  ANOMALIES: 10000,            // 10 seconds (more frequent for alerts)
  ACTIONS: 15000,              // 15 seconds
  STREAM_RECONNECT: 3000,      // 3 seconds
} as const;

// ==================== Limits ====================

export const LIMITS = {
  MAX_STREAM_UPDATES: 500,
  MAX_PREDICTIONS_CACHE: 1000,
  MAX_ANOMALIES_CACHE: 1000,
  MAX_ACTIONS_CACHE: 1000,
  MAX_NOTIFICATIONS: 50,
} as const;

// ==================== Twin Status ====================

export const TWIN_STATUS = {
  HEALTHY: 'HEALTHY',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
  UNKNOWN: 'UNKNOWN',
  OFFLINE: 'OFFLINE',
} as const;

export type TwinStatusType = typeof TWIN_STATUS[keyof typeof TWIN_STATUS];

// ==================== Anomaly Severity ====================

export const ANOMALY_SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO',
} as const;

export type AnomalySeverityType = typeof ANOMALY_SEVERITY[keyof typeof ANOMALY_SEVERITY];

export const SEVERITY_COLORS: Record<AnomalySeverityType, string> = {
  CRITICAL: '#ef4444',  // red-500
  HIGH: '#f97316',      // orange-500
  MEDIUM: '#eab308',    // yellow-500
  LOW: '#3b82f6',       // blue-500
  INFO: '#6b7280',      // gray-500
};

// ==================== Action Status ====================

export const ACTION_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  AWAITING_APPROVAL: 'AWAITING_APPROVAL',
} as const;

export type ActionStatusType = typeof ACTION_STATUS[keyof typeof ACTION_STATUS];

// ==================== Chart Colors ====================

export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  info: '#06b6d4',
  muted: '#6b7280',
} as const;

// ==================== Date Formats ====================

export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME_ONLY: 'HH:mm:ss',
  RELATIVE_THRESHOLD_HOURS: 24,
} as const;

// ==================== Routes ====================

export const ROUTES = {
  DASHBOARD: '/',
  TWINS: '/twins',
  TWIN_DETAIL: '/twins/:id',
  PREDICTIONS: '/predictions',
  ANOMALIES: '/anomalies',
  ACTIONS: '/actions',
  SIMULATION: '/simulation',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
} as const;

// ==================== Local Storage Keys ====================

export const STORAGE_KEYS = {
  THEME: 'dt-theme',
  SIDEBAR_STATE: 'dt-sidebar',
  UI_PREFERENCES: 'ui-storage',
  AUTH_TOKEN: 'dt-auth-token',
} as const;

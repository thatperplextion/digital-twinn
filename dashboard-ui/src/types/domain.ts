/**
 * TypeScript Type Definitions for Digital Twin Dashboard
 */
// Minor change for commit history

// ==================== Generic Types ====================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<T>;

// ==================== API Types ====================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// ==================== Twin Types ====================

export type TwinStatus = 'online' | 'offline' | 'warning' | 'error' | 'unknown';

export interface Twin {
  id: string;
  name: string;
  type: TwinType;
  status: TwinStatus;
  description?: string;
  metadata: TwinMetadata;
  state: TwinState;
  createdAt: string;
  updatedAt: string;
}

export type TwinType =
  | 'sensor'
  | 'actuator'
  | 'controller'
  | 'gateway'
  | 'device'
  | 'system'
  | 'process';

export interface TwinMetadata {
  location?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  firmware?: string;
  tags?: string[];
  customFields?: Record<string, string | number | boolean>;
}

export interface TwinState {
  twinId: string;
  properties: Record<string, TwinProperty>;
  timestamp: string;
}

export interface TwinProperty {
  name: string;
  value: unknown;
  unit?: string;
  type: PropertyType;
  lastUpdated: string;
}

export type PropertyType = 'number' | 'string' | 'boolean' | 'object' | 'array';

// ==================== Telemetry Types ====================

export interface TelemetryData {
  twinId: string;
  timestamp: string;
  metrics: TelemetryMetric[];
}

export interface TelemetryMetric {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

export interface TelemetryQuery {
  twinId: string;
  metrics: string[];
  startTime: string;
  endTime: string;
  aggregation?: AggregationType;
  interval?: string;
}

export type AggregationType = 'avg' | 'min' | 'max' | 'sum' | 'count' | 'last';

// ==================== Prediction Types ====================

export interface Prediction {
  id: string;
  twinId: string;
  type: PredictionType;
  value: number;
  confidence: number;
  horizon: string;
  timestamp: string;
  metadata?: PredictionMetadata;
}

export type PredictionType =
  | 'maintenance'
  | 'failure'
  | 'performance'
  | 'anomaly'
  | 'capacity';

export interface PredictionMetadata {
  model: string;
  version: string;
  features: string[];
  accuracy?: number;
}

// ==================== Anomaly Types ====================

export interface Anomaly {
  id: string;
  twinId: string;
  type: AnomalyType;
  severity: Severity;
  description: string;
  detectedAt: string;
  resolvedAt?: string;
  status: AnomalyStatus;
  metrics: AnomalyMetric[];
}

export type AnomalyType =
  | 'spike'
  | 'drift'
  | 'pattern_change'
  | 'outlier'
  | 'missing_data'
  | 'threshold_breach';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type AnomalyStatus = 'active' | 'acknowledged' | 'resolved' | 'false_positive';

export interface AnomalyMetric {
  name: string;
  expected: number;
  actual: number;
  deviation: number;
}

// ==================== Action Types ====================

export interface Action {
  id: string;
  twinId: string;
  type: ActionType;
  status: ActionStatus;
  priority: Priority;
  description: string;
  parameters: Record<string, unknown>;
  createdAt: string;
  executedAt?: string;
  completedAt?: string;
  result?: ActionResult;
}

export type ActionType =
  | 'command'
  | 'configuration'
  | 'restart'
  | 'update'
  | 'maintenance'
  | 'alert';

export type ActionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type Priority = 'critical' | 'high' | 'normal' | 'low';

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: unknown;
  duration: number;
}

// ==================== Event Types ====================

export interface TwinEvent {
  id: string;
  twinId: string;
  type: EventType;
  category: EventCategory;
  payload: Record<string, unknown>;
  timestamp: string;
  source: string;
}

export type EventType =
  | 'telemetry'
  | 'state_change'
  | 'alert'
  | 'command'
  | 'lifecycle';

export type EventCategory = 'system' | 'user' | 'automated' | 'external';

// ==================== Dashboard Types ====================

export interface DashboardStats {
  totalTwins: number;
  activeTwins: number;
  alertCount: number;
  predictionAccuracy: number;
  systemHealth: number;
  lastUpdated: string;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
}

export type WidgetType =
  | 'chart'
  | 'gauge'
  | 'table'
  | 'map'
  | 'status'
  | 'metric'
  | 'timeline';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetConfig {
  twinId?: string;
  metrics?: string[];
  timeRange?: string;
  refreshInterval?: number;
  options?: Record<string, unknown>;
}

// ==================== User Types ====================

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  lastLogin?: string;
}

export type UserRole = 'admin' | 'operator' | 'viewer' | 'analyst';

export type Permission =
  | 'read:twins'
  | 'write:twins'
  | 'read:predictions'
  | 'read:anomalies'
  | 'execute:actions'
  | 'manage:users'
  | 'manage:system';

// ==================== Filter Types ====================

export interface FilterOptions {
  search?: string;
  status?: TwinStatus[];
  type?: TwinType[];
  severity?: Severity[];
  dateRange?: DateRange;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface DateRange {
  start: string;
  end: string;
}

// ==================== Notification Types ====================

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: Severity;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export type NotificationType = 'alert' | 'info' | 'warning' | 'error' | 'success';

// ==================== Chart Types ====================

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  color?: string;
  fill?: boolean;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface TimeSeriesData {
  metric: string;
  unit: string;
  points: TimeSeriesPoint[];
}

// ==================== Form Types ====================

export interface FormField<T = unknown> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// ==================== WebSocket Types ====================

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
  correlationId?: string;
}

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// ==================== Utility Types ====================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OmitFields<T, K extends keyof T> = Omit<T, K>;

export type ValueOf<T> = T[keyof T];

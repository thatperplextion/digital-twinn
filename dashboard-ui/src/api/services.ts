// Minor change for commit history
/**
 * API Service Layer for Digital Twin Dashboard
 * Provides typed API calls with error handling and request configuration
 */

import { API_CONFIG } from '../constants';
import type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  Twin,
  TwinState,
  Prediction,
  Anomaly,
  Action,
  TelemetryData,
  TelemetryQuery,
  DashboardStats,
  FilterOptions,
} from '../types/domain';

// ==================== HTTP Client ====================

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  async request<T>(endpoint: string, config: RequestConfig): Promise<T> {
    const url = this.buildUrl(endpoint, config.params);
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config.timeout ?? API_CONFIG.TIMEOUT
    );

    try {
      const response = await fetch(url, {
        method: config.method,
        headers: { ...this.defaultHeaders, ...config.headers },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          code: 'UNKNOWN_ERROR',
          message: response.statusText,
          timestamp: new Date().toISOString(),
        }));
        throw error;
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw {
          code: 'TIMEOUT',
          message: 'Request timed out',
          timestamp: new Date().toISOString(),
        } as ApiError;
      }
      throw error;
    }
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
}

// Create API client instance
const apiClient = new ApiClient(API_CONFIG.BASE_URL);

// ==================== Twin API ====================

export const twinApi = {
  /**
   * Get all twins with optional filtering
   */
  getAll: (filters?: FilterOptions): Promise<PaginatedResponse<Twin>> =>
    apiClient.get('/twins', filters as Record<string, string | number | boolean>),

  /**
   * Get a specific twin by ID
   */
  getById: (id: string): Promise<ApiResponse<Twin>> =>
    apiClient.get(`/twins/${id}`),

  /**
   * Create a new twin
   */
  create: (twin: Omit<Twin, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Twin>> =>
    apiClient.post('/twins', twin),

  /**
   * Update an existing twin
   */
  update: (id: string, twin: Partial<Twin>): Promise<ApiResponse<Twin>> =>
    apiClient.put(`/twins/${id}`, twin),

  /**
   * Delete a twin
   */
  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/twins/${id}`),

  /**
   * Get twin state
   */
  getState: (id: string): Promise<ApiResponse<TwinState>> =>
    apiClient.get(`/twins/${id}/state`),

  /**
   * Update twin state
   */
  updateState: (id: string, state: Partial<TwinState>): Promise<ApiResponse<TwinState>> =>
    apiClient.patch(`/twins/${id}/state`, state),
};

// ==================== Telemetry API ====================

export const telemetryApi = {
  /**
   * Get telemetry data for a twin
   */
  get: (query: TelemetryQuery): Promise<ApiResponse<TelemetryData[]>> =>
    apiClient.post('/telemetry/query', query),

  /**
   * Get latest telemetry for a twin
   */
  getLatest: (twinId: string): Promise<ApiResponse<TelemetryData>> =>
    apiClient.get(`/telemetry/${twinId}/latest`),

  /**
   * Stream telemetry data (returns WebSocket URL)
   */
  getStreamUrl: (twinId: string): string =>
    `${API_CONFIG.WS_URL}/telemetry/${twinId}/stream`,
};

// ==================== Prediction API ====================

export const predictionApi = {
  /**
   * Get all predictions for a twin
   */
  getByTwin: (twinId: string, limit?: number): Promise<ApiResponse<Prediction[]>> =>
    apiClient.get(`/predictions/twin/${twinId}`, { limit }),

  /**
   * Get a specific prediction
   */
  getById: (id: string): Promise<ApiResponse<Prediction>> =>
    apiClient.get(`/predictions/${id}`),

  /**
   * Request a new prediction
   */
  request: (twinId: string, type: string): Promise<ApiResponse<Prediction>> =>
    apiClient.post('/predictions', { twinId, type }),

  /**
   * Get prediction accuracy metrics
   */
  getAccuracy: (twinId?: string): Promise<ApiResponse<{ accuracy: number; count: number }>> =>
    apiClient.get('/predictions/accuracy', { twinId }),
};

// ==================== Anomaly API ====================

export const anomalyApi = {
  /**
   * Get all anomalies with filters
   */
  getAll: (filters?: FilterOptions): Promise<PaginatedResponse<Anomaly>> =>
    apiClient.get('/anomalies', filters as Record<string, string | number | boolean>),

  /**
   * Get anomalies for a specific twin
   */
  getByTwin: (twinId: string): Promise<ApiResponse<Anomaly[]>> =>
    apiClient.get(`/anomalies/twin/${twinId}`),

  /**
   * Get a specific anomaly
   */
  getById: (id: string): Promise<ApiResponse<Anomaly>> =>
    apiClient.get(`/anomalies/${id}`),

  /**
   * Acknowledge an anomaly
   */
  acknowledge: (id: string): Promise<ApiResponse<Anomaly>> =>
    apiClient.post(`/anomalies/${id}/acknowledge`),

  /**
   * Resolve an anomaly
   */
  resolve: (id: string, resolution?: string): Promise<ApiResponse<Anomaly>> =>
    apiClient.post(`/anomalies/${id}/resolve`, { resolution }),

  /**
   * Mark as false positive
   */
  markFalsePositive: (id: string, reason?: string): Promise<ApiResponse<Anomaly>> =>
    apiClient.post(`/anomalies/${id}/false-positive`, { reason }),
};

// ==================== Action API ====================

export const actionApi = {
  /**
   * Get all actions with filters
   */
  getAll: (filters?: FilterOptions): Promise<PaginatedResponse<Action>> =>
    apiClient.get('/actions', filters as Record<string, string | number | boolean>),

  /**
   * Get actions for a specific twin
   */
  getByTwin: (twinId: string): Promise<ApiResponse<Action[]>> =>
    apiClient.get(`/actions/twin/${twinId}`),

  /**
   * Get a specific action
   */
  getById: (id: string): Promise<ApiResponse<Action>> =>
    apiClient.get(`/actions/${id}`),

  /**
   * Create a new action
   */
  create: (action: Omit<Action, 'id' | 'createdAt' | 'status'>): Promise<ApiResponse<Action>> =>
    apiClient.post('/actions', action),

  /**
   * Execute an action
   */
  execute: (id: string): Promise<ApiResponse<Action>> =>
    apiClient.post(`/actions/${id}/execute`),

  /**
   * Cancel an action
   */
  cancel: (id: string): Promise<ApiResponse<Action>> =>
    apiClient.post(`/actions/${id}/cancel`),
};

// ==================== Dashboard API ====================

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: (): Promise<ApiResponse<DashboardStats>> =>
    apiClient.get('/dashboard/stats'),

  /**
   * Get system health
   */
  getHealth: (): Promise<ApiResponse<{ status: string; services: Record<string, string> }>> =>
    apiClient.get('/dashboard/health'),

  /**
   * Get recent activity
   */
  getRecentActivity: (limit?: number): Promise<ApiResponse<unknown[]>> =>
    apiClient.get('/dashboard/activity', { limit }),
};

// ==================== Export Client ====================

export { apiClient };
export type { RequestConfig, ApiClient };

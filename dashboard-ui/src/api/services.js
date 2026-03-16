var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { API_CONFIG } from "../constants";
class ApiClient {
  constructor(baseUrl) {
    __publicField(this, "baseUrl");
    __publicField(this, "defaultHeaders");
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json"
    };
  }
  buildUrl(endpoint, params) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== void 0) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }
  async request(endpoint, config) {
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
        body: config.body ? JSON.stringify(config.body) : void 0,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          code: "UNKNOWN_ERROR",
          message: response.statusText,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }));
        throw error;
      }
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw {
          code: "TIMEOUT",
          message: "Request timed out",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      throw error;
    }
  }
  get(endpoint, params) {
    return this.request(endpoint, { method: "GET", params });
  }
  post(endpoint, body) {
    return this.request(endpoint, { method: "POST", body });
  }
  put(endpoint, body) {
    return this.request(endpoint, { method: "PUT", body });
  }
  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
  patch(endpoint, body) {
    return this.request(endpoint, { method: "PATCH", body });
  }
  setAuthToken(token) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }
  clearAuthToken() {
    delete this.defaultHeaders["Authorization"];
  }
}
const apiClient = new ApiClient(API_CONFIG.BASE_URL);
const twinApi = {
  /**
   * Get all twins with optional filtering
   */
  getAll: (filters) => apiClient.get("/twins", filters),
  /**
   * Get a specific twin by ID
   */
  getById: (id) => apiClient.get(`/twins/${id}`),
  /**
   * Create a new twin
   */
  create: (twin) => apiClient.post("/twins", twin),
  /**
   * Update an existing twin
   */
  update: (id, twin) => apiClient.put(`/twins/${id}`, twin),
  /**
   * Delete a twin
   */
  delete: (id) => apiClient.delete(`/twins/${id}`),
  /**
   * Get twin state
   */
  getState: (id) => apiClient.get(`/twins/${id}/state`),
  /**
   * Update twin state
   */
  updateState: (id, state) => apiClient.patch(`/twins/${id}/state`, state)
};
const telemetryApi = {
  /**
   * Get telemetry data for a twin
   */
  get: (query) => apiClient.post("/telemetry/query", query),
  /**
   * Get latest telemetry for a twin
   */
  getLatest: (twinId) => apiClient.get(`/telemetry/${twinId}/latest`),
  /**
   * Stream telemetry data (returns WebSocket URL)
   */
  getStreamUrl: (twinId) => `${API_CONFIG.WS_URL}/telemetry/${twinId}/stream`
};
const predictionApi = {
  /**
   * Get all predictions for a twin
   */
  getByTwin: (twinId, limit) => apiClient.get(`/predictions/twin/${twinId}`, { limit }),
  /**
   * Get a specific prediction
   */
  getById: (id) => apiClient.get(`/predictions/${id}`),
  /**
   * Request a new prediction
   */
  request: (twinId, type) => apiClient.post("/predictions", { twinId, type }),
  /**
   * Get prediction accuracy metrics
   */
  getAccuracy: (twinId) => apiClient.get("/predictions/accuracy", { twinId })
};
const anomalyApi = {
  /**
   * Get all anomalies with filters
   */
  getAll: (filters) => apiClient.get("/anomalies", filters),
  /**
   * Get anomalies for a specific twin
   */
  getByTwin: (twinId) => apiClient.get(`/anomalies/twin/${twinId}`),
  /**
   * Get a specific anomaly
   */
  getById: (id) => apiClient.get(`/anomalies/${id}`),
  /**
   * Acknowledge an anomaly
   */
  acknowledge: (id) => apiClient.post(`/anomalies/${id}/acknowledge`),
  /**
   * Resolve an anomaly
   */
  resolve: (id, resolution) => apiClient.post(`/anomalies/${id}/resolve`, { resolution }),
  /**
   * Mark as false positive
   */
  markFalsePositive: (id, reason) => apiClient.post(`/anomalies/${id}/false-positive`, { reason })
};
const actionApi = {
  /**
   * Get all actions with filters
   */
  getAll: (filters) => apiClient.get("/actions", filters),
  /**
   * Get actions for a specific twin
   */
  getByTwin: (twinId) => apiClient.get(`/actions/twin/${twinId}`),
  /**
   * Get a specific action
   */
  getById: (id) => apiClient.get(`/actions/${id}`),
  /**
   * Create a new action
   */
  create: (action) => apiClient.post("/actions", action),
  /**
   * Execute an action
   */
  execute: (id) => apiClient.post(`/actions/${id}/execute`),
  /**
   * Cancel an action
   */
  cancel: (id) => apiClient.post(`/actions/${id}/cancel`)
};
const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: () => apiClient.get("/dashboard/stats"),
  /**
   * Get system health
   */
  getHealth: () => apiClient.get("/dashboard/health"),
  /**
   * Get recent activity
   */
  getRecentActivity: (limit) => apiClient.get("/dashboard/activity", { limit })
};
export {
  actionApi,
  anomalyApi,
  apiClient,
  dashboardApi,
  predictionApi,
  telemetryApi,
  twinApi
};

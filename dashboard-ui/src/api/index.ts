import axios from 'axios'
import { 
  DigitalTwin, 
  TwinSnapshot, 
  Prediction, 
  Anomaly, 
  Action, 
  TwinEvent,
  DashboardStats,
  CreateTwinRequest,
  ExplainabilityReport,
  SimulationRequest,
  SimulationResult,
  TwinState
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  // Minor change for commit history
  import axios from 'axios'
  import { 
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ==================== Dashboard API ====================

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/stats')
  return response.data
}

// ==================== Twin API ====================

export const getAllTwins = async (entityType?: string): Promise<TwinSnapshot[]> => {
  const params = entityType ? { entityType } : {}
  const response = await api.get('/dashboard/twins', { params })
  return response.data
}

export const getTwin = async (twinId: string): Promise<TwinSnapshot> => {
  const response = await api.get(`/dashboard/twins/${twinId}`)
  return response.data
}

export const getTwinDetails = async (twinId: string): Promise<DigitalTwin> => {
  const response = await api.get(`/dashboard/twins/${twinId}/details`)
  return response.data
}

export const createTwin = async (request: CreateTwinRequest): Promise<DigitalTwin> => {
  const response = await api.post('/dashboard/twins', request)
  return response.data
}

export const deleteTwin = async (twinId: string): Promise<void> => {
  await api.delete(`/dashboard/twins/${twinId}`)
}

export const getTwinState = async (twinId: string): Promise<TwinState> => {
  const response = await api.get(`/dashboard/twins/${twinId}/state`)
  return response.data
}

export const getTwinStateHistory = async (twinId: string, limit = 100): Promise<TwinState[]> => {
  const response = await api.get(`/dashboard/twins/${twinId}/state-history`, {
    params: { limit }
  })
  return response.data
}

// ==================== Event API ====================

export const sendEvent = async (event: Partial<TwinEvent>): Promise<TwinEvent> => {
  const response = await api.post('/events', event)
  return response.data
}

export const getRecentEvents = async (twinId: string, limit = 50): Promise<TwinEvent[]> => {
  const response = await api.get(`/dashboard/twins/${twinId}/events`, {
    params: { limit }
  })
  return response.data
}

// ==================== Prediction API ====================

export const getPredictions = async (twinId: string): Promise<Prediction[]> => {
  const response = await api.get(`/dashboard/twins/${twinId}/predictions`)
  return response.data
}

export const getLatestPredictions = async (twinId: string): Promise<Record<string, Prediction>> => {
  const response = await api.get(`/dashboard/twins/${twinId}/predictions/latest`)
  return response.data
}

export const getAllPredictions = async (): Promise<Prediction[]> => {
  const response = await api.get('/dashboard/predictions')
  return response.data
}

// ==================== Anomaly API ====================

export const getAnomalies = async (twinId: string): Promise<Anomaly[]> => {
  const response = await api.get(`/dashboard/twins/${twinId}/anomalies`)
  return response.data
}

export const getActiveAnomalies = async (twinId: string): Promise<Anomaly[]> => {
  const response = await api.get(`/dashboard/twins/${twinId}/anomalies/active`)
  return response.data
}

export const getAllAnomalies = async (severity?: string): Promise<Anomaly[]> => {
  const params = severity ? { severity } : {}
  const response = await api.get('/dashboard/anomalies', { params })
  return response.data
}

export const resolveAnomaly = async (anomalyId: string, resolution: string): Promise<Anomaly> => {
  const response = await api.post(`/dashboard/anomalies/${anomalyId}/resolve`, { resolution })
  return response.data
}

// ==================== Action API ====================

export const getActions = async (twinId: string): Promise<Action[]> => {
  const response = await api.get(`/dashboard/twins/${twinId}/actions`)
  return response.data
}

export const getAllActions = async (status?: string): Promise<Action[]> => {
  const params = status ? { status } : {}
  const response = await api.get('/dashboard/actions', { params })
  return response.data
}

export const triggerAction = async (twinId: string, actionType: string, parameters: Record<string, any>): Promise<Action> => {
  const response = await api.post(`/dashboard/twins/${twinId}/actions/trigger`, {
    type: actionType,
    parameters
  })
  return response.data
}

export const cancelAction = async (actionId: string): Promise<void> => {
  await api.post(`/dashboard/actions/${actionId}/cancel`)
}

// ==================== Explainability API ====================

export const getExplainabilityReport = async (twinId: string): Promise<ExplainabilityReport> => {
  const response = await api.get(`/dashboard/twins/${twinId}/explain`)
  return response.data
}

export const getDecisionExplanation = async (twinId: string, decisionId: string): Promise<any> => {
  const response = await api.get(`/dashboard/twins/${twinId}/explain/decision/${decisionId}`)
  return response.data
}

// ==================== Simulation API ====================

export const runSimulation = async (request: SimulationRequest): Promise<SimulationResult> => {
  const response = await api.post('/simulation/run', request)
  return response.data
}

export const getSimulationResults = async (simulationId: string): Promise<SimulationResult> => {
  const response = await api.get(`/simulation/${simulationId}`)
  return response.data
}

export const cloneTwin = async (twinId: string, name: string): Promise<DigitalTwin> => {
  const response = await api.post(`/simulation/clone/${twinId}`, { name })
  return response.data
}

// ==================== Auth API ====================

export const login = async (username: string, password: string): Promise<{ token: string }> => {
  const response = await api.post('/auth/login', { username, password })
  return response.data
}

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
  localStorage.removeItem('authToken')
}

export const refreshToken = async (): Promise<{ token: string }> => {
  const response = await api.post('/auth/refresh')
  return response.data
}

// ==================== Streaming API ====================

export const createEventSource = (endpoint: string): EventSource => {
  const token = localStorage.getItem('authToken')
  const url = `${API_BASE_URL}${endpoint}${token ? `?token=${token}` : ''}`
  return new EventSource(url)
}

export default api

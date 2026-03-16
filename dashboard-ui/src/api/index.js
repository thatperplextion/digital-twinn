import axios from 'axios'

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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ==================== Dashboard API ====================

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats')
  return response.data
}

// ==================== Twin API ====================

export const getAllTwins = async (entityType) => {
  const params = entityType ? { entityType } : {}
  const response = await api.get('/dashboard/twins', { params })
  return response.data
}

export const getTwin = async (twinId) => {
  const response = await api.get(`/dashboard/twins/${twinId}`)
  return response.data
}

export const getTwinDetails = async (twinId) => {
  const response = await api.get(`/dashboard/twins/${twinId}/details`)
  return response.data
}

export const createTwin = async (request) => {
  const response = await api.post('/dashboard/twins', request)
  return response.data
}

export const deleteTwin = async (twinId) => {
  await api.delete(`/dashboard/twins/${twinId}`)
}

export const getTwinState = async (twinId) => {
  const response = await api.get(`/dashboard/twins/${twinId}/state`)
  return response.data
}

export const getTwinStateHistory = async (twinId, limit = 100) => {
  const response = await api.get(`/dashboard/twins/${twinId}/state-history`, {
    params: { limit }
  })
  return response.data
}

// ==================== Event API ====================

export const sendEvent = async (event) => {
  const response = await api.post('/events', event)
  return response.data
}

export const getRecentEvents = async (twinId, limit = 50) => {
  const response = await api.get(`/dashboard/twins/${twinId}/events`, {
    params: { limit }
  })
  return response.data
}

// ==================== Prediction API ====================

export const getPredictions = async (twinId) => {
  const response = await api.get(`/dashboard/twins/${twinId}/predictions`)
  return response.data
}

export const getLatestPredictions = async (twinId) => {
  const response = await api.get(`/dashboard/twins/${twinId}/predictions/latest`)
  return response.data
}

export const getAllPredictions = async () => {
  const response = await api.get('/dashboard/predictions')
  return response.data
}

// ==================== Anomaly API ====================

export const getAnomalies = async (twinId) => {
  const response = await api.get(`/dashboard/twins/${twinId}/anomalies`)
  return response.data
}

export const getActiveAnomalies = async (twinId) => {
  const response = await api.get(`/dashboard/twins/${twinId}/anomalies/active`)
  return response.data
}

export const getAllAnomalies = async (severity) => {
  const params = severity ? { severity } : {}
  const response = await api.get('/dashboard/anomalies', { params })
  return response.data
}

export const resolveAnomaly = async (anomalyId, resolution) => {
  const response = await api.post(`/dashboard/anomalies/${anomalyId}/resolve`, { resolution })
  return response.data
}

// ==================== Action API ====================

export const getActions = async (twinId) => {
  const response = await api.get(`/dashboard/twins/${twinId}/actions`)
  return response.data
}

export const getAllActions = async (status) => {
  const params = status ? { status } : {}
  const response = await api.get('/dashboard/actions', { params })
  return response.data
}

export const triggerAction = async (twinId, actionType, parameters) => {
  const response = await api.post(`/dashboard/twins/${twinId}/actions/trigger`, {
    type: actionType,
    parameters
  })
  return response.data
}

export const cancelAction = async (actionId) => {
  await api.post(`/dashboard/actions/${actionId}/cancel`)
}

// ==================== Explainability API ====================

export const getExplainabilityReport = async (twinId) => {
  const response = await api.get(`/dashboard/twins/${twinId}/explain`)
  return response.data
}

export const getDecisionExplanation = async (twinId, decisionId) => {
  const response = await api.get(`/dashboard/twins/${twinId}/explain/decision/${decisionId}`)
  return response.data
}

// ==================== Simulation API ====================

export const runSimulation = async (request) => {
  const response = await api.post('/simulation/run', request)
  return response.data
}

export const getSimulationResults = async (simulationId) => {
  const response = await api.get(`/simulation/${simulationId}`)
  return response.data
}

export const cloneTwin = async (twinId, name) => {
  const response = await api.post(`/simulation/clone/${twinId}`, { name })
  return response.data
}

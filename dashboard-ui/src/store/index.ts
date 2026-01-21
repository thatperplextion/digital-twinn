import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DigitalTwin, TwinSnapshot, Prediction, Anomaly, Action, StreamUpdate, DashboardStats } from '../types'

// ==================== Dashboard Store ====================

interface DashboardState {
  stats: DashboardStats | null
  isLoading: boolean
  error: string | null
  setStats: (stats: DashboardStats) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

// ==================== Twin Store ====================

interface TwinState {
  twins: TwinSnapshot[]
  selectedTwin: DigitalTwin | null
  isLoading: boolean
  error: string | null
  setTwins: (twins: TwinSnapshot[]) => void
  addTwin: (twin: TwinSnapshot) => void
  updateTwin: (twin: TwinSnapshot) => void
  removeTwin: (twinId: string) => void
  setSelectedTwin: (twin: DigitalTwin | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTwinStore = create<TwinState>((set) => ({
  twins: [],
  selectedTwin: null,
  isLoading: false,
  error: null,
  setTwins: (twins) => set({ twins }),
  addTwin: (twin) => set((state) => ({ twins: [...state.twins, twin] })),
  updateTwin: (twin) => set((state) => ({
    twins: state.twins.map((t) => t.id === twin.id ? twin : t)
  })),
  removeTwin: (twinId) => set((state) => ({
    twins: state.twins.filter((t) => t.id !== twinId)
  })),
  setSelectedTwin: (selectedTwin) => set({ selectedTwin }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

// ==================== Prediction Store ====================

interface PredictionState {
  predictions: Prediction[]
  isLoading: boolean
  error: string | null
  setPredictions: (predictions: Prediction[]) => void
  addPrediction: (prediction: Prediction) => void
  updatePrediction: (prediction: Prediction) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const usePredictionStore = create<PredictionState>((set) => ({
  predictions: [],
  isLoading: false,
  error: null,
  setPredictions: (predictions) => set({ predictions }),
  addPrediction: (prediction) => set((state) => ({
    predictions: [prediction, ...state.predictions].slice(0, 1000)
  })),
  updatePrediction: (prediction) => set((state) => ({
    predictions: state.predictions.map((p) => p.id === prediction.id ? prediction : p)
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

// ==================== Anomaly Store ====================

interface AnomalyState {
  anomalies: Anomaly[]
  activeCount: number
  isLoading: boolean
  error: string | null
  setAnomalies: (anomalies: Anomaly[]) => void
  addAnomaly: (anomaly: Anomaly) => void
  updateAnomaly: (anomaly: Anomaly) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAnomalyStore = create<AnomalyState>((set) => ({
  anomalies: [],
  activeCount: 0,
  isLoading: false,
  error: null,
  setAnomalies: (anomalies) => set({ 
    anomalies,
    activeCount: anomalies.filter(a => a.status !== 'RESOLVED').length
  }),
  addAnomaly: (anomaly) => set((state) => {
    const newAnomalies = [anomaly, ...state.anomalies].slice(0, 1000)
    return {
      anomalies: newAnomalies,
      activeCount: newAnomalies.filter(a => a.status !== 'RESOLVED').length
    }
  }),
  updateAnomaly: (anomaly) => set((state) => {
    const newAnomalies = state.anomalies.map((a) => a.id === anomaly.id ? anomaly : a)
    return {
      anomalies: newAnomalies,
      activeCount: newAnomalies.filter(a => a.status !== 'RESOLVED').length
    }
  }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

// ==================== Action Store ====================

interface ActionState {
  actions: Action[]
  pendingCount: number
  isLoading: boolean
  error: string | null
  setActions: (actions: Action[]) => void
  addAction: (action: Action) => void
  updateAction: (action: Action) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useActionStore = create<ActionState>((set) => ({
  actions: [],
  pendingCount: 0,
  isLoading: false,
  error: null,
  setActions: (actions) => set({ 
    actions,
    pendingCount: actions.filter(a => a.status === 'PENDING' || a.status === 'IN_PROGRESS').length
  }),
  addAction: (action) => set((state) => {
    const newActions = [action, ...state.actions].slice(0, 1000)
    return {
      actions: newActions,
      pendingCount: newActions.filter(a => a.status === 'PENDING' || a.status === 'IN_PROGRESS').length
    }
  }),
  updateAction: (action) => set((state) => {
    const newActions = state.actions.map((a) => a.id === action.id ? action : a)
    return {
      actions: newActions,
      pendingCount: newActions.filter(a => a.status === 'PENDING' || a.status === 'IN_PROGRESS').length
    }
  }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

// ==================== Stream Store ====================

interface StreamState {
  updates: StreamUpdate[]
  isConnected: boolean
  connectionError: string | null
  addUpdate: (update: StreamUpdate) => void
  clearUpdates: () => void
  setConnected: (connected: boolean) => void
  setConnectionError: (error: string | null) => void
}

export const useStreamStore = create<StreamState>((set) => ({
  updates: [],
  isConnected: false,
  connectionError: null,
  addUpdate: (update) => set((state) => ({
    updates: [update, ...state.updates].slice(0, 500)
  })),
  clearUpdates: () => set({ updates: [] }),
  setConnected: (isConnected) => set({ isConnected }),
  setConnectionError: (connectionError) => set({ connectionError }),
}))

// ==================== UI Store ====================

interface UIState {
  sidebarOpen: boolean
  theme: 'dark' | 'light'
  activeView: string
  notifications: Notification[]
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: 'dark' | 'light') => void
  setActiveView: (view: string) => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'dark',
      activeView: 'dashboard',
      notifications: [],
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setActiveView: (activeView) => set({ activeView }),
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications].slice(0, 50)
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
    }
  )
)

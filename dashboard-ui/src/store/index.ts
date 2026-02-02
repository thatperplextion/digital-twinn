// Zustand store declarations
// Note: Run `npm install` in dashboard-ui to install zustand and resolve module errors
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DigitalTwin, TwinSnapshot, Prediction, Anomaly, Action, StreamUpdate, DashboardStats } from '../types'

// Type helper for set function
type SetState<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void

// ==================== Dashboard Store ====================

interface DashboardState {
  stats: DashboardStats | null
  isLoading: boolean
  error: string | null
  setStats: (stats: DashboardStats) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useDashboardStore = create<DashboardState>()((set: SetState<DashboardState>) => ({
  stats: null,
  isLoading: false,
  error: null,
  setStats: (stats: DashboardStats) => set({ stats }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
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

export const useTwinStore = create<TwinState>()((set: SetState<TwinState>) => ({
  twins: [],
  selectedTwin: null,
  isLoading: false,
  error: null,
  setTwins: (twins: TwinSnapshot[]) => set({ twins }),
  addTwin: (twin: TwinSnapshot) => set((state: TwinState) => ({ twins: [...state.twins, twin] })),
  updateTwin: (twin: TwinSnapshot) => set((state: TwinState) => ({
    twins: state.twins.map((t: TwinSnapshot) => t.id === twin.id ? twin : t)
  })),
  removeTwin: (twinId: string) => set((state: TwinState) => ({
    twins: state.twins.filter((t: TwinSnapshot) => t.id !== twinId)
  })),
  setSelectedTwin: (selectedTwin: DigitalTwin | null) => set({ selectedTwin }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
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

export const usePredictionStore = create<PredictionState>()((set: SetState<PredictionState>) => ({
  predictions: [],
  isLoading: false,
  error: null,
  setPredictions: (predictions: Prediction[]) => set({ predictions }),
  addPrediction: (prediction: Prediction) => set((state: PredictionState) => ({
    predictions: [prediction, ...state.predictions].slice(0, 1000)
  })),
  updatePrediction: (prediction: Prediction) => set((state: PredictionState) => ({
    predictions: state.predictions.map((p: Prediction) => p.id === prediction.id ? prediction : p)
  })),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
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

export const useAnomalyStore = create<AnomalyState>()((set: SetState<AnomalyState>) => ({
  anomalies: [],
  activeCount: 0,
  isLoading: false,
  error: null,
  setAnomalies: (anomalies: Anomaly[]) => set({ 
    anomalies,
    activeCount: anomalies.filter((a: Anomaly) => a.status !== 'RESOLVED').length
  }),
  addAnomaly: (anomaly: Anomaly) => set((state: AnomalyState) => {
    const newAnomalies = [anomaly, ...state.anomalies].slice(0, 1000)
    return {
      anomalies: newAnomalies,
      activeCount: newAnomalies.filter((a: Anomaly) => a.status !== 'RESOLVED').length
    }
  }),
  updateAnomaly: (anomaly: Anomaly) => set((state: AnomalyState) => {
    const newAnomalies = state.anomalies.map((a: Anomaly) => a.id === anomaly.id ? anomaly : a)
    return {
      anomalies: newAnomalies,
      activeCount: newAnomalies.filter((a: Anomaly) => a.status !== 'RESOLVED').length
    }
  }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
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

export const useActionStore = create<ActionState>()((set: SetState<ActionState>) => ({
  actions: [],
  pendingCount: 0,
  isLoading: false,
  error: null,
  setActions: (actions: Action[]) => set({ 
    actions,
    pendingCount: actions.filter((a: Action) => a.status === 'PENDING' || a.status === 'IN_PROGRESS').length
  }),
  addAction: (action: Action) => set((state: ActionState) => {
    const newActions = [action, ...state.actions].slice(0, 1000)
    return {
      actions: newActions,
      pendingCount: newActions.filter((a: Action) => a.status === 'PENDING' || a.status === 'IN_PROGRESS').length
    }
  }),
  updateAction: (action: Action) => set((state: ActionState) => {
    const newActions = state.actions.map((a: Action) => a.id === action.id ? action : a)
    return {
      actions: newActions,
      pendingCount: newActions.filter((a: Action) => a.status === 'PENDING' || a.status === 'IN_PROGRESS').length
    }
  }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
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

export const useStreamStore = create<StreamState>()((set: SetState<StreamState>) => ({
  updates: [],
  isConnected: false,
  connectionError: null,
  addUpdate: (update: StreamUpdate) => set((state: StreamState) => ({
    updates: [update, ...state.updates].slice(0, 500)
  })),
  clearUpdates: () => set({ updates: [] }),
  setConnected: (isConnected: boolean) => set({ isConnected }),
  setConnectionError: (connectionError: string | null) => set({ connectionError }),
}))

// ==================== UI Store ====================

interface AppNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
}

interface UIState {
  sidebarOpen: boolean
  theme: 'dark' | 'light'
  activeView: string
  notifications: AppNotification[]
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: 'dark' | 'light') => void
  setActiveView: (view: string) => void
  addNotification: (notification: AppNotification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

type UIStatePersist = Pick<UIState, 'theme' | 'sidebarOpen'>

export const useUIStore = create<UIState>()(
  persist(
    (set: SetState<UIState>) => ({
      sidebarOpen: true,
      theme: 'dark',
      activeView: 'dashboard',
      notifications: [],
      setSidebarOpen: (sidebarOpen: boolean) => set({ sidebarOpen }),
      toggleSidebar: () => set((state: UIState) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme: 'dark' | 'light') => set({ theme }),
      setActiveView: (activeView: string) => set({ activeView }),
      addNotification: (notification: AppNotification) => set((state: UIState) => ({
        notifications: [notification, ...state.notifications].slice(0, 50)
      })),
      removeNotification: (id: string) => set((state: UIState) => ({
        notifications: state.notifications.filter((n: AppNotification) => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state: UIState): UIStatePersist => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
    }
  )
)

import { create } from "zustand";
import { persist } from "zustand/middleware";
const useDashboardStore = create()((set) => ({
  stats: null,
  isLoading: false,
  error: null,
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));
const useTwinStore = create()((set) => ({
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
  setError: (error) => set({ error })
}));
const usePredictionStore = create()((set) => ({
  predictions: [],
  isLoading: false,
  error: null,
  setPredictions: (predictions) => set({ predictions }),
  addPrediction: (prediction) => set((state) => ({
    predictions: [prediction, ...state.predictions].slice(0, 1e3)
  })),
  updatePrediction: (prediction) => set((state) => ({
    predictions: state.predictions.map((p) => p.id === prediction.id ? prediction : p)
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));
const useAnomalyStore = create()((set) => ({
  anomalies: [],
  activeCount: 0,
  isLoading: false,
  error: null,
  setAnomalies: (anomalies) => set({
    anomalies,
    activeCount: anomalies.filter((a) => a.status !== "RESOLVED").length
  }),
  addAnomaly: (anomaly) => set((state) => {
    const newAnomalies = [anomaly, ...state.anomalies].slice(0, 1e3);
    return {
      anomalies: newAnomalies,
      activeCount: newAnomalies.filter((a) => a.status !== "RESOLVED").length
    };
  }),
  updateAnomaly: (anomaly) => set((state) => {
    const newAnomalies = state.anomalies.map((a) => a.id === anomaly.id ? anomaly : a);
    return {
      anomalies: newAnomalies,
      activeCount: newAnomalies.filter((a) => a.status !== "RESOLVED").length
    };
  }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));
const useActionStore = create()((set) => ({
  actions: [],
  pendingCount: 0,
  isLoading: false,
  error: null,
  setActions: (actions) => set({
    actions,
    pendingCount: actions.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS").length
  }),
  addAction: (action) => set((state) => {
    const newActions = [action, ...state.actions].slice(0, 1e3);
    return {
      actions: newActions,
      pendingCount: newActions.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS").length
    };
  }),
  updateAction: (action) => set((state) => {
    const newActions = state.actions.map((a) => a.id === action.id ? action : a);
    return {
      actions: newActions,
      pendingCount: newActions.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS").length
    };
  }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));
const useStreamStore = create()((set) => ({
  updates: [],
  isConnected: false,
  connectionError: null,
  addUpdate: (update) => set((state) => ({
    updates: [update, ...state.updates].slice(0, 500)
  })),
  clearUpdates: () => set({ updates: [] }),
  setConnected: (isConnected) => set({ isConnected }),
  setConnectionError: (connectionError) => set({ connectionError })
}));
const useUIStore = create()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: "dark",
      activeView: "dashboard",
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
      clearNotifications: () => set({ notifications: [] })
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen })
    }
  )
);
export {
  useActionStore,
  useAnomalyStore,
  useDashboardStore,
  usePredictionStore,
  useStreamStore,
  useTwinStore,
  useUIStore
};

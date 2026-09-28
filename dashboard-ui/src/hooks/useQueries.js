import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
const queryKeys = {
  // Dashboard
  dashboardStats: ["dashboard", "stats"],
  // Twins
  twins: ["twins"],
  twinsList: (params) => [...queryKeys.twins, "list", params],
  twinDetail: (id) => [...queryKeys.twins, "detail", id],
  twinHistory: (id) => [...queryKeys.twins, "history", id],
  // Predictions
  predictions: ["predictions"],
  predictionsList: (params) => [...queryKeys.predictions, "list", params],
  predictionDetail: (id) => [...queryKeys.predictions, "detail", id],
  // Anomalies
  anomalies: ["anomalies"],
  anomaliesList: (params) => [...queryKeys.anomalies, "list", params],
  anomalyDetail: (id) => [...queryKeys.anomalies, "detail", id],
  // Actions
  actions: ["actions"],
  actionsList: (params) => [...queryKeys.actions, "list", params],
  actionDetail: (id) => [...queryKeys.actions, "detail", id],
  // Events
  events: ["events"],
  eventsList: (twinId) => [...queryKeys.events, "list", twinId]
};
function useDashboardStats(options) {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: () => api.getDashboardStats(),
    staleTime: 1e4,
    // 10 seconds
    refetchInterval: 3e4,
    // 30 seconds
    ...options
  });
}
function useTwins(params, options) {
  return useQuery({
    queryKey: queryKeys.twinsList(params),
    queryFn: () => api.getAllTwins(params?.type),
    staleTime: 5e3,
    ...options
  });
}
function useTwinDetail(id, options) {
  return useQuery({
    queryKey: queryKeys.twinDetail(id),
    queryFn: () => api.getTwinDetails(id),
    enabled: !!id,
    staleTime: 5e3,
    ...options
  });
}
function useTwinHistory(id, options) {
  return useQuery({
    queryKey: queryKeys.twinHistory(id),
    queryFn: () => api.getRecentEvents(id),
    enabled: !!id,
    staleTime: 1e4,
    ...options
  });
}
function useCreateTwin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.createTwin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.twins });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    }
  });
}
function useDeleteTwin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteTwin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.twins });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    }
  });
}
function usePredictions(params, options) {
  return useQuery({
    queryKey: queryKeys.predictionsList(params),
    queryFn: () => params?.twinId ? api.getPredictions(params.twinId) : api.getAllPredictions(),
    staleTime: 1e4,
    ...options
  });
}
function useAnomalies(params, options) {
  return useQuery({
    queryKey: queryKeys.anomaliesList(params),
    queryFn: () => params?.twinId ? api.getAnomalies(params.twinId) : api.getAllAnomalies(params?.severity),
    staleTime: 5e3,
    refetchInterval: 15e3,
    // Refresh every 15s for active monitoring
    ...options
  });
}
function useResolveAnomaly() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolution }) => api.resolveAnomaly(id, resolution),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.anomalyDetail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.anomalies });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    }
  });
}
function useActions(params, options) {
  return useQuery({
    queryKey: queryKeys.actionsList(params),
    queryFn: () => params?.twinId ? api.getActions(params.twinId) : api.getAllActions(params?.status),
    staleTime: 5e3,
    ...options
  });
}
function useCancelAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.cancelAction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionDetail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.actions });
    }
  });
}
function useTriggerAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ twinId, actionType, parameters }) => api.triggerAction(twinId, actionType, parameters),
    onSuccess: (_, { twinId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.twinDetail(twinId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.actions });
    }
  });
}
function useSendEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (event) => api.sendEvent(event),
    onSuccess: (_, event) => {
      if (event.twinId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.twinDetail(event.twinId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.twinHistory(event.twinId) });
      }
    }
  });
}
function usePrefetchTwin() {
  const queryClient = useQueryClient();
  return (id) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.twinDetail(id),
      queryFn: () => api.getTwinDetails(id),
      staleTime: 5e3
    });
  };
}
function usePrefetchAnomalyDetail() {
  const queryClient = useQueryClient();
  return (id) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.anomalyDetail(id),
      queryFn: () => api.getAllAnomalies(),
      staleTime: 5e3
    });
  };
}
export {
  queryKeys,
  useActions,
  useAnomalies,
  useCancelAction,
  useCreateTwin,
  useDashboardStats,
  useDeleteTwin,
  usePredictions,
  usePrefetchAnomalyDetail,
  usePrefetchTwin,
  useResolveAnomaly,
  useSendEvent,
  useTriggerAction,
  useTwinDetail,
  useTwinHistory,
  useTwins
};

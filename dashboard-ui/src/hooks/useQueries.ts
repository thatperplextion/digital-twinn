import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import * as api from '../api';
import { 
  DigitalTwin, 
  TwinSnapshot, 
  Prediction, 
  Anomaly, 
  Action, 
  DashboardStats,
  TwinEvent,
  CreateTwinRequest
} from '../types';

// ==================== Query Keys ====================

export const queryKeys = {
  // Dashboard
  dashboardStats: ['dashboard', 'stats'] as const,
  
  // Twins
  twins: ['twins'] as const,
  twinsList: (params?: { page?: number; size?: number; type?: string }) => 
    [...queryKeys.twins, 'list', params] as const,
  twinDetail: (id: string) => [...queryKeys.twins, 'detail', id] as const,
  twinHistory: (id: string) => [...queryKeys.twins, 'history', id] as const,
  
  // Predictions
  predictions: ['predictions'] as const,
  predictionsList: (params?: { twinId?: string; type?: string }) => 
    [...queryKeys.predictions, 'list', params] as const,
  predictionDetail: (id: string) => [...queryKeys.predictions, 'detail', id] as const,
  
  // Anomalies
  anomalies: ['anomalies'] as const,
  anomaliesList: (params?: { twinId?: string; severity?: string; status?: string }) => 
    [...queryKeys.anomalies, 'list', params] as const,
  anomalyDetail: (id: string) => [...queryKeys.anomalies, 'detail', id] as const,
  
  // Actions
  actions: ['actions'] as const,
  actionsList: (params?: { twinId?: string; status?: string }) => 
    [...queryKeys.actions, 'list', params] as const,
  actionDetail: (id: string) => [...queryKeys.actions, 'detail', id] as const,
  
  // Events
  events: ['events'] as const,
  eventsList: (twinId: string) => [...queryKeys.events, 'list', twinId] as const,
};

// ==================== Dashboard Queries ====================

export function useDashboardStats(options?: Partial<UseQueryOptions<DashboardStats>>) {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: () => api.getDashboardStats(),
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // 30 seconds
    ...options,
  });
}

// ==================== Twin Queries ====================

export function useTwins(
  params?: { page?: number; size?: number; type?: string },
  options?: Partial<UseQueryOptions<TwinSnapshot[]>>
) {
  return useQuery({
    queryKey: queryKeys.twinsList(params),
    queryFn: () => api.getAllTwins(params?.type),
    staleTime: 5000,
    ...options,
  });
}

export function useTwinDetail(
  id: string,
  options?: Partial<UseQueryOptions<DigitalTwin>>
) {
  return useQuery({
    queryKey: queryKeys.twinDetail(id),
    queryFn: () => api.getTwinDetails(id),
    enabled: !!id,
    staleTime: 5000,
    ...options,
  });
}

export function useTwinHistory(
  id: string,
  options?: Partial<UseQueryOptions<TwinEvent[]>>
) {
  return useQuery({
    queryKey: queryKeys.twinHistory(id),
    queryFn: () => api.getRecentEvents(id),
    enabled: !!id,
    staleTime: 10000,
    ...options,
  });
}

// ==================== Twin Mutations ====================

export function useCreateTwin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTwinRequest) => api.createTwin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.twins });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}

export function useDeleteTwin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.deleteTwin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.twins });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}

// ==================== Prediction Queries ====================

export function usePredictions(
  params?: { twinId?: string; type?: string },
  options?: Partial<UseQueryOptions<Prediction[]>>
) {
  return useQuery({
    queryKey: queryKeys.predictionsList(params),
    queryFn: () => params?.twinId ? api.getPredictions(params.twinId) : api.getAllPredictions(),
    staleTime: 10000,
    ...options,
  });
}

// ==================== Anomaly Queries ====================

export function useAnomalies(
  params?: { twinId?: string; severity?: string; status?: string },
  options?: Partial<UseQueryOptions<Anomaly[]>>
) {
  return useQuery({
    queryKey: queryKeys.anomaliesList(params),
    queryFn: () => params?.twinId ? api.getAnomalies(params.twinId) : api.getAllAnomalies(params?.severity),
    staleTime: 5000,
    refetchInterval: 15000, // Refresh every 15s for active monitoring
    ...options,
  });
}

// ==================== Anomaly Mutations ====================

export function useResolveAnomaly() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) => 
      api.resolveAnomaly(id, resolution),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.anomalyDetail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.anomalies });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}

// ==================== Action Queries ====================

export function useActions(
  params?: { twinId?: string; status?: string },
  options?: Partial<UseQueryOptions<Action[]>>
) {
  return useQuery({
    queryKey: queryKeys.actionsList(params),
    queryFn: () => params?.twinId ? api.getActions(params.twinId) : api.getAllActions(params?.status),
    staleTime: 5000,
    ...options,
  });
}

// ==================== Action Mutations ====================

export function useCancelAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.cancelAction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionDetail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.actions });
    },
  });
}

export function useTriggerAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ twinId, actionType, parameters }: { twinId: string; actionType: string; parameters: Record<string, unknown> }) => 
      api.triggerAction(twinId, actionType, parameters),
    onSuccess: (_, { twinId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.twinDetail(twinId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.actions });
    },
  });
}

// ==================== Event Mutations ====================

export function useSendEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (event: Partial<TwinEvent>) => api.sendEvent(event),
    onSuccess: (_, event) => {
      if (event.twinId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.twinDetail(event.twinId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.twinHistory(event.twinId) });
      }
    },
  });
}

// ==================== Prefetch Helpers ====================

export function usePrefetchTwin() {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.twinDetail(id),
      queryFn: () => api.getTwinDetails(id),
      staleTime: 5000,
    });
  };
}

export function usePrefetchAnomalyDetail() {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.anomalyDetail(id),
      queryFn: () => api.getAllAnomalies(),
      staleTime: 5000,
    });
  };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

// Properties — cache 5 min (sinkronizohet me Redis backend)
export function useProperties(page = 0, size = 12) {
  return useQuery({
    queryKey: ["properties", page, size],
    queryFn:  () => api.get(`/api/properties?page=${page}&size=${size}`).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

// Dashboard stats — cache 10 min (sinkronizohet me Redis backend)
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn:  () => api.get("/api/admin/dashboard/stats").then(r => r.data),
    staleTime: 10 * 60 * 1000,
  });
}

// Notification unread count — cache 60 sekonda
export function useUnreadCount() {
  return useQuery({
    queryKey: ["unread-count"],
    queryFn:  () => api.get("/api/notifications/unread/count").then(r => r.data.unread_count),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000, // auto-refetch çdo 60 sek
  });
}

// Invalidate cache kur krijon/ndrysho pronë
export function useInvalidateProperties() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["properties"] });
}
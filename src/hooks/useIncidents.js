import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { incidentApi } from "../services/incidentService";

export const INCIDENT_KEYS = {
  nearby: (lat, lng) => ["incidents", "nearby", lat, lng],
  detail: (id) => ["incidents", "detail", id],
};

// ── Query: fetch nearby incidents ────────────────────────────────────────────
export function useNearbyIncidents(latitude, longitude) {
  return useQuery({
    queryKey: INCIDENT_KEYS.nearby(latitude, longitude),
    queryFn: () => incidentApi.getNearby(latitude, longitude),
    // Don't fire until we actually have coordinates
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 30, // treat as fresh for 30 seconds
  });
}

// ── Query: single incident ────────────────────────────────────────────────────
export function useIncident(id) {
  return useQuery({
    queryKey: INCIDENT_KEYS.detail(id),
    queryFn: () => incidentApi.getById(id),
    enabled: !!id,
  });
}

// ── Mutation: create incident ─────────────────────────────────────────────────
export function useCreateIncident(latitude, longitude) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incidentApi.create,
    onSuccess: (newIncident) => {
      // Prepend the new incident into the cache — no refetch needed
      queryClient.setQueryData(
        INCIDENT_KEYS.nearby(latitude, longitude),
        (prev) => (prev ? [newIncident, ...prev] : [newIncident]),
      );
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { incidentApi } from "../services/incidentService";

export const INCIDENT_KEYS = {
  all: ["incidents"],
  nearby: () => ["incidents", "nearby"],
  detail: (id) => ["incidents", "detail", id],
};

// ── Query: fetch nearby incidents ────────────────────────────────────────────
export function useNearbyIncidents() {
  return useQuery({
    queryKey: INCIDENT_KEYS.all,
    queryFn: () => incidentApi.getNearby(),
    staleTime: 1000 * 30,
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
      queryClient.invalidateQueries({
        queryKey: INCIDENT_KEYS.all,
      });
    },
  });
}

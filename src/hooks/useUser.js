import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../services/api";

export const USER_KEYS = {
  profile: ["user", "profile"],
};

export function useUser() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: USER_KEYS.profile,
    queryFn: userApi.getProfile,
  });

  const updateMutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (updated) => {
      // Update the cache directly — no need to refetch
      queryClient.setQueryData(USER_KEYS.profile, updated);
    },
  });

  return {
    user: user ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error?.message ?? null,
  };
}

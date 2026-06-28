import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../services/api";

// Keys used to identify queries in the cache
export const AUTH_KEYS = {
  currentUser: ["auth", "currentUser"],
};

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user, token }) => {
      localStorage.setItem("token", token);
      // Seed the cache with the user so no extra /me request is needed
      queryClient.setQueryData(AUTH_KEYS.currentUser, user);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ user, token }) => {
      localStorage.setItem("token", token);
      queryClient.setQueryData(AUTH_KEYS.currentUser, user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // Always clear regardless of server response
      localStorage.removeItem("token");
      queryClient.removeQueries(); // wipe the entire cache on logout
    },
  });
}

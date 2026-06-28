import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../services/api";
import {
  AUTH_KEYS,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from "../hooks/useAuthMutations";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  // This query runs once on mount and whenever the token exists
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUTH_KEYS.currentUser,
    queryFn: authApi.getCurrentUser,
    // Don't run the query if there's no token — avoids a pointless 401
    enabled: !!localStorage.getItem("token"),
    retry: false,
  });

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  const value = {
    user: user ?? null,
    isAuthenticated: !!user,

    // Loading — true during initial auth check OR during a mutation
    loading: isLoading || loginMutation.isPending || registerMutation.isPending,

    // Expose the mutation objects directly so components can read isPending, error, etc.
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error?.message ?? null,
    loginReset: loginMutation.reset,

    register: registerMutation.mutateAsync,
    registerError: registerMutation.error?.message ?? null,
    registerReset: registerMutation.reset,

    logout: logoutMutation.mutateAsync,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

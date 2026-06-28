import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
}

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Alert } from "./pages/Alert";
import { Nearby } from "./pages/Nearby";
import { IncidentDetail } from "./pages/IncidentDetail";
import { Profile } from "./pages/Profile";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Download } from "lucide-react";

export function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });

    window.addEventListener("appinstalled", () => {
      setShowInstall(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstall(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <AuthProvider>
      <Router>
        {showInstall && (
          <button
            onClick={handleInstall}
            className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all"
          >
            <Download className="w-5 h-5" />
            Installer
          </button>
        )}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Alert />} />
            <Route path="nearby" element={<Nearby />} />
            <Route path="nearby/:id" element={<IncidentDetail />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

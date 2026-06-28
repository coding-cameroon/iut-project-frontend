import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AlertTriangle, MapPin, User } from "lucide-react";

const navItems = [
  { path: "/", icon: AlertTriangle, label: "Signaler" },
  { path: "/nearby", icon: MapPin, label: "Live" },
  { path: "/profile", icon: User, label: "Profil" },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>

      {/* Tab bar — full-width bg, content constrained inside */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800">
        <div className="max-w-2xl mx-auto px-8 pt-3 pb-6 flex items-center justify-between">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                  active ? "text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    active ? "bg-slate-700" : ""
                  }`}
                >
                  <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span
                  className={`text-xs font-medium ${active ? "text-white" : ""}`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

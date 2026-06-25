import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, User } from 'lucide-react';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: <AlertTriangle className="w-7 h-7" />, label: 'Report' },
    { path: '/nearby', icon: <MapPin className="w-7 h-7" />, label: 'Live' },
    { path: '/profile', icon: <User className="w-7 h-7" />, label: 'You' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/60 px-8 pb-6 pt-3 z-40">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                location.pathname === item.path
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-2 rounded-full transition-all duration-300 ${
                location.pathname === item.path ? 'bg-blue-50' : ''
              }`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

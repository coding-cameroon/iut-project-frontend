import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MapPin, Globe, LogOut, Shield, AlertCircle, Phone, User as UserIcon, Camera, Mic, CheckCircle2, XCircle, Settings2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, x: 50, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function Profile() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const [permissions, setPermissions] = useState({
    camera: 'prompt',
    microphone: 'prompt',
    location: 'prompt',
    notifications: 'prompt'
  });

  const mockUser = {
    stats: {
      totalIncidents: 12,
      responseRate: 94,
      joinDate: new Date('2023-01-15')
    },
    history: [
      { id: 1, title: 'Accident signalé', type: 'ACCIDENT', timestamp: new Date('2025-05-10'), status: 'resolved' },
      { id: 2, title: 'Incendie', type: 'FIRE', timestamp: new Date('2025-04-28'), status: 'pending' },
      { id: 3, title: 'Activité suspecte', type: 'OTHER', timestamp: new Date('2025-04-15'), status: 'resolved' }
    ]
  };

  // Check permission status on mount
  useEffect(() => {
    const checkPermissions = async () => {
      const perms = {};
      
      // Camera
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const cameraPerm = await navigator.permissions.query({ name: 'camera' });
          perms.camera = cameraPerm.state;
        }
      } catch (e) { perms.camera = 'prompt'; }
      
      // Microphone
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const micPerm = await navigator.permissions.query({ name: 'microphone' });
          perms.microphone = micPerm.state;
        }
      } catch (e) { perms.microphone = 'prompt'; }
      
      // Geolocation
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const geoPerm = await navigator.permissions.query({ name: 'geolocation' });
          perms.location = geoPerm.state;
        }
      } catch (e) { perms.location = 'prompt'; }
      
      // Notifications
      try {
        if ('Notification' in window) {
          perms.notifications = Notification.permission;
        }
      } catch (e) { perms.notifications = 'prompt'; }
      
      setPermissions(perms);
    };
    
    checkPermissions();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const requestPermission = async (type) => {
    try {
      if (type === 'camera') {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setPermissions(p => ({ ...p, camera: 'granted' }));
      } else if (type === 'microphone') {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissions(p => ({ ...p, microphone: 'granted' }));
      } else if (type === 'location') {
        navigator.geolocation.getCurrentPosition(
          () => setPermissions(p => ({ ...p, location: 'granted' })),
          () => setPermissions(p => ({ ...p, location: 'denied' }))
        );
      } else if (type === 'notifications') {
        const result = await Notification.requestPermission();
        setPermissions(p => ({ ...p, notifications: result }));
      }
    } catch (err) {
      console.error(`Permission error for ${type}:`, err);
      setPermissions(p => ({ ...p, [type]: 'denied' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // Fallback to mock user if no real user
  const displayUser = user || {
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com'
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pb-32"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="px-6 pt-6">
        <motion.div variants={itemVariants} className="flex items-center gap-5 mb-10">
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/30"
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserIcon className="w-12 h-12 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{displayUser.name}</h2>
            <p className="text-gray-500">{displayUser.email}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mb-10">
          {[
            { value: mockUser.stats.totalIncidents, label: 'Rapports', color: 'text-blue-600' },
            { value: `${mockUser.stats.responseRate}%`, label: 'Réponse', color: 'text-green-600' },
            { value: new Date().getFullYear() - new Date(mockUser.stats.joinDate).getFullYear(), label: 'Années', color: 'text-purple-600' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="text-center p-5 bg-white rounded-2xl border border-gray-200"
            >
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="mb-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Activité récente</h3>
          <div className="space-y-3">
            {mockUser.history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 rounded-full">
                    {item.type === 'FIRE' ? (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    ) : item.type === 'ACCIDENT' ? (
                      <AlertCircle className="w-6 h-6 text-orange-500" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                  item.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.status === 'resolved' ? 'Résolu' : 'En cours'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Permissions
          </h3>
          <div className="space-y-3">
            {[
              { key: 'camera', icon: <Camera className="w-6 h-6" />, label: 'Appareil photo' },
              { key: 'microphone', icon: <Mic className="w-6 h-6" />, label: 'Microphone' },
              { key: 'location', icon: <MapPin className="w-6 h-6" />, label: 'Localisation' },
              { key: 'notifications', icon: <Bell className="w-6 h-6" />, label: 'Notifications' }
            ].map((perm, index) => (
              <motion.div
                key={perm.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    permissions[perm.key] === 'granted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {perm.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{perm.label}</p>
                    <p className={`text-xs ${
                      permissions[perm.key] === 'granted' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {permissions[perm.key] === 'granted' ? 'Autorisé' : 'Refusé'}
                    </p>
                  </div>
                </div>
                {permissions[perm.key] === 'granted' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <button
                    onClick={() => requestPermission(perm.key)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Autoriser
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Paramètres</h3>
          <div className="space-y-2">
            {[
              { icon: <Globe className="w-6 h-6 text-gray-700" />, label: 'Langue' },
              { icon: <Phone className="w-6 h-6 text-gray-700" />, label: 'Contacts d\'urgence' },
              { icon: <Shield className="w-6 h-6 text-gray-700" />, label: 'Confidentialité' }
            ].map((setting, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  {setting.icon}
                  <span className="font-medium text-gray-900">{setting.label}</span>
                </div>
                <span className="text-gray-400">›</span>
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 transition-all duration-200 text-red-600 mt-4"
            >
              <div className="flex items-center gap-4">
                <LogOut className="w-6 h-6" />
                <span className="font-semibold">Se déconnecter</span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

import { useState } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { motion } from 'framer-motion';
import { MapPin, Clock, CheckCircle2, Flame, Car, ShieldAlert, HeartPulse, AlertCircle, Plus, Users, Building2, Zap, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const incidentColors = {
  ACCIDENT: { border: 'border-l-orange-500', bg: 'bg-orange-50', icon: <Car className="w-6 h-6 text-orange-600" /> },
  FIRE: { border: 'border-l-red-500', bg: 'bg-red-50', icon: <Flame className="w-6 h-6 text-red-600" /> },
  MEDICAL_EMERGENCY: { border: 'border-l-pink-500', bg: 'bg-pink-50', icon: <HeartPulse className="w-6 h-6 text-pink-600" /> },
  SECURITY_INCIDENT: { border: 'border-l-purple-500', bg: 'bg-purple-50', icon: <ShieldAlert className="w-6 h-6 text-purple-600" /> },
  POWER_OUTAGE: { border: 'border-l-yellow-500', bg: 'bg-yellow-50', icon: <Zap className="w-6 h-6 text-yellow-600" /> },
  BUILDING_ISSUE: { border: 'border-l-blue-500', bg: 'bg-blue-50', icon: <Building2 className="w-6 h-6 text-blue-600" /> },
  OTHER: { border: 'border-l-gray-500', bg: 'bg-gray-50', icon: <AlertCircle className="w-6 h-6 text-gray-600" /> }
};

const severityBadges = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-orange-100 text-orange-700',
  HIGH: 'bg-red-100 text-red-700',
  CRITICAL: 'bg-red-200 text-red-800'
};

const priorityLabels = {
  LOW: 'Faible',
  MEDIUM: 'Moyenne',
  HIGH: 'Élevée',
  CRITICAL: 'Critique'
};

const formatTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${days}j`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  },
  exit: { opacity: 0, x: 50, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function Nearby() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const { incidents, loading } = useIncidents();

  const mockIncidents = [
    { 
      id: 1, 
      type: 'ACCIDENT', 
      title: 'Accident de voiture', 
      description: 'Collision entre deux véhicules sur l\'avenue principale', 
      distance: 0.3, 
      timestamp: new Date(Date.now() - 1000 * 60 * 5), 
      priority: 'CRITICAL',
      reports: 12,
      verified: true
    },
    { 
      id: 2, 
      type: 'FIRE', 
      title: 'Incendie de poubelle', 
      description: 'Feu dans une poubelle près du parc', 
      distance: 0.8, 
      timestamp: new Date(Date.now() - 1000 * 60 * 25), 
      priority: 'MEDIUM',
      reports: 5,
      verified: true
    },
    { 
      id: 3, 
      type: 'MEDICAL_EMERGENCY', 
      title: 'Urgence médicale', 
      description: 'Personne au sol près du marché, SAMU en route', 
      distance: 1.1, 
      timestamp: new Date(Date.now() - 1000 * 60 * 45), 
      priority: 'HIGH',
      reports: 8,
      verified: true
    },
    { 
      id: 4, 
      type: 'POWER_OUTAGE', 
      title: 'Panne de courant', 
      description: 'Plusieurs quartiers sans électricité', 
      distance: 2.0, 
      timestamp: new Date(Date.now() - 1000 * 60 * 90), 
      priority: 'MEDIUM',
      reports: 24,
      verified: false
    },
    { 
      id: 5, 
      type: 'SECURITY_INCIDENT', 
      title: 'Vol signalé', 
      description: 'Vol de vélo dans le quartier', 
      distance: 0.5, 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), 
      priority: 'LOW',
      reports: 3,
      verified: false
    },
    { 
      id: 6, 
      type: 'OTHER', 
      title: 'Route bloquée', 
      description: 'Travaux sur la route nationale', 
      distance: 3.2, 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), 
      priority: 'LOW',
      reports: 15,
      verified: true
    }
  ];

  const filteredIncidents = filter === 'ALL' 
    ? mockIncidents 
    : mockIncidents.filter(i => i.priority === filter);

  if (loading) {
    return (
      <motion.div
        className="px-6 py-12 flex items-center justify-center h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-gray-500">Loading...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pb-32"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="px-6 pt-6">
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Alertes en direct</h1>
            <p className="text-gray-600 text-sm">Incidents à proximité</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40"
          >
            <Plus className="w-6 h-6 text-white" />
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { value: 'ALL', label: 'Toutes' },
            { value: 'CRITICAL', label: 'Critiques' },
            { value: 'HIGH', label: 'Élevées' },
            { value: 'MEDIUM', label: 'Moyennes' },
            { value: 'LOW', label: 'Faibles' }
          ].map((f, index) => (
            <motion.button
              key={f.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filter === f.value
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </motion.button>
          ))}
        </motion.div>
      </div>

      <div className="px-6 space-y-4">
        {filteredIncidents.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Tout est calme</h3>
            <p className="text-gray-500">Aucune alerte active à proximité</p>
          </motion.div>
        ) : (
          filteredIncidents.map((incident, index) => {
            const colors = incidentColors[incident.type] || incidentColors.OTHER;
            return (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden"
              >
                <div className={`h-2 ${colors.border.replace('border-l-', 'bg-')}`}></div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-3 rounded-2xl ${colors.bg}`}>
                          {colors.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-base">{incident.title}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">{incident.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {incident.distance.toFixed(1)} km
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {formatTime(incident.timestamp)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {incident.reports} rapports
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {incident.verified && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-xs font-semibold">Vérifié</span>
                            </div>
                          )}
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${severityBadges[incident.priority]}`}>
                            {priorityLabels[incident.priority]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

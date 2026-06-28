import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  CheckCircle2,
  Flame,
  Car,
  ShieldAlert,
  HeartPulse,
  AlertCircle,
  Plus,
  Users,
  Building2,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockIncidents = [
  {
    id: 1,
    type: "ACCIDENT",
    title: "Accident de voiture",
    description: "Collision entre deux véhicules sur l'avenue principale",
    distance: 0.3,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    priority: "CRITICAL",
    reports: 12,
    verified: true,
  },
  {
    id: 2,
    type: "FIRE",
    title: "Incendie de poubelle",
    description: "Feu dans une poubelle près du parc",
    distance: 0.8,
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    priority: "MEDIUM",
    reports: 5,
    verified: true,
  },
  {
    id: 3,
    type: "MEDICAL_EMERGENCY",
    title: "Urgence médicale",
    description: "Personne au sol près du marché, SAMU en route",
    distance: 1.1,
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    priority: "HIGH",
    reports: 8,
    verified: true,
  },
  {
    id: 4,
    type: "POWER_OUTAGE",
    title: "Panne de courant",
    description: "Plusieurs quartiers sans électricité",
    distance: 2.0,
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    priority: "MEDIUM",
    reports: 24,
    verified: false,
  },
  {
    id: 5,
    type: "SECURITY_INCIDENT",
    title: "Vol signalé",
    description: "Vol de vélo dans le quartier",
    distance: 0.5,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    priority: "LOW",
    reports: 3,
    verified: false,
  },
  {
    id: 6,
    type: "OTHER",
    title: "Route bloquée",
    description: "Travaux sur la route nationale",
    distance: 3.2,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    priority: "LOW",
    reports: 15,
    verified: true,
  },
];

const incidentConfig = {
  ACCIDENT: {
    accent: "#f97316",
    bg: "#fff7ed",
    iconBg: "#ffedd5",
    icon: Car,
  },
  FIRE: {
    accent: "#ef4444",
    bg: "#fef2f2",
    iconBg: "#fee2e2",
    icon: Flame,
  },
  MEDICAL_EMERGENCY: {
    accent: "#ec4899",
    bg: "#fdf2f8",
    iconBg: "#fce7f3",
    icon: HeartPulse,
  },
  SECURITY_INCIDENT: {
    accent: "#8b5cf6",
    bg: "#f5f3ff",
    iconBg: "#ede9fe",
    icon: ShieldAlert,
  },
  POWER_OUTAGE: {
    accent: "#eab308",
    bg: "#fefce8",
    iconBg: "#fef9c3",
    icon: Zap,
  },
  BUILDING_ISSUE: {
    accent: "#3b82f6",
    bg: "#eff6ff",
    iconBg: "#dbeafe",
    icon: Building2,
  },
  OTHER: {
    accent: "#6b7280",
    bg: "#f9fafb",
    iconBg: "#f3f4f6",
    icon: AlertCircle,
  },
};

const priorityConfig = {
  LOW: { label: "Faible", bg: "#f0fdf4", text: "#15803d", dot: "#22c55e" },
  MEDIUM: { label: "Moyenne", bg: "#fff7ed", text: "#c2410c", dot: "#f97316" },
  HIGH: { label: "Élevée", bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444" },
  CRITICAL: {
    label: "Critique",
    bg: "#fef2f2",
    text: "#7f1d1d",
    dot: "#dc2626",
  },
};

const filters = [
  { value: "ALL", label: "Toutes" },
  { value: "CRITICAL", label: "Critiques" },
  { value: "HIGH", label: "Élevées" },
  { value: "MEDIUM", label: "Moyennes" },
  { value: "LOW", label: "Faibles" },
];

const formatTime = (date) => {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${d}j`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  exit: { opacity: 0, x: 50, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

export function Nearby() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("ALL");

  const filtered =
    filter === "ALL"
      ? mockIncidents
      : mockIncidents.filter((i) => i.priority === filter);

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pb-32"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-8 pb-5 sticky top-0 z-20">
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-5"
        >
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
              En direct
            </p>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Alertes à proximité
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => navigate("/")}
            className="w-11 h-11 bg-red-500 rounded-2xl flex items-center justify-center shadow-md shadow-red-200"
          >
            <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
          </motion.button>
        </motion.div>

        {/* Filter pills */}
        <motion.div
          variants={itemVariants}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                filter === f.value
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Summary strip */}
      <motion.div variants={itemVariants} className="flex gap-3 px-5 pt-5 pb-1">
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {mockIncidents.length}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Incidents</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-red-500">
            {
              mockIncidents.filter(
                (i) => i.priority === "CRITICAL" || i.priority === "HIGH",
              ).length
            }
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Urgents</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-blue-500">
            {mockIncidents.filter((i) => i.verified).length}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Vérifiés</p>
        </div>
      </motion.div>

      {/* Incident list */}
      <div className="px-5 pt-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-semibold text-gray-700">Tout est calme</p>
              <p className="text-sm text-gray-400 mt-1">Aucune alerte active</p>
            </motion.div>
          ) : (
            filtered.map((incident, index) => {
              const cfg = incidentConfig[incident.type] || incidentConfig.OTHER;
              const pCfg = priorityConfig[incident.priority];
              const Icon = cfg.icon;

              return (
                <motion.div
                  key={incident.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{
                    delay: index * 0.04,
                    type: "spring",
                    stiffness: 300,
                    damping: 28,
                  }}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer active:scale-99 transition-shadow hover:shadow-md hover:shadow-gray-100"
                  style={{ borderLeftWidth: 3, borderLeftColor: cfg.accent }}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: cfg.iconBg }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: cfg.accent }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">
                            {incident.title}
                          </h3>
                          {/* Priority badge */}
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1"
                            style={{
                              backgroundColor: pCfg.bg,
                              color: pCfg.text,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full inline-block"
                              style={{ backgroundColor: pCfg.dot }}
                            />
                            {pCfg.label}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                          {incident.description}
                        </p>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="w-3.5 h-3.5" />
                            {incident.distance.toFixed(1)} km
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(incident.timestamp)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Users className="w-3.5 h-3.5" />
                            {incident.reports}
                          </span>
                          {incident.verified && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-blue-500 ml-auto">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Vérifié
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

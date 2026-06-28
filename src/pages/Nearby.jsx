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
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNearbyIncidents } from "../hooks/useIncidents";
import { useGeoLocation } from "../hooks/useGeoLocation";

const incidentConfig = {
  ACCIDENT: { accent: "#f97316", iconBg: "#ffedd5", icon: Car },
  FIRE: { accent: "#ef4444", iconBg: "#fee2e2", icon: Flame },
  MEDICAL_EMERGENCY: { accent: "#ec4899", iconBg: "#fce7f3", icon: HeartPulse },
  SECURITY_INCIDENT: {
    accent: "#8b5cf6",
    iconBg: "#ede9fe",
    icon: ShieldAlert,
  },
  POWER_OUTAGE: { accent: "#eab308", iconBg: "#fef9c3", icon: Zap },
  BUILDING_ISSUE: { accent: "#3b82f6", iconBg: "#dbeafe", icon: Building2 },
  OTHER: { accent: "#6b7280", iconBg: "#f3f4f6", icon: AlertCircle },
};

const priorityConfig = {
  LOW: {
    label: "Faible",
    dot: "#22c55e",
    text: "text-green-700",
    ring: "border-green-200  bg-green-50",
  },
  MEDIUM: {
    label: "Moyenne",
    dot: "#f97316",
    text: "text-orange-700",
    ring: "border-orange-200 bg-orange-50",
  },
  HIGH: {
    label: "Élevée",
    dot: "#ef4444",
    text: "text-red-700",
    ring: "border-red-200    bg-red-50",
  },
  CRITICAL: {
    label: "Critique",
    dot: "#dc2626",
    text: "text-red-900",
    ring: "border-red-300    bg-red-100",
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
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
};

function IncidentSkeleton() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-slate-800 rounded w-2/5" />
            <div className="h-5 bg-slate-800 rounded-full w-16" />
          </div>
          <div className="h-3 bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-800 rounded w-1/2" />
          <div className="flex gap-3 mt-2">
            <div className="h-3 bg-slate-800 rounded w-12" />
            <div className="h-3 bg-slate-800 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

function IncidentCard({ incident, index }) {
  const cfg = incidentConfig[incident.type] ?? incidentConfig.OTHER;
  const pCfg = priorityConfig[incident.priority] ?? priorityConfig.LOW;
  const Icon = cfg.icon;

  return (
    <motion.div
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
      className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden cursor-pointer hover:border-slate-700 hover:shadow-xl hover:shadow-black/30 transition-all"
      style={{ borderLeftWidth: 3, borderLeftColor: cfg.accent }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: cfg.iconBg + "22" }}
          >
            <Icon className="w-5 h-5" style={{ color: cfg.accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-white text-sm leading-snug truncate">
                {incident.title}
              </h3>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1 border ${pCfg.ring} ${pCfg.text}`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ backgroundColor: pCfg.dot }}
                />
                {pCfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
              {incident.description}
            </p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {incident.distance != null && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {Number(incident.distance).toFixed(1)} km
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(incident.createdAt ?? incident.timestamp)}
              </span>
              {incident.reports != null && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  {incident.reports}
                </span>
              )}
              {incident.verified && (
                <span className="flex items-center gap-1 text-xs font-semibold text-blue-400 ml-auto">
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
}

export function Nearby() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("ALL");

  const { location } = useGeoLocation();
  const {
    data: incidents = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useNearbyIncidents(location?.lat, location?.lng);

  const filtered =
    filter === "ALL"
      ? incidents
      : incidents.filter((i) => i.priority === filter);
  const urgent = incidents.filter(
    (i) => i.priority === "CRITICAL" || i.priority === "HIGH",
  ).length;
  const verified = incidents.filter((i) => i.verified).length;

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      {/* ── Sticky header — full width bg, constrained inner content ── */}
      <div className="bg-slate-950/80 backdrop-blur border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-5 pt-10 pb-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  En direct
                </p>
              </div>
              <h1 className="text-2xl font-bold text-white leading-tight">
                Alertes à proximité
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => refetch()}
                disabled={isFetching}
                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 text-slate-400 ${isFetching ? "animate-spin" : ""}`}
                />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => navigate("/")}
                className="w-10 h-10 bg-red-500 hover:bg-red-400 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 transition-colors"
              >
                <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  filter === f.value
                    ? "bg-white text-slate-900 border-white"
                    : "bg-transparent text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── All body content shares the same centered column ── */}
      <div className="max-w-2xl mx-auto px-5">
        {/* Stats strip */}
        <div className="flex gap-3 pt-5 pb-1">
          {[
            {
              value: isLoading ? "—" : incidents.length,
              label: "Incidents",
              color: "text-white",
            },
            {
              value: isLoading ? "—" : urgent,
              label: "Urgents",
              color: "text-red-400",
            },
            {
              value: isLoading ? "—" : verified,
              label: "Vérifiés",
              color: "text-blue-400",
            },
          ].map(({ value, label, color }) => (
            <div
              key={label}
              className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 px-4 py-3 text-center"
            >
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="pt-4 space-y-3">
          {isError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center"
            >
              <WifiOff className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="font-semibold text-red-300 text-sm">
                Impossible de charger les alertes
              </p>
              <p className="text-xs text-red-400/70 mt-1 mb-4">
                {error?.message}
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl text-sm font-medium transition-colors"
              >
                Réessayer
              </button>
            </motion.div>
          )}

          {isLoading && !isError && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <IncidentSkeleton key={i} />
              ))}
            </div>
          )}

          {!isLoading && !isError && (
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-20"
                >
                  <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="font-semibold text-slate-300">Tout est calme</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Aucune alerte active dans ce secteur
                  </p>
                </motion.div>
              ) : (
                filtered.map((incident, index) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    index={index}
                  />
                ))
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

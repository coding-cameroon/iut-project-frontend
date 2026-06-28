import { useParams, useNavigate } from "react-router-dom";
import { useIncident } from "../hooks/useIncidents";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  User,
  Phone,
  ShieldAlert,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

export function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: response, isLoading, isError } = useIncident(id);

  // Handle the nested structure from your API: { alert: { ... } }
  const incident = response?.alert;

  if (isLoading)
    return (
      <div className="p-10 text-center text-slate-500">
        Chargement des détails...
      </div>
    );
  if (isError || !incident)
    return (
      <div className="p-10 text-center text-red-500">Incident introuvable</div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-slate-950 pb-20"
    >
      <div className="max-w-2xl mx-auto px-5 pt-8 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>

        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {incident.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />{" "}
              {new Date(incident.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Lat: {incident.latitude.toFixed(4)}
              , Long: {incident.longitude.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <p className="text-slate-300 leading-relaxed mb-8">
            {incident.description}
          </p>

          <div className="grid grid-cols-2 gap-6 border-y border-slate-800 py-6 mb-6">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                Statut
              </p>
              <p className="text-white font-semibold mt-1">{incident.status}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                Priorité
              </p>
              <p className="text-orange-500 font-semibold mt-1">
                {incident.priority}
              </p>
            </div>
          </div>

          {/* User Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4" /> Signalé par
            </h3>
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
              <p className="text-white font-medium">
                {incident.user.firstName} {incident.user.lastName}
              </p>
              <div className="flex gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {incident.user.phone}
                </span>
              </div>
            </div>
          </div>

          {incident.isVerified && (
            <div className="mt-6 flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold text-sm">
                Incident vérifié par les autorités
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

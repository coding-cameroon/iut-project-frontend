import { useParams, useNavigate } from "react-router-dom";
import { useIncident } from "../hooks/useIncidents"; // Ensure this exists
import { ArrowLeft, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: incident, isLoading, isError } = useIncident(id);

  if (isLoading)
    return <div className="p-10 text-center text-slate-500">Chargement...</div>;
  if (isError || !incident)
    return (
      <div className="p-10 text-center text-red-500">Incident introuvable</div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-slate-950 pb-10"
    >
      <div className="max-w-2xl mx-auto px-5 pt-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            {incident.title}
          </h1>
          <p className="text-slate-400 leading-relaxed mb-6">
            {incident.description}
          </p>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">
                Statut
              </p>
              <p className="text-white font-medium">{incident.status}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">
                Priorité
              </p>
              <p className="text-orange-500 font-medium">{incident.priority}</p>
            </div>
          </div>

          {incident.isVerified && (
            <div className="mt-6 flex items-center gap-2 text-blue-400 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold text-sm">
                Incident Vérifié par les services
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

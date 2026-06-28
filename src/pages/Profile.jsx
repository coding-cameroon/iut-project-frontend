import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  MapPin,
  Globe,
  LogOut,
  Shield,
  AlertCircle,
  Phone,
  User as UserIcon,
  Camera,
  Mic,
  CheckCircle2,
  Settings2,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useIncidentByUserId } from "../hooks/useIncidents";

export function Profile() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const userId = user?.id;
  const { data: userIncidents = [], isLoading: userIncidentLoading } =
    useIncidentByUserId(userId);

  console.log(user?.id);
  const normalizedIncidents = userIncidents;

  console.log(JSON.stringify(normalizedIncidents, null, 2));

  const [permissions, setPermissions] = useState({
    camera: "prompt",
    microphone: "prompt",
    location: "prompt",
    notifications: "prompt",
  });

  const mockStats = {
    totalIncidents: 12,
    responseRate: 94,
    joinDate: new Date("2023-01-15"),
  };
  const mockHistory = [
    {
      id: 1,
      title: "Accident signalé",
      type: "ACCIDENT",
      timestamp: new Date("2025-05-10"),
      status: "resolved",
    },
    {
      id: 2,
      title: "Incendie",
      type: "FIRE",
      timestamp: new Date("2025-04-28"),
      status: "pending",
    },
    {
      id: 3,
      title: "Activité suspecte",
      type: "OTHER",
      timestamp: new Date("2025-04-15"),
      status: "resolved",
    },
  ];

  useEffect(() => {
    const check = async () => {
      const p = { ...permissions };
      const query = async (name) => {
        try {
          const r = await navigator.permissions?.query({ name });
          return r?.state ?? "prompt";
        } catch {
          return "prompt";
        }
      };
      p.camera = await query("camera");
      p.microphone = await query("microphone");
      p.location = await query("geolocation");
      p.notifications =
        "Notification" in window ? Notification.permission : "prompt";
      setPermissions(p);
    };
    check();
  }, []);

  const requestPermission = async (type) => {
    try {
      if (type === "camera") {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setPermissions((p) => ({ ...p, camera: "granted" }));
      } else if (type === "microphone") {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissions((p) => ({ ...p, microphone: "granted" }));
      } else if (type === "location") {
        navigator.geolocation.getCurrentPosition(
          () => setPermissions((p) => ({ ...p, location: "granted" })),
          () => setPermissions((p) => ({ ...p, location: "denied" })),
        );
      } else if (type === "notifications") {
        const result = await Notification.requestPermission();
        setPermissions((p) => ({ ...p, notifications: result }));
      }
    } catch {
      setPermissions((p) => ({ ...p, [type]: "denied" }));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  const displayUser = user
    ? {
        name:
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.name ||
          user.email,
        email: user.email || "",
      }
    : {
        name: "Jean Dupont",
        email: "jean.dupont@email.com",
      };
  const yearsActive =
    new Date().getFullYear() - new Date(mockStats.joinDate).getFullYear();

  const permItems = [
    { key: "camera", icon: Camera, label: "Appareil photo" },
    { key: "microphone", icon: Mic, label: "Microphone" },
    { key: "location", icon: MapPin, label: "Localisation" },
    { key: "notifications", icon: Bell, label: "Notifications" },
  ];

  const settingItems = [
    { icon: Globe, label: "Langue" },
    { icon: Phone, label: "Contacts d'urgence" },
    { icon: Shield, label: "Confidentialité" },
  ];

  const typeColor = {
    FIRE: "text-red-400",
    ACCIDENT: "text-orange-400",
    OTHER: "text-slate-400",
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      <div className="max-w-2xl mx-auto px-5">
        {/* ── Avatar + name ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 pt-10 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 flex-shrink-0"
          >
            <UserIcon className="w-10 h-10 text-white" />
          </motion.div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white truncate">
              {displayUser.name}
            </h2>
            <p className="text-slate-400 text-sm truncate">
              {displayUser.email}
            </p>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            {
              value: mockStats.totalIncidents,
              label: "Rapports",
              color: "text-blue-400",
            },
            {
              value: `${mockStats.responseRate}%`,
              label: "Réponse",
              color: "text-green-400",
            },
            { value: yearsActive, label: "Années", color: "text-purple-400" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              className="text-center p-4 bg-slate-900 rounded-2xl border border-slate-800"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Recent activity ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Activité récente
          </h3>
          <div className="space-y-2">
            {/*  */}
            {userIncidentLoading && <p>LOADING....</p>}

            {!userIncidentLoading &&
              normalizedIncidents.map((item, i) => {
                const incidentStatus =
                  item.status === "RESOLVED" || item.status === "resolved"
                    ? "resolved"
                    : "pending";
                const incidentDate =
                  item.createdAt || item.updatedAt || item.timestamp;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.05 }}
                    whileHover={{ x: 2 }}
                    className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle
                          className={`w-4 h-4 ${typeColor[item.type] ?? "text-slate-400"}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm truncate">
                          {item.title || "Incident"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {incidentDate
                            ? new Date(incidentDate).toLocaleDateString("fr-FR")
                            : "Date indisponible"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-3 ${
                        incidentStatus === "resolved"
                          ? "bg-green-500/15 text-green-400 border border-green-500/20"
                          : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                      }`}
                    >
                      {incidentStatus === "resolved" ? "Résolu" : "En cours"}
                    </span>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>

        {/* ── Permissions ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Permissions
          </h3>
          <div className="space-y-2">
            {permItems.map(({ key, icon: Icon, label }, i) => {
              const granted = permissions[key] === "granted";
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.17 + i * 0.04 }}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        granted ? "bg-green-500/15" : "bg-slate-800"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${granted ? "text-green-400" : "text-slate-400"}`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p
                        className={`text-xs ${granted ? "text-green-400" : "text-slate-500"}`}
                      >
                        {granted ? "Autorisé" : "Non autorisé"}
                      </p>
                    </div>
                  </div>
                  {granted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <button
                      onClick={() => requestPermission(key)}
                      className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Autoriser
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Settings ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Paramètres
          </h3>
          <div className="space-y-2">
            {settingItems.map(({ icon: Icon, label }, i) => (
              <motion.button
                key={i}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </motion.button>
            ))}

            {/* Logout — separated visually */}
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-2xl transition-all mt-4"
            >
              <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center">
                <LogOut className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-sm font-semibold text-red-400">
                Se déconnecter
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  AlertCircle,
  ArrowRight,
  Check,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ caractères", ok: password.length >= 8 },
    { label: "Majuscule", ok: /[A-Z]/.test(password) },
    { label: "Chiffre", ok: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-2 mt-2">
      {checks.map(({ label, ok }) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-green-400" : "bg-slate-600"}`}
          />
          <span
            className={`text-xs ${ok ? "text-green-400" : "text-slate-500"}`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        {children}
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-slate-900 border border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm";

export function Signup() {
  const navigate = useNavigate();
  const { register, registerError, registerReset, loading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState("");

  const displayError = registerError || localError;

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (localError) setLocalError("");
    if (registerError) registerReset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (formData.password.length < 8) {
      setLocalError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    try {
      const { confirmPassword, ...dataToSend } = formData;
      await register(dataToSend);
      navigate("/nearby");
    } catch {
      // handled by registerError
    }
  };

  const passwordsMatch =
    formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <span className="text-xl">🚨</span>
          </div>
          <span className="text-white font-bold text-xl">AlertApp</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Créez votre compte
            <br />
            <span className="text-blue-200">en 2 minutes.</span>
          </h2>
          <div className="space-y-3 mt-6">
            {[
              "Signalez des incidents en temps réel",
              "Recevez des alertes à proximité",
              "Contribuez à la sécurité locale",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-blue-100 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-sm">
          Déjà plus de{" "}
          <span className="text-white font-semibold">2 400 utilisateurs</span>{" "}
          nous font confiance.
        </p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🚨</span>
            </div>
            <span className="text-white font-bold text-xl">AlertApp</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Créer un compte
            </h1>
            <p className="text-slate-400">Rejoignez la communauté AlertApp</p>
          </div>

          <AnimatePresence>
            {displayError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 overflow-hidden"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{displayError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prénom" icon={User}>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  className={inputClass}
                  placeholder="Jean"
                  required
                />
              </Field>
              <Field label="Nom" icon={User}>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  className={inputClass}
                  placeholder="Dupont"
                  required
                />
              </Field>
            </div>

            <Field label="Adresse email" icon={Mail}>
              <input
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                className={inputClass}
                placeholder="jean@email.com"
                autoComplete="email"
                required
              />
            </Field>

            <Field label="Téléphone" icon={Phone}>
              <input
                type="tel"
                value={formData.phone}
                onChange={handleChange("phone")}
                className={inputClass}
                placeholder="698 75 43 21"
                required
              />
            </Field>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange("password")}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <PasswordStrength password={formData.password} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  className={`${inputClass} pr-12 ${
                    formData.confirmPassword
                      ? passwordsMatch
                        ? "border-green-500/50 focus:border-green-500"
                        : "border-red-500/50 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && (
                <p
                  className={`text-xs mt-1.5 ${passwordsMatch ? "text-green-400" : "text-red-400"}`}
                >
                  {passwordsMatch
                    ? "✓ Les mots de passe correspondent"
                    : "✗ Les mots de passe ne correspondent pas"}
                </p>
              )}
            </div>

            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-2 shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création du compte...
                </>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>

          <p className="text-slate-500 text-sm text-center mt-8">
            Déjà un compte?{" "}
            <Link
              to="/login"
              className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

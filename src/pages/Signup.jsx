import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Phone,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export function Signup() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Validation check
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      // Destructure to exclude confirmPassword from the request
      const { confirmPassword, ...dataToSend } = formData;

      await register(dataToSend);
      navigate("/nearby");
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full max-w-sm">
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-600/30">
            <span className="text-4xl font-bold text-white">🚨</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inscription</h1>
          <p className="text-gray-500">Créer votre compte</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Name */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Prénom
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                placeholder="Jean"
                required
              />
            </div>
          </motion.div>

          {/* Last Name */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                placeholder="Dupont"
                required
              />
            </div>
          </motion.div>

          {/* Email */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                placeholder="jean@email.com"
                required
              />
            </div>
          </motion.div>

          {/* Phone */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                placeholder="69875432"
                required
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-12 py-4 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Confirm Password */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-12 py-4 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-green-600/40 disabled:opacity-50 transition-all"
          >
            {loading ? "Inscription en cours..." : "Créer un compte"}
          </motion.button>
        </form>

        <motion.div variants={itemVariants} className="mt-8 text-center">
          <p className="text-gray-600">
            Déjà un compte?{" "}
            <Link to="/login" className="text-green-600 font-semibold">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

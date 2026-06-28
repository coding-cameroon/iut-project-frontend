import { useState, useRef, useEffect } from "react";
import { useGeoLocation } from "../hooks/useGeoLocation";
import { useCreateIncident } from "../hooks/useIncidents";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Mic,
  X,
  MapPin,
  ArrowLeft,
  Volume2,
  VolumeX,
  StopCircle,
  PlayCircle,
  Trash2,
  CheckCircle2,
  Send,
  FileText,
  AlertTriangle,
} from "lucide-react";

const severityLevels = [
  { value: 1, label: "Faible", color: "text-green-400", accent: "#22c55e" },
  { value: 2, label: "Moyenne", color: "text-yellow-400", accent: "#eab308" },
  { value: 3, label: "Élevée", color: "text-orange-400", accent: "#f97316" },
  { value: 4, label: "Critique", color: "text-red-400", accent: "#ef4444" },
];

const mediaTabs = [
  {
    value: "photo",
    label: "Photo",
    icon: Camera,
    activeColor: "border-blue-500   bg-blue-500/10   text-blue-400",
  },
  {
    value: "voice",
    label: "Voix",
    icon: Mic,
    activeColor: "border-red-500    bg-red-500/10    text-red-400",
  },
  {
    value: "text",
    label: "Texte",
    icon: FileText,
    activeColor: "border-purple-500 bg-purple-500/10 text-purple-400",
  },
];

export function Alert() {
  const navigate = useNavigate();

  const [mediaType, setMediaType] = useState("text");
  const [text, setText] = useState("");
  const [severity, setSeverity] = useState(2);
  const [volume, setVolume] = useState(50);
  const [success, setSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [photos, setPhotos] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const { location } = useGeoLocation();
  const createMutation = useCreateIncident(location?.lat, location?.lng);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      alert("Impossible d'accéder à la caméra");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    setPhotos((prev) => [...prev, canvas.toDataURL("image/jpeg", 0.8)]);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) =>
        audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedAudio(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(
        () => setRecordingTime((t) => t + 1),
        1000,
      );
    } catch {
      alert("Impossible d'accéder au microphone");
    }
  };

  const stopVoiceRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
    clearInterval(recordingTimerRef.current);
  };

  const deleteAudio = () => {
    setRecordedAudio(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  useEffect(() => {
    return () => {
      stopCamera();
      clearInterval(recordingTimerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const canSubmit =
    !createMutation.isPending &&
    (mediaType !== "text" || text.trim().length > 0) &&
    (mediaType !== "voice" || !!recordedAudio);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!canSubmit) return;
    const payload = {
      type: "OTHER",
      title:
        mediaType === "text"
          ? text.substring(0, 50) + (text.length > 50 ? "..." : "")
          : `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} Alert`,
      description: text || `${mediaType} alert submitted`,
      severity,
      location: {
        lat: location?.lat ?? 4.0511,
        lng: location?.lng ?? 9.7679,
        city: location?.city ?? "",
        region: location?.region ?? "",
        country: location?.country ?? "",
      },
      photos: mediaType === "photo" ? photos : [],
      isAnonymous: false,
    };
    try {
      await createMutation.mutateAsync(payload);
      setSuccess(true);
      setText("");
      setPhotos([]);
      deleteAudio();
      stopCamera();
      setMediaType("text");
      setSeverity(2);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      /* createMutation.error holds the message */
    }
  };

  const currentSeverity = severityLevels.find((l) => l.value === severity);

  return (
    <div className="min-h-screen bg-slate-950 pb-40">
      {/* ── Toasts — constrained to match content width ── */}
      <AnimatePresence>
        {success && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.9 }}
            className="fixed top-6 inset-x-0 z-50 flex justify-center px-5"
          >
            <div className="w-full max-w-2xl bg-slate-900 border border-green-500/40 rounded-2xl shadow-2xl shadow-black/50 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Alerte envoyée !</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Les autorités ont été notifiées
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {createMutation.isError && (
          <motion.div
            key="error-toast"
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            className="fixed top-6 inset-x-0 z-50 flex justify-center px-5"
          >
            <div className="w-full max-w-2xl bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl shadow-black/50 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">Échec de l'envoi</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {createMutation.error?.message}
                </p>
              </div>
              <button
                onClick={() => createMutation.reset()}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── All page content in one centered column ── */}
      <div className="max-w-2xl mx-auto px-5">
        {/* Header */}
        <div className="pt-10 pb-6">
          <button
            onClick={() => {
              stopCamera();
              navigate("/nearby");
            }}
            className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center mb-6 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <h1 className="text-2xl font-bold text-white mb-1">
            Signaler un incident
          </h1>
          <p className="text-slate-500 text-sm">
            Aidez votre communauté en signalant rapidement
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Media tabs */}
          <div className="grid grid-cols-3 gap-3">
            {mediaTabs.map(({ value, label, icon: Icon, activeColor }) => (
              <motion.button
                key={value}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  setMediaType(value);
                  if (value !== "photo") stopCamera();
                  if (value === "photo" && !cameraActive) startCamera();
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  mediaType === value
                    ? activeColor
                    : "border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700"
                }`}
              >
                {value === "voice" && isRecording ? (
                  <span className="text-base font-mono font-bold text-red-400">
                    {formatTime(recordingTime)}
                  </span>
                ) : (
                  <Icon className="w-6 h-6" />
                )}
                <span className="text-xs font-semibold">{label}</span>
              </motion.button>
            ))}
          </div>

          {/* Photo panel */}
          {mediaType === "photo" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4"
            >
              {cameraActive ? (
                <>
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
                    >
                      Fermer
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-14 h-14 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 transition-colors"
                    >
                      <Camera className="w-7 h-7 text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-10 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center gap-3 text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-all"
                >
                  <Camera className="w-10 h-10" />
                  <span className="text-sm font-medium">Ouvrir la caméra</span>
                </button>
              )}
              {photos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-3">
                    {photos.length} photo{photos.length > 1 ? "s" : ""} capturée
                    {photos.length > 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700"
                      >
                        <img
                          src={photo}
                          alt={`Capture ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPhotos((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                          className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Voice panel */}
          {mediaType === "voice" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-5"
            >
              {!recordedAudio ? (
                <div className="text-center py-4">
                  {!isRecording ? (
                    <>
                      <button
                        type="button"
                        onClick={startVoiceRecording}
                        className="w-20 h-20 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-red-500/30 transition-colors mb-3"
                      >
                        <Mic className="w-9 h-9 text-white" />
                      </button>
                      <p className="text-slate-500 text-sm">
                        Appuyez pour enregistrer
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-3xl font-mono font-bold text-red-400">
                          {formatTime(recordingTime)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="w-16 h-16 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center mx-auto transition-colors mb-3"
                      >
                        <StopCircle className="w-8 h-8 text-white" />
                      </button>
                      <p className="text-slate-500 text-sm">
                        Appuyez pour arrêter
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-800 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Enregistrement
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatTime(recordingTime)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={deleteAudio}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {audioUrl && (
                    <audio
                      src={audioUrl}
                      controls
                      className="w-full rounded-xl"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      deleteAudio();
                      startVoiceRecording();
                    }}
                    className="w-full py-2.5 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-400 text-sm font-medium hover:text-slate-300 transition-colors"
                  >
                    Réenregistrer
                  </button>
                </div>
              )}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                  <Volume2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-xs text-slate-500 w-8 text-right">
                    {volume}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Text panel */}
          {mediaType === "text" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-4"
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none text-sm"
                rows={6}
                placeholder="Décrivez l'incident en détail..."
              />
              <p className="text-xs text-slate-600 mt-2 text-right">
                {text.length} caractères
              </p>
            </motion.div>
          )}

          {/* Severity */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-slate-300">
                Gravité
              </label>
              <span className={`text-sm font-bold ${currentSeverity.color}`}>
                {currentSeverity.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-green-400 font-medium">Faible</span>
              <input
                type="range"
                min="1"
                max="4"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background:
                    "linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444)",
                  accentColor: currentSeverity.accent,
                }}
              />
              <span className="text-xs text-red-400 font-medium">Critique</span>
            </div>
            <div className="flex justify-between mt-3 px-0.5">
              {severityLevels.map((l) => (
                <div
                  key={l.value}
                  className={`w-2 h-2 rounded-full transition-all ${l.value <= severity ? "scale-125" : "opacity-30"}`}
                  style={{ backgroundColor: l.accent }}
                />
              ))}
            </div>
          </div>

          {/* Location */}
          {location && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-green-300 text-sm font-semibold">
                  Position active
                </p>
                <p className="text-green-500/70 text-xs">
                  {location.city ? `${location.city}, ` : ""}
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* ── Sticky submit — full-width bar, button constrained inside ── */}
      <div className="fixed bottom-20 inset-x-0 z-40 bg-slate-950/80 backdrop-blur border-t border-slate-800/50">
        <div className="max-w-2xl mx-auto px-5 pt-3 pb-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-red-500 hover:bg-red-400 disabled:bg-slate-800 disabled:text-slate-600 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-red-500/20 disabled:shadow-none transition-all"
          >
            {createMutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                ENVOYER L'ALERTE
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

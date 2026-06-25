import { useState, useRef, useEffect } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { useGeoLocation } from '../hooks/useGeoLocation';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Mic, X, MapPin, Upload, ArrowLeft, Volume2, VolumeX, StopCircle, PlayCircle, Trash2, CheckCircle2 } from 'lucide-react';

const severityLevels = [
  { value: 1, label: 'Faible' },
  { value: 2, label: 'Moyenne' },
  { value: 3, label: 'Élevée' },
  { value: 4, label: 'Critique' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function Alert() {
  const navigate = useNavigate();
  const [media, setMedia] = useState('text'); // 'photo', 'voice', 'text'
  const [text, setText] = useState('');
  const [severity, setSeverity] = useState(2);
  const [volume, setVolume] = useState(50);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [photos, setPhotos] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const { createIncident } = useIncidents();
  const { location } = useGeoLocation();

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Impossible d\'accéder à la caméra');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotos(prev => [...prev, photoDataUrl]);
    }
  };

  // Remove photo
  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Start voice recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Impossible d\'accéder au microphone');
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Delete recorded audio
  const deleteAudio = () => {
    setRecordedAudio(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (media === 'text' && !text.trim()) return;
    if (media === 'voice' && !recordedAudio) return;

    setSubmitting(true);
    try {
      // Clean payload for alert creation
      const payload = {
        mediaType: media, // 'photo', 'voice', 'text'
        title: media === 'text' 
          ? text.substring(0, 50) + (text.length > 50 ? '...' : '') 
          : `${media.charAt(0).toUpperCase() + media.slice(1)} Alert`,
        description: text || '',
        severity: severity, // 1: Faible, 2: Moyenne, 3: Élevée, 4: Critique
        location: {
          lat: location?.lat || 48.8566,
          lng: location?.lng || 2.3522,
          city: location?.city || '',
          region: location?.region || '',
          country: location?.country || ''
        },
        media: {
          photos: photos || [], // Array of Data URLs
          audio: recordedAudio ? await blobToBase64(recordedAudio) : null // Base64 string
        },
        timestamp: new Date().toISOString()
      };

      await createIncident(payload);
      setSuccess(true);
      
      // Reset form
      setText('');
      setPhotos([]);
      deleteAudio();
      stopCamera();
      setMedia('text');
      setSeverity(2);
      
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to create incident:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to convert Blob to Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pb-40"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed top-20 left-4 right-4 z-50"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Alerte envoyée!</h3>
              <p className="text-sm text-gray-500">Les autorités ont été prévenues</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="px-6 pt-6">
        <motion.div variants={itemVariants} className="mb-6">
          <button
            onClick={() => {
              stopCamera();
              navigate('/nearby');
            }}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </motion.div>

        <div className="mb-6">
          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Signaler un incident
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-gray-600"
          >
            Aidez votre communauté en signalant rapidement ce qui se passe
          </motion.p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6">
        <motion.div variants={itemVariants} className="mb-6">
          <div className="grid grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                setMedia('photo');
                if (!cameraActive) startCamera();
              }}
              className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                media === 'photo'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Camera className={`w-8 h-8 ${media === 'photo' ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-sm font-semibold ${media === 'photo' ? 'text-blue-700' : 'text-gray-700'}`}>Photo</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                setMedia('voice');
                stopCamera();
              }}
              className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                media === 'voice' || isRecording
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Mic className={`w-8 h-8 ${media === 'voice' || isRecording ? 'text-red-600' : 'text-gray-600'}`} />
              <span className={`text-sm font-semibold ${media === 'voice' || isRecording ? 'text-red-700' : 'text-gray-700'}`}>
                {isRecording ? formatTime(recordingTime) : 'Voix'}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                setMedia('text');
                stopCamera();
              }}
              className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                media === 'text'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center font-bold text-xl">
                Aa
              </div>
              <span className={`text-sm font-semibold ${media === 'text' ? 'text-purple-700' : 'text-gray-700'}`}>Texte</span>
            </motion.button>
          </div>
        </motion.div>

        {media === 'photo' && (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              {cameraActive ? (
                <div className="space-y-4">
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
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium"
                    >
                      Fermer
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center gap-3 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all"
                >
                  <Camera className="w-12 h-12" />
                  <span className="font-medium">Ouvrir la caméra</span>
                </button>
              )}

              {photos.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Photos capturées</h4>
                  <div className="flex flex-wrap gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                        <img src={photo} alt={`Capture ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {media === 'voice' && (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              {!recordedAudio ? (
                <div className="text-center py-6">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-red-500/40 mb-4"
                    >
                      <Mic className="w-10 h-10 text-white" />
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-4xl font-mono text-red-600">
                          {formatTime(recordingTime)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-gray-900/40"
                      >
                        <StopCircle className="w-10 h-10 text-white" />
                      </button>
                    </div>
                  )}
                  <p className="text-gray-500 text-sm">
                    {isRecording ? 'Appuyez pour arrêter' : 'Appuyez pour commencer l\'enregistrement'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">Enregistrement</p>
                          <p className="text-xs text-gray-500">{formatTime(recordingTime)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={deleteAudio}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    {audioUrl && (
                      <audio
                        src={audioUrl}
                        controls
                        className="w-full"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      deleteAudio();
                      startVoiceRecording();
                    }}
                    className="w-full py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Réenregistrer
                  </button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <Volume2 className="w-6 h-6 text-gray-600" />
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <VolumeX className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-600">Volume: {volume}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {media === 'text' && (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                rows={6}
                placeholder="Décrivez l'incident..."
              />
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <label className="block text-gray-700 text-sm font-semibold mb-4">
              Gravité
            </label>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-green-600">Faible</span>
              <div className="flex-1">
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 via-orange-200 to-red-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    accentColor: severity === 1 ? '#22c55e' : severity === 2 ? '#eab308' : severity === 3 ? '#f97316' : '#ef4444'
                  }}
                />
              </div>
              <span className="text-sm font-medium text-red-600">Critique</span>
            </div>
            <div className="text-center">
              <span className={`text-lg font-bold ${
                severity === 1 ? 'text-green-600' : severity === 2 ? 'text-yellow-600' : severity === 3 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {severityLevels.find(level => level.value === severity)?.label}
              </span>
            </div>
          </div>
        </motion.div>

        {location && (
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-green-700 text-sm font-semibold">Position active</p>
                <p className="text-green-600 text-xs">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="fixed bottom-24 left-0 right-0 bg-white border-t border-gray-200 px-6 pt-4 pb-4 z-40">
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={submitting || (media === 'text' && !text.trim()) || (media === 'voice' && !recordedAudio)}
            className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-red-600/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Envoi en cours...</span>
              </div>
            ) : (
              'ENVOYER L\'ALERTE'
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

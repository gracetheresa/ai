import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, X, Volume2, VolumeX } from "lucide-react";
import Markdown from "react-markdown";

interface Props {
  title: string;
  script: string;
  imageUrl: string;
  audioUrl: string;
  onClose: () => void;
}

export function MeditationPlayer({ title, script, imageUrl, audioUrl, onClose }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.addEventListener("timeupdate", () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    });
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const reset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Immersive Background */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt="Meditation Background"
          className="w-full h-full object-cover opacity-60 scale-105 blur-sm"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Atmospheric Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-0 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md"
        >
          <X className="w-6 h-6" />
        </button>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 tracking-tight">
            {title}
          </h1>
          <div className="w-24 h-px bg-white/30 mx-auto" />
        </motion.div>

        {/* Script Viewport */}
        <div className="w-full max-h-[40vh] overflow-y-auto mb-12 px-8 py-4 custom-scrollbar mask-fade">
          <div className="text-xl md:text-2xl font-serif text-white/70 leading-relaxed text-center italic">
            <Markdown>{script}</Markdown>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-[40px] p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={toggleMute}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center gap-8">
              <button
                onClick={reset}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              
              <button
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              <div className="w-10" /> {/* Spacer for balance */}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-white"
              animate={{ width: `${progress}%` }}
              transition={{ type: "tween", ease: "linear" }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .mask-fade {
          mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
      `}</style>
    </motion.div>
  );
}

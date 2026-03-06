import { useState } from "react";
import { SessionGenerator } from "./components/SessionGenerator";
import { MeditationPlayer } from "./components/MeditationPlayer";
import { ChatBot } from "./components/ChatBot";
import { generateMeditationScript, generateMeditationImage, generateMeditationVoice } from "./services/gemini";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Wind, Sun, Moon } from "lucide-react";

interface SessionData {
  title: string;
  script: string;
  imageUrl: string;
  audioUrl: string;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (theme: string, duration: number, imageSize: "1K" | "2K" | "4K") => {
    // Check for API key selection for gemini-3-pro-image-preview
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
      // Proceeding after opening dialog as per guidelines
    }

    setIsGenerating(true);
    setError(null);
    try {
      // 1. Generate Script
      const scriptData = await generateMeditationScript(theme, duration);
      
      // 2. Generate Image and Audio in parallel
      const [imageUrl, audioUrl] = await Promise.all([
        generateMeditationImage(scriptData.imagePrompt, imageSize),
        generateMeditationVoice(scriptData.content)
      ]);

      setCurrentSession({
        title: scriptData.title,
        script: scriptData.content,
        imageUrl,
        audioUrl
      });
    } catch (err) {
      console.error("Generation error:", err);
      setError("Something went wrong while crafting your session. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full blur-[100px] opacity-50" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-50" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-8 py-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="text-2xl font-serif font-semibold tracking-tight">ZenFlow</span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-gray-500">
          <div className="flex items-center gap-1"><Wind className="w-4 h-4" /> Breathe</div>
          <div className="flex items-center gap-1"><Sun className="w-4 h-4" /> Focus</div>
          <div className="flex items-center gap-1"><Moon className="w-4 h-4" /> Sleep</div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-serif font-light mb-6 tracking-tight"
          >
            Find your <span className="italic text-emerald-600">inner peace</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto"
          >
            Personalized guided meditations powered by AI. Crafted for your unique journey.
          </motion.p>
        </div>

        <SessionGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-red-50 text-red-600 rounded-2xl text-center border border-red-100 max-w-2xl mx-auto"
          >
            {error}
          </motion.div>
        )}

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Personalized", desc: "Every session is generated specifically for your current state of mind.", icon: Wind },
            { title: "Immersive", desc: "High-quality visuals and calming voiceovers create a deep meditative state.", icon: Sun },
            { title: "Accessible", desc: "Mindfulness tools available whenever you need them, wherever you are.", icon: Moon }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20"
            >
              <feature.icon className="w-8 h-8 text-emerald-600 mb-4" />
              <h3 className="text-xl font-serif font-medium mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {currentSession && (
          <MeditationPlayer
            title={currentSession.title}
            script={currentSession.script}
            imageUrl={currentSession.imageUrl}
            audioUrl={currentSession.audioUrl}
            onClose={() => setCurrentSession(null)}
          />
        )}
      </AnimatePresence>

      <ChatBot />

      <footer className="relative z-10 py-12 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} ZenFlow AI. Breathe deeply.</p>
      </footer>
    </div>
  );
}

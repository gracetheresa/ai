import React, { useState } from "react";
import { Sparkles, Clock, Image as ImageIcon, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onGenerate: (theme: string, duration: number, imageSize: "1K" | "2K" | "4K") => void;
  isGenerating: boolean;
}

export function SessionGenerator({ onGenerate, isGenerating }: Props) {
  const [theme, setTheme] = useState("");
  const [duration, setDuration] = useState(5);
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (theme.trim()) {
      onGenerate(theme, duration, imageSize);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-8 bg-white rounded-[32px] shadow-xl border border-black/5"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-medium">Create Your Space</h2>
          <p className="text-sm text-gray-500">Describe the atmosphere you wish to experience</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meditation Theme</label>
          <textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., A misty forest at dawn, deep ocean calmness, a warm sunset on a quiet beach..."
            className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all h-32 resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Duration (minutes)
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1m</span>
              <span className="font-medium text-emerald-600">{duration} minutes</span>
              <span>20m</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Visual Quality
            </label>
            <div className="flex gap-2">
              {(["1K", "2K", "4K"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setImageSize(size)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    imageSize === size
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Crafting your experience...
            </>
          ) : (
            "Begin Journey"
          )}
        </button>
      </form>
    </motion.div>
  );
}

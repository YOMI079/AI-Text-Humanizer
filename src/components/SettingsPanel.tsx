"use client";

import { HumanizationMode, HumanizationIntensity, AIProvider } from "@/lib/types";

interface SettingsPanelProps {
  mode: HumanizationMode;
  intensity: HumanizationIntensity;
  preserveKeyPoints: boolean;
  targetAudience: string;
  provider: AIProvider;
  onModeChange: (mode: HumanizationMode) => void;
  onIntensityChange: (intensity: HumanizationIntensity) => void;
  onPreserveKeyPointsChange: (preserve: boolean) => void;
  onTargetAudienceChange: (audience: string) => void;
  onProviderChange: (provider: AIProvider) => void;
  disabled?: boolean;
}

const MODES: { value: HumanizationMode; label: string; icon: string; description: string }[] = [
  { value: "casual", label: "Casual", icon: "💬", description: "Friendly, informal tone" },
  { value: "professional", label: "Professional", icon: "💼", description: "Business appropriate" },
  { value: "academic", label: "Academic", icon: "📚", description: "Scholarly style" },
  { value: "creative", label: "Creative", icon: "🎨", description: "Artistic expression" },
  { value: "conversational", label: "Conversational", icon: "☕", description: "Chat-like flow" },
];

const INTENSITIES: { value: HumanizationIntensity; label: string; description: string }[] = [
  { value: "light", label: "Light", description: "Subtle changes" },
  { value: "medium", label: "Medium", description: "Balanced transformation" },
  { value: "heavy", label: "Heavy", description: "Maximum humanization" },
];

const PROVIDERS: { value: AIProvider; label: string; icon: string; description: string }[] = [
  { value: "groq", label: "Groq", icon: "⚡", description: "LLaMA 3.3 70B - Fast & Powerful" },
  { value: "huggingface", label: "Hugging Face", icon: "🤗", description: "GPT-OSS 20B - Free" },
];

export default function SettingsPanel({
  mode,
  intensity,
  preserveKeyPoints,
  targetAudience,
  provider,
  onModeChange,
  onIntensityChange,
  onPreserveKeyPointsChange,
  onTargetAudienceChange,
  onProviderChange,
  disabled = false,
}: SettingsPanelProps) {
  return (
    <div className={`p-6 rounded-2xl bg-white/5 border border-white/10 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      {/* AI Provider Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
          AI Provider
        </h3>
        <div className="flex gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.value}
              onClick={() => onProviderChange(p.value)}
              className={`
                flex-1
                flex items-center justify-center gap-2
                px-4 py-3
                rounded-lg
                border
                transition-all
                ${provider === p.value 
                  ? "border-green-500/50 bg-green-500/10" 
                  : "border-white/10 bg-white/5 hover:bg-white/10"
                }
              `}
              title={p.description}
            >
              <span className="text-xl">{p.icon}</span>
              <div className="text-left">
                <div className="text-sm font-medium">{p.label}</div>
                <div className="text-xs text-white/50">{p.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
          Writing Mode
        </h3>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => onModeChange(m.value)}
              className={`
                mode-btn
                flex items-center gap-2
                px-4 py-2
                rounded-lg
                border
                transition-all
                ${mode === m.value 
                  ? "active border-primary-500/50 bg-primary-500/10" 
                  : "border-white/10 bg-white/5 hover:bg-white/10"
                }
              `}
              title={m.description}
            >
              <span>{m.icon}</span>
              <span className="text-sm font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
          Humanization Intensity
        </h3>
        <div className="flex gap-2">
          {INTENSITIES.map((i) => (
            <button
              key={i.value}
              onClick={() => onIntensityChange(i.value)}
              className={`
                flex-1
                px-4 py-3
                rounded-lg
                border
                transition-all
                ${intensity === i.value 
                  ? "border-accent-500/50 bg-accent-500/10" 
                  : "border-white/10 bg-white/5 hover:bg-white/10"
                }
              `}
            >
              <div className="text-sm font-medium">{i.label}</div>
              <div className="text-xs text-white/50 mt-1">{i.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div className="flex flex-wrap items-center gap-6">
        {/* Preserve Key Points Toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={preserveKeyPoints}
              onChange={(e) => onPreserveKeyPointsChange(e.target.checked)}
              className="sr-only"
            />
            <div className={`
              w-10 h-6 rounded-full transition-colors
              ${preserveKeyPoints ? "bg-primary-500" : "bg-white/20"}
            `}>
              <div className={`
                absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform
                ${preserveKeyPoints ? "translate-x-4" : "translate-x-0"}
              `} />
            </div>
          </div>
          <span className="text-sm text-white/70">Preserve Key Points</span>
        </label>

        {/* Target Audience */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => onTargetAudienceChange(e.target.value)}
            placeholder="Target audience (optional)"
            className="
              w-full
              px-4 py-2
              rounded-lg
              bg-white/5
              border border-white/10
              text-white/90
              placeholder-white/30
              text-sm
              focus:outline-none focus:border-primary-500/50
              transition-colors
            "
          />
        </div>
      </div>
    </div>
  );
}

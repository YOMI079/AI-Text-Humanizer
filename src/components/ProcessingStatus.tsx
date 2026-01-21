"use client";

import { ProcessingStatus as ProcessingStatusType } from "@/lib/types";

interface ProcessingStatusProps {
  status: ProcessingStatusType;
  currentAttempt: number;
  maxAttempts: number;
  currentScore: number | null;
  message: string;
}

export default function ProcessingStatus({
  status,
  currentAttempt,
  maxAttempts,
  currentScore,
  message,
}: ProcessingStatusProps) {
  if (status === "idle") return null;

  const getStatusColor = () => {
    switch (status) {
      case "deai":
        return "from-red-500 to-orange-500";
      case "humanizing":
        return "from-blue-500 to-cyan-500";
      case "verifying":
        return "from-yellow-500 to-orange-500";
      case "improving":
        return "from-purple-500 to-pink-500";
      case "completed":
        return currentScore && currentScore >= 0.75 
          ? "from-green-500 to-emerald-500" 
          : "from-yellow-500 to-orange-500";
      case "error":
        return "from-red-500 to-rose-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "deai":
        return "🧹";
      case "humanizing":
        return "✨";
      case "verifying":
        return "🔍";
      case "improving":
        return "🔄";
      case "completed":
        return currentScore && currentScore >= 0.75 ? "✅" : "⚠️";
      case "error":
        return "❌";
      default:
        return "⏳";
    }
  };

  const isProcessing = ["deai", "humanizing", "verifying", "improving"].includes(status);

  return (
    <div className="mt-8">
      <div className={`
        p-6 rounded-2xl
        bg-gradient-to-r ${getStatusColor()}
        bg-opacity-10
        border border-white/10
        backdrop-blur-sm
      `}>
        <div className="flex items-center gap-4">
          {/* Status Icon with Pulse */}
          <div className="relative">
            <span className="text-3xl">{getStatusIcon()}</span>
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getStatusColor()} opacity-30 pulse-ring`} />
              </div>
            )}
          </div>

          {/* Status Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-semibold text-white capitalize">
                {status === "deai" ? "Stripping AI Patterns" :
                 status === "humanizing" ? "Humanizing Text" :
                 status === "verifying" ? "Verifying Output" :
                 status === "improving" ? "Improving Result" :
                 status === "completed" ? "Processing Complete" :
                 status === "error" ? "Error Occurred" :
                 "Processing"}
              </span>
              
              {isProcessing && (
                <span className="text-sm text-white/60">
                  Attempt {currentAttempt} of {maxAttempts}
                </span>
              )}
            </div>
            
            <p className="text-sm text-white/70">{message}</p>
          </div>

          {/* Score Display */}
          {currentScore !== null && (
            <div className="text-right">
              <div className="text-sm text-white/60 mb-1">Humanness Score</div>
              <div className={`text-2xl font-bold ${
                currentScore >= 0.75 ? "text-green-400" : 
                currentScore >= 0.5 ? "text-yellow-400" : 
                "text-red-400"
              }`}>
                {(currentScore * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="mt-4">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getStatusColor()} transition-all duration-500`}
                style={{ 
                  width: `${(currentAttempt / maxAttempts) * 100}%`,
                  animation: "pulse 1.5s ease-in-out infinite"
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

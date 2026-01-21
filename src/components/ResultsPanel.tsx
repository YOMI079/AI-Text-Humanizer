"use client";

import { HumanizationResult } from "@/lib/types";

interface ResultsPanelProps {
  result: HumanizationResult;
  onFeedback: (feedback: "positive" | "negative") => void;
}

export default function ResultsPanel({ result, onFeedback }: ResultsPanelProps) {
  const scorePercentage = result.finalScore * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (result.finalScore * circumference);

  const getScoreColor = () => {
    if (result.finalScore >= 0.85) return "#22c55e";
    if (result.finalScore >= 0.75) return "#84cc16";
    if (result.finalScore >= 0.5) return "#eab308";
    return "#ef4444";
  };

  const getScoreLabel = () => {
    if (result.finalScore >= 0.85) return "Excellent";
    if (result.finalScore >= 0.75) return "Good";
    if (result.finalScore >= 0.5) return "Needs Work";
    return "Poor";
  };

  return (
    <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-lg font-semibold mb-6">Results Summary</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Circle */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/5">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              {/* Score circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                fill="none"
                stroke={getScoreColor()}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="score-ring"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: getScoreColor() }}>
                {scorePercentage.toFixed(0)}%
              </span>
              <span className="text-xs text-white/50">{getScoreLabel()}</span>
            </div>
          </div>
          <div className="mt-3 text-sm text-white/60">Humanness Score</div>
        </div>

        {/* Stats */}
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-primary-400">{result.attempts.length}</div>
            <div className="text-sm text-white/50">Total Attempts</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-accent-400">
              {(result.totalProcessingTime / 1000).toFixed(1)}s
            </div>
            <div className="text-sm text-white/50">Processing Time</div>
          </div>
        </div>

        {/* Attempt History */}
        <div className="p-4 rounded-xl bg-white/5">
          <div className="text-sm font-medium text-white/70 mb-3">Attempt Scores</div>
          <div className="space-y-2">
            {result.attempts.map((attempt, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs text-white/50 w-16">
                  Attempt {attempt.attemptNumber}
                </span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${attempt.verificationScore * 100}%`,
                      backgroundColor: attempt.passed ? "#22c55e" : "#ef4444"
                    }}
                  />
                </div>
                <span className={`text-xs font-medium ${
                  attempt.passed ? "text-green-400" : "text-red-400"
                }`}>
                  {(attempt.verificationScore * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white/70">Was this result helpful?</div>
            <div className="text-xs text-white/40 mt-1">Your feedback helps improve future results</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onFeedback("positive")}
              className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all"
            >
              👍 Yes
            </button>
            <button
              onClick={() => onFeedback("negative")}
              className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
            >
              👎 No
            </button>
          </div>
        </div>
      </div>

      {/* Mode Info */}
      <div className="mt-4 flex gap-2">
        <span className="px-3 py-1 rounded-full text-xs bg-primary-500/10 border border-primary-500/30 text-primary-400 capitalize">
          {result.mode} mode
        </span>
        <span className="px-3 py-1 rounded-full text-xs bg-accent-500/10 border border-accent-500/30 text-accent-400 capitalize">
          {result.intensity} intensity
        </span>
        <span className={`px-3 py-1 rounded-full text-xs ${
          result.success 
            ? "bg-green-500/10 border border-green-500/30 text-green-400"
            : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
        }`}>
          {result.success ? "✓ Passed Verification" : "Best Result Achieved"}
        </span>
      </div>
    </div>
  );
}

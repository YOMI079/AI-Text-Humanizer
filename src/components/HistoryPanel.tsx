"use client";

import { HistoryEntry } from "@/lib/types";

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onLoadEntry: (entry: HistoryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
  onUpdateFeedback: (id: string, feedback: "positive" | "negative" | null) => void;
}

export default function HistoryPanel({
  isOpen,
  onClose,
  history,
  onLoadEntry,
  onDeleteEntry,
  onClearAll,
  onUpdateFeedback,
}: HistoryPanelProps) {
  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-[#0a0a14] border-l border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">History</h2>
            <p className="text-sm text-white/50">{history.length} entries</p>
          </div>
          <div className="flex gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <div className="text-white/50">No history yet</div>
              <div className="text-sm text-white/30 mt-1">
                Your humanization history will appear here
              </div>
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="history-item p-4 rounded-xl bg-white/5 border border-white/10"
              >
                {/* Entry Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      entry.finalScore >= 0.75 
                        ? "bg-green-500/10 text-green-400" 
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {(entry.finalScore * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-white/40 capitalize">
                      {entry.mode}
                    </span>
                    <span className="text-xs text-white/40">•</span>
                    <span className="text-xs text-white/40 capitalize">
                      {entry.intensity}
                    </span>
                  </div>
                  <span className="text-xs text-white/40">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>

                {/* Original Text Preview */}
                <div className="mb-2">
                  <div className="text-xs text-white/40 mb-1">Original</div>
                  <div className="text-sm text-white/60 line-clamp-2">
                    {truncateText(entry.originalText, 120)}
                  </div>
                </div>

                {/* Humanized Text Preview */}
                <div className="mb-3">
                  <div className="text-xs text-white/40 mb-1">Humanized</div>
                  <div className="text-sm text-white/80 line-clamp-2">
                    {truncateText(entry.humanizedText, 120)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      onClick={() => onUpdateFeedback(entry.id, "positive")}
                      className={`p-1.5 rounded transition-all ${
                        entry.userFeedback === "positive"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/5 text-white/40 hover:text-green-400"
                      }`}
                      title="Good result"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => onUpdateFeedback(entry.id, "negative")}
                      className={`p-1.5 rounded transition-all ${
                        entry.userFeedback === "negative"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-white/5 text-white/40 hover:text-red-400"
                      }`}
                      title="Bad result"
                    >
                      👎
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onLoadEntry(entry)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-primary-500/10 border border-primary-500/30 text-primary-400 hover:bg-primary-500/20 transition-all"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white/50 hover:text-red-400 hover:border-red-500/30 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Attempts indicator */}
                <div className="mt-2 pt-2 border-t border-white/5">
                  <div className="text-xs text-white/30">
                    {entry.attempts} {entry.attempts === 1 ? "attempt" : "attempts"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-white/10 text-xs text-white/30">
          History helps the AI learn your writing style for better results
        </div>
      </div>
    </div>
  );
}

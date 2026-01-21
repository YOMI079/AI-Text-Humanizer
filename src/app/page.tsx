"use client";

import { useState, useEffect } from "react";
import { useAppStore, getHistoryTextsForLearning } from "@/lib/store";
import { HumanizationMode, HumanizationIntensity, HistoryEntry } from "@/lib/types";
import Header from "@/components/Header";
import TextEditor from "@/components/TextEditor";
import SettingsPanel from "@/components/SettingsPanel";
import ProcessingStatus from "@/components/ProcessingStatus";
import ResultsPanel from "@/components/ResultsPanel";
import HistoryPanel from "@/components/HistoryPanel";
import Footer from "@/components/Footer";

export default function Home() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const {
    inputText,
    outputText,
    mode,
    intensity,
    preserveKeyPoints,
    targetAudience,
    provider,
    status,
    currentAttempt,
    maxAttempts,
    currentScore,
    statusMessage,
    lastResult,
    history,
    setInputText,
    setOutputText,
    setMode,
    setIntensity,
    setPreserveKeyPoints,
    setTargetAudience,
    setProvider,
    updateProcessingStatus,
    setLastResult,
    addHistoryEntry,
    updateHistoryFeedback,
    deleteHistoryEntry,
    clearHistory,
    reset,
  } = useAppStore();

  // Handle humanization
  const handleHumanize = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to humanize");
      return;
    }

    if (inputText.trim().length < 10) {
      setError("Text must be at least 10 characters long");
      return;
    }

    setError(null);
    
    updateProcessingStatus({
      status: "humanizing",
      currentAttempt: 1,
      maxAttempts: 4,
      message: "Starting humanization process...",
    });

    try {
      // Get user history for learning
      const userHistory = getHistoryTextsForLearning();

      const response = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          mode,
          intensity,
          preserveKeyPoints,
          targetAudience: targetAudience || undefined,
          provider,
          userHistory,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Humanization failed");
      }

      setLastResult(data.data);

      // Add to history
      const historyEntry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalText: inputText,
        humanizedText: data.data.finalText,
        mode,
        intensity,
        finalScore: data.data.finalScore,
        attempts: data.data.attempts.length,
        createdAt: new Date(),
        userFeedback: null,
      };

      addHistoryEntry(historyEntry);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      updateProcessingStatus({
        status: "error",
        currentAttempt: 0,
        maxAttempts: 4,
        message: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  // Handle quick humanize (no verification)
  const handleQuickHumanize = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to humanize");
      return;
    }

    setError(null);
    
    updateProcessingStatus({
      status: "humanizing",
      currentAttempt: 1,
      maxAttempts: 1,
      message: "Quick humanization in progress...",
    });

    try {
      const response = await fetch("/api/quick-humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          mode,
          intensity,
          provider,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Quick humanization failed");
      }

      setOutputText(data.data.humanizedText);
      
      updateProcessingStatus({
        status: "completed",
        currentAttempt: 1,
        maxAttempts: 1,
        message: "Quick humanization complete (no verification)",
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      updateProcessingStatus({
        status: "error",
        currentAttempt: 0,
        maxAttempts: 1,
        message: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  // Handle verify only
  const handleVerifyOnly = async () => {
    if (!outputText.trim()) {
      setError("Please humanize text first or enter text to verify");
      return;
    }

    setError(null);
    
    updateProcessingStatus({
      status: "verifying",
      currentAttempt: 1,
      maxAttempts: 1,
      message: "Analyzing text for AI patterns...",
    });

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: outputText }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Verification failed");
      }

      updateProcessingStatus({
        status: "completed",
        currentAttempt: 1,
        maxAttempts: 1,
        currentScore: data.data.score,
        message: data.message,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      updateProcessingStatus({
        status: "error",
        currentAttempt: 0,
        maxAttempts: 1,
        message: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!outputText) return;
    
    try {
      await navigator.clipboard.writeText(outputText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  // Load history item
  const handleLoadHistory = (entry: HistoryEntry) => {
    setInputText(entry.originalText);
    setOutputText(entry.humanizedText);
    setMode(entry.mode);
    setIntensity(entry.intensity);
    setIsHistoryOpen(false);
  };

  return (
    <main className="min-h-screen pb-20">
      <Header onHistoryClick={() => setIsHistoryOpen(true)} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white/90">
                Original Text
              </h2>
              <span className="text-sm text-white/50">
                {inputText.length} characters | {inputText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <TextEditor
              value={inputText}
              onChange={setInputText}
              placeholder="Paste your AI-generated text here..."
              disabled={status === "humanizing" || status === "verifying" || status === "improving"}
            />
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white/90">
                Humanized Text
              </h2>
              <div className="flex items-center gap-3">
                {outputText && (
                  <button
                    onClick={handleCopy}
                    className={`text-sm px-3 py-1 rounded-lg transition-all ${
                      copySuccess 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                    }`}
                  >
                    {copySuccess ? "✓ Copied!" : "Copy"}
                  </button>
                )}
                <span className="text-sm text-white/50">
                  {outputText.length} characters | {outputText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>
            <TextEditor
              value={outputText}
              onChange={setOutputText}
              placeholder="Your humanized text will appear here..."
              readOnly={status === "humanizing" || status === "verifying" || status === "improving"}
            />
          </div>
        </div>

        {/* Settings Panel */}
        <SettingsPanel
          mode={mode}
          intensity={intensity}
          preserveKeyPoints={preserveKeyPoints}
          targetAudience={targetAudience}
          provider={provider}
          onModeChange={setMode}
          onIntensityChange={setIntensity}
          onPreserveKeyPointsChange={setPreserveKeyPoints}
          onTargetAudienceChange={setTargetAudience}
          onProviderChange={setProvider}
          disabled={status === "humanizing" || status === "verifying" || status === "improving"}
        />

        {/* Processing Status */}
        <ProcessingStatus
          status={status}
          currentAttempt={currentAttempt}
          maxAttempts={maxAttempts}
          currentScore={currentScore}
          message={statusMessage}
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <button
            onClick={handleHumanize}
            disabled={status === "humanizing" || status === "verifying" || status === "improving" || !inputText.trim()}
            className="glow-button px-8 py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              {status === "humanizing" || status === "improving" ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Humanizing...
                </>
              ) : (
                <>
                  ✨ Humanize with Verification
                </>
              )}
            </span>
          </button>

          <button
            onClick={handleQuickHumanize}
            disabled={status === "humanizing" || status === "verifying" || status === "improving" || !inputText.trim()}
            className="px-6 py-4 rounded-xl font-medium bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⚡ Quick Humanize
          </button>

          <button
            onClick={handleVerifyOnly}
            disabled={status === "humanizing" || status === "verifying" || status === "improving" || !outputText.trim()}
            className="px-6 py-4 rounded-xl font-medium bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔍 Verify Output
          </button>

          <button
            onClick={reset}
            disabled={status === "humanizing" || status === "verifying" || status === "improving"}
            className="px-6 py-4 rounded-xl font-medium bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 Reset
          </button>
        </div>

        {/* Results Panel */}
        {lastResult && status === "completed" && (
          <ResultsPanel
            result={lastResult}
            onFeedback={(feedback) => {
              if (history.length > 0) {
                updateHistoryFeedback(history[0].id, feedback);
              }
            }}
          />
        )}
      </div>

      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadEntry={handleLoadHistory}
        onDeleteEntry={deleteHistoryEntry}
        onClearAll={clearHistory}
        onUpdateFeedback={updateHistoryFeedback}
      />

      <Footer />
    </main>
  );
}

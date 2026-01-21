"use client";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-xl border-t border-white/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between text-sm text-white/40">
          <div className="flex items-center gap-4">
            <span>Powered by Gemini 2.5 Flash</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Verification Threshold: 75%</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Max 3 improvement attempts</span>
            <span className="hidden sm:inline">•</span>
            <a 
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

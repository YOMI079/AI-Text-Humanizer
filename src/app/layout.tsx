import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Text Humanizer - Transform AI Content Into Human Writing",
  description: "The most advanced AI text humanizer. Transform AI-generated content into natural, undetectable human writing that passes all AI detectors.",
  keywords: "AI humanizer, text humanizer, bypass AI detection, humanize AI text, AI content transformer",
  authors: [{ name: "AI Text Humanizer" }],
  openGraph: {
    title: "AI Text Humanizer - Transform AI Content Into Human Writing",
    description: "The most advanced AI text humanizer. Transform AI-generated content into natural, undetectable human writing.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Animated background particles */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
        
        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}

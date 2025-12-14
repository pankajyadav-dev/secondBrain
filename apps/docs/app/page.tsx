import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50 z-0" />

      <main className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-white/5 border border-white/10 backdrop-blur">
            <Brain size={48} className="text-primary" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
          Your Second Brain
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Capture thoughts, organize ideas, and unlock insights with an AI-powered personal knowledge base.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="group px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            Get Started
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-6 text-sm text-gray-600">
        Built with Next.js, MongoDB & Gemini
      </footer>
    </div>
  );
}

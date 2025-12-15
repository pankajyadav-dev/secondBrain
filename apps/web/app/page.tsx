import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-blue-900 text-foreground relative overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50 z-0" />

      <main className="relative z-10 text-center px-4 max-w-4xl mx-auto w-full">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="p-4 sm:p-5 rounded-full bg-white/5 border border-white/10 backdrop-blur">
            <Brain size={40} className="sm:w-12 sm:h-12 text-primary" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
          Your Second Brain
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
          Capture thoughts, organize ideas, and unlock insights with an AI-powered personal knowledge base.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <Link
            href="/signup"
            className="group w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
          >
            Sign In
          </Link>
        </div>
      </main>

    </div>
  );
}

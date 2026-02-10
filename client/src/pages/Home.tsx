import { Link } from "wouter";
import { Shield, ArrowRight, Activity, Lock, Cpu, Scan } from "lucide-react";
import { motion } from "framer-motion";

// Landing Page
export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-sans selection:bg-green-500/30">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Animated Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] animate-pulse-slow" />

      {/* Futuristic Radar Sweep */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-20 pointer-events-none z-0">
        <div className="absolute inset-0 rounded-full border border-green-500/10 shadow-[inner_0_0_50px_rgba(34,197,94,0.1)]" />
        <div className="absolute inset-[15%] rounded-full border border-green-500/10" />
        <div className="absolute inset-[30%] rounded-full border border-green-500/10" />
        <div className="absolute inset-[45%] rounded-full border border-green-500/10" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-transparent to-green-500/30 blur-sm"
        />

        {/* Scanning Beam */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent to-green-500 origin-left -translate-y-1/2 shadow-[0_0_15px_#22c55e]"
        />
      </div>

      {/* HUD Header */}
      <header className="relative z-10 w-full px-6 py-8 md:px-12 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-green-500/20 blur-md group-hover:bg-green-500/40 transition-all rounded-lg" />
            <div className="relative p-2.5 bg-zinc-900 border border-white/10 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <span className="block font-black tracking-[0.3em] uppercase text-sm">AUTONOMOUS</span>
            <span className="block text-[10px] text-zinc-500 tracking-[0.5em] uppercase font-mono">SHIELD_CORE_v4.2</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mb-1">NETWORK_STATUS</span>
            <div className="flex items-center gap-2 text-xs font-mono text-green-500 bg-green-500/5 px-4 py-1.5 rounded-full border border-green-500/20">
              <div className="relative">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 block" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping absolute inset-0" />
              </div>
              SECURE
            </div>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative max-w-5xl"
        >
          {/* Animated Accents */}
          <div className="absolute -top-20 -left-20 w-40 h-40 border-t border-l border-green-500/20 rounded-tl-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 border-b border-r border-green-500/20 rounded-br-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-3 mb-10 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em] backdrop-blur-md"
          >
            <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" />
            <span>Operational Efficiency: 99.99%</span>
          </motion.div>

          <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter text-white mb-8 leading-[0.85]">
            <span className="block overflow-hidden pb-2">INTELLIGENT</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">WATCHMAN</span>
          </h1>

          <p className="max-w-2xl mx-auto text-zinc-400 mb-16 text-lg md:text-xl font-light leading-relaxed tracking-tight group">
            Next-gen decentralized surveillance infrastructure with <span className="text-white font-medium border-b border-white/20 group-hover:border-green-500 transition-colors">real-time cognitive analysis</span> and autonomous threat mitigation protocols.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link href="/dashboard">
              <button className="group relative px-12 py-5 bg-white text-black font-black text-xs tracking-[0.2em] uppercase rounded-sm hover:scale-105 transition-all active:scale-95 overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative z-10 flex items-center gap-3">
                  Initialize Console
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                </span>
              </button>
            </Link>

            <button className="px-10 py-5 bg-transparent border border-white/10 text-white font-bold text-xs tracking-[0.2em] uppercase rounded-sm hover:bg-white/5 hover:border-white/30 transition-all">
              Documentation
            </button>
          </div>
        </motion.div>

        {/* Floating Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-40 w-full max-w-6xl px-6">
          {[
            { label: "Active Nodes", value: "24,801", icon: Cpu },
            { label: "Throughput", value: "4.2 Tbps", icon: Activity },
            { label: "Encryption", value: "Military", icon: Lock },
            { label: "Analysis", value: "AI-Gen", icon: Scan },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + (i * 0.1) }}
              className="p-6 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col items-center gap-2 hover:bg-white/[0.05] transition-colors"
            >
              <metric.icon className="h-5 w-5 text-zinc-500" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono">{metric.label}</span>
              <span className="text-xl font-bold text-white">{metric.value}</span>
            </motion.div>
          ))}
        </div>
      </main>

      {/* HUD Footer */}
      <footer className="relative z-10 w-full py-10 px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-mono border-t border-white/5 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
            <span>STAT_ENCRYPTED</span>
          </div>
        </div>

        <div className="text-center md:text-right">
          © 2026 SHIELD COMMAND. ALL RIGHTS RESERVED. // ACCESS_RESTRICTED
        </div>
      </footer>
    </div>
  );
}

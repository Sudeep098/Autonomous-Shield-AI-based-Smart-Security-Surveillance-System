import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Video,
  HardDrive,
  Settings,
  LogOut,
  Menu,
  X,
  Film,
  Map,
  Layers3,
  Brain,
  Shield,
  Eye,
  AlertTriangle,
  Database,
  FileText
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";


const navItems = [
  { href: "/system", label: "🛡️ Autonomous Shield", icon: Shield },
  { href: "/analytics", label: "Neural Analytics", icon: Brain },
  { href: "/tactical", label: "Tactical 3D", icon: Layers3 },
  { href: "/threats", label: "Threat Alerts", icon: AlertTriangle },
  { href: "/suspects", label: "Suspect Database", icon: Database },
  { href: "/alerts", label: "Alerts", icon: Eye },
  { href: "/devices", label: "Devices", icon: HardDrive },
  { href: "/logs", label: "Logs", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { sidebarOpen, toggleSidebar } = useStore();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-card border border-white/10 rounded-md text-white"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <AnimatePresence mode="wait">
        {(sidebarOpen || !isMobile) && (
          <motion.aside
            initial={{ x: isMobile ? -280 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-64 bg-black border-r border-white/5 flex flex-col",
              "md:relative md:translate-x-0"
            )}
          >
            {/* Header */}
            <div className="h-20 flex items-center px-6 border-b border-white/5 bg-zinc-950">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-red-500/20 blur-sm animate-pulse rounded" />
                <div className="relative w-10 h-10 bg-zinc-900 border border-white/10 rounded flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent" />
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div>
                <h1 className="font-black text-xs tracking-[0.3em] uppercase text-white leading-tight">AUTONOMOUS</h1>
                <p className="text-[10px] text-zinc-500 tracking-[0.2em] uppercase font-mono">SHIELD_SYS_v4</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 space-y-1.5 px-4 overflow-y-auto custom-scrollbar">
              <div className="text-[10px] text-zinc-600 font-black tracking-[0.2em] uppercase mb-4 px-3 flex items-center gap-2">
                <div className="w-1 h-3 bg-white/10 rounded-full" />
                COMMAND_CENTER
              </div>
              {navItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center px-4 py-3 rounded border transition-all duration-200 cursor-pointer group relative overflow-hidden",
                        isActive
                          ? "bg-white/10 border-white/20 text-white shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]"
                          : "text-zinc-500 border-transparent hover:bg-white/[0.03] hover:text-white hover:translate-x-1"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute left-0 w-1 h-1/2 bg-red-500 rounded-r shadow-[0_0_10px_#ef4444]"
                        />
                      )}
                      <Icon className={cn("mr-4 h-4.5 w-4.5 transition-colors", isActive ? "text-red-500" : "group-hover:text-red-400")} />
                      <span className="text-xs font-bold tracking-wider uppercase font-mono">{item.label}</span>

                      {/* Hover Scanline */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* System Load Visualization */}
            <div className="px-6 py-4 border-t border-white/5 bg-black/40">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">NODE_LOAD</span>
                <span className="text-[10px] text-green-500 font-mono">82%</span>
              </div>
              <div className="h-10 flex items-end gap-[2px]">
                {Array.from({ length: 24 }).map((_, i) => {
                  const height = Math.random() * 80 + 20;
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{
                        duration: 1,
                        delay: i * 0.05,
                        repeat: Infinity,
                        repeatType: "reverse",
                        repeatDelay: Math.random() * 2
                      }}
                      className={cn(
                        "flex-1 rounded-t-[1px]",
                        height > 70 ? "bg-red-500/40" : height > 40 ? "bg-orange-500/40" : "bg-green-500/40"
                      )}
                    />
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-zinc-950">
              <div className="flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white cursor-pointer rounded border border-transparent hover:border-white/10 hover:bg-white/5 transition-all mb-4" onClick={() => window.location.href = '/'}>
                <LogOut className="mr-3 h-4 w-4" />
                DISCONNECT
              </div>
              <div className="px-1 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-700 font-mono">CORE_VERSION</span>
                  <span className="text-[10px] text-zinc-400 font-mono font-bold">4.2.0-STABLE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-zinc-700 font-mono text-right">UPLINK</span>
                    <span className="text-[10px] text-green-500 font-mono font-bold">ESTABLISHED</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

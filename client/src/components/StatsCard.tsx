import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  alert?: boolean;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, alert }: StatsCardProps) {
  return (
    <div className={cn(
      "bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-5 relative overflow-hidden group transition-all duration-500",
      "hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:-translate-y-1",
      alert && "border-red-500/30 bg-red-950/10 hover:border-red-500/50"
    )}>
      {/* HUD Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />

      {/* Animated Scanline Shimmer */}
      <div className="absolute inset-x-0 h-[100%] bg-gradient-to-b from-transparent via-white/[0.03] to-transparent -translate-y-full group-hover:animate-[shimmer_3s_infinite] pointer-events-none" />

      {alert && (
        <div className="absolute top-3 right-3">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_10px_#ef4444]"></span>
          </span>
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] font-mono mb-1">{title}</p>
          <h3 className={cn(
            "text-3xl font-black tracking-tighter font-mono",
            alert ? "text-red-500" : "text-white"
          )}>{value}</h3>
        </div>
        <div className={cn(
          "p-3 rounded-lg transition-all duration-300",
          alert ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-white/5 text-zinc-400 group-hover:bg-white/10 group-hover:text-white border border-white/5"
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {trend && (
          <div className="flex items-center gap-2">
            <div className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-black font-mono flex items-center gap-1",
              trendUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {trendUp ? "↑" : "↓"} {trend}
            </div>
            <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">LATEST_CYCLE</span>
          </div>
        )}
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <div className="w-4 h-1.5 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}

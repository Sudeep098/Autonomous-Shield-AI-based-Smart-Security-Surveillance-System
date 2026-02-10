import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityScoreProps {
    score: number;
    className?: string;
}

export function SecurityScore({ score, className }: SecurityScoreProps) {
    // Calculate circle properties
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className={cn("relative flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden group", className)}>
            {/* Ambient Background Gradient */}
            <div className={cn(
                "absolute inset-0 opacity-10 blur-3xl transition-colors duration-1000",
                score >= 90 ? "bg-green-500" : score >= 70 ? "bg-yellow-500" : "bg-red-500"
            )} />

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20" />

            <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Secondary Rotating HUD Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-dashed border-white/10 rounded-full scale-[1.15]"
                />

                {/* Scanning Light Pulse */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none"
                />

                {/* Main Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="1"
                        fill="transparent"
                        className="text-white/5"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray="1 4"
                        fill="transparent"
                        className="text-white/5"
                    />

                    {/* Active Progress Circle */}
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        className={cn(
                            "transition-colors duration-1000",
                            score >= 90 ? "text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]" :
                                score >= 70 ? "text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)]" :
                                    "text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                        )}
                        style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
                    />
                </svg>

                {/* Center Text Info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        animate={{ opacity: [1, 0.8, 1] }}
                        transition={{ duration: 0.1, repeat: 3, delay: 2 }}
                        className={cn("text-4xl font-black font-mono tracking-tighter transition-colors duration-1000",
                            score >= 90 ? "text-green-500" :
                                score >= 70 ? "text-yellow-500" : "text-red-500"
                        )}
                    >
                        {score}%
                    </motion.span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-black -mt-1">SEC_INTEGRITY</span>
                </div>
            </div>

            {/* Bottom Status Tag */}
            <div className="absolute bottom-3 right-4 flex items-center gap-2">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] text-zinc-600 font-mono leading-none">CORE_HEARTBEAT</span>
                    <span className={cn("text-[9px] font-bold font-mono tracking-tighter",
                        score >= 90 ? "text-green-500" : score >= 70 ? "text-yellow-400" : "text-red-500"
                    )}>
                        {score >= 90 ? "OPTIMAL" : score >= 70 ? "DEGRADED" : "CRITICAL"}
                    </span>
                </div>
                {score >= 90 ? (
                    <ShieldCheck className="h-6 w-6 text-green-500" />
                ) : (
                    <ShieldAlert className="h-6 w-6 text-red-500 animate-pulse" />
                )}
            </div>
        </div>
    );
}

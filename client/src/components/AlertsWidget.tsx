import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Bell, CheckCircle, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert } from "@shared/schema";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AlertsWidget() {
    const { data: alerts, isLoading } = useQuery<Alert[]>({
        queryKey: ['alerts'],
        queryFn: async () => {
            const res = await fetch('/api/alerts');
            if (!res.ok) throw new Error('Failed to fetch alerts');
            return res.json();
        },
    });

    // Real-time alerts state to merge with polled alerts
    const [realtimeAlerts, setRealtimeAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        const handleNewAlert = (e: CustomEvent<Alert>) => {
            setRealtimeAlerts(prev => {
                // Deduplicate
                if (prev.find(a => a.id === e.detail.id)) return prev;
                return [e.detail, ...prev].slice(0, 10);
            });
        };

        window.addEventListener('new-alert' as any, handleNewAlert);
        return () => window.removeEventListener('new-alert' as any, handleNewAlert);
    }, []);

    // Merge and deduplicate
    const displayAlerts = useMemo(() => {
        const polled = alerts || [];
        const combined = [...realtimeAlerts, ...polled];
        // Deduplicate by ID
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        // Sort by timestamp desc
        return unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [alerts, realtimeAlerts]);

    const criticalCount = displayAlerts.filter(a => a.priority === 'HIGH' || a.priority === 'CRITICAL').length || 0;

    return (
        <div className="bg-neutral-900/50 border border-red-500/20 rounded-xl overflow-hidden flex flex-col h-full backdrop-blur-sm shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-red-500/20 bg-red-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Threat Stream</h3>
                </div>
                <div className="text-[10px] font-mono text-base-content/50">
                    {alerts?.length || 0} TOTAL / <span className="text-red-400">{criticalCount} CRIT</span>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full">
                    <div className="p-2 space-y-2">
                        {isLoading ? (
                            <div className="text-center p-4 text-xs text-zinc-500 animate-pulse">Scanning frequencies...</div>
                        ) : displayAlerts.length === 0 ? (
                            <div className="text-center p-4 text-xs text-zinc-500">No active threats detected.</div>
                        ) : (
                            displayAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={cn(
                                        "p-3 rounded-lg border flex items-start gap-3 transition-colors hover:bg-white/5",
                                        alert.priority === 'HIGH'
                                            ? "bg-red-950/10 border-red-500/30"
                                            : "bg-zinc-900/30 border-white/5"
                                    )}
                                >
                                    <div className={cn(
                                        "p-1.5 rounded-md shrink-0",
                                        alert.priority === 'HIGH' ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-400"
                                    )}>
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-wider",
                                                alert.priority === 'HIGH' ? "text-red-400" : "text-zinc-300"
                                            )}>
                                                {alert.title}
                                            </span>
                                            <span className="text-[9px] font-mono text-zinc-500">
                                                {format(new Date(alert.timestamp), 'HH:mm:ss')}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 leading-snug truncate">
                                            {alert.message || alert.type}
                                        </p>
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 bg-black/50 rounded text-[9px] font-mono text-zinc-500 uppercase">
                                                {alert.stationId || 'ZONE_A'}
                                            </span>
                                            {alert.type && (
                                                <span className="px-1.5 py-0.5 bg-red-500/10 rounded text-[9px] font-mono text-red-500 uppercase border border-red-500/20">
                                                    {alert.type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[5] bg-[length:100%_2px,3px_100%] opacity-20" />
            </div>
        </div>
    );
}

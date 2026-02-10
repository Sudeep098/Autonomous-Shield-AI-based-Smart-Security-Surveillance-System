import { Layout } from "@/components/Layout";
import { PageTransition } from "@/components/ui/PageTransition";
import { AlertTriangle, Clock, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useCameraStream } from "@/hooks/useCameraStream";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ThreatNotification {
    id: string;
    class: string;
    confidence: number;
    threat_level: 'critical' | 'suspicious' | 'normal';
    timestamp: string;
    detection_id: string;
}

export default function ThreatAlerts() {
    // Keep connection alive to receive threats
    useCameraStream('CAM_SRG_001', true);

    const [threatLog, setThreatLog] = useState<ThreatNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load historical suspects from MongoDB on mount
    useEffect(() => {
        const loadHistoricalSuspects = async () => {
            try {
                const response = await fetch('/api/suspects?limit=100');
                if (response.ok) {
                    const suspects = await response.json();
                    const formatted = suspects.map((s: any) => ({
                        id: s._id || s.id,
                        class: s.suspectName || 'UNKNOWN',
                        confidence: s.confidence / 100,
                        threat_level: s.threatLevel,
                        timestamp: s.detectedAt,
                        detection_id: s.detectionId
                    }));
                    setThreatLog(formatted);
                }
            } catch (error) {
                console.error('Failed to load historical suspects:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadHistoricalSuspects();
    }, []);

    useEffect(() => {
        const handleNewAlert = (e: CustomEvent<any>) => {
            const alert = e.detail;

            // Create threat notification with current timestamp
            const uniqueId = `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const threat: ThreatNotification = {
                id: uniqueId,
                class: alert.object || alert.type || 'UNKNOWN',
                confidence: parseFloat(alert.confidence) / 100 || 0,
                threat_level: alert.priority === 'CRITICAL' ? 'critical' : 'suspicious',
                timestamp: new Date().toISOString(), // Use current time
                detection_id: alert.detection_id || uniqueId
            };

            // Add all threats without deduplication - persist until refresh
            setThreatLog(prev => [threat, ...prev]);
        };

        window.addEventListener('new-alert' as any, handleNewAlert);
        return () => window.removeEventListener('new-alert' as any, handleNewAlert);
    }, []);

    return (
        <Layout>
            <PageTransition className="space-y-8 h-full flex flex-col">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10 relative">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-red-500/20 via-transparent to-transparent" />

                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500/20 blur-md animate-pulse" />
                                <div className="relative p-2.5 bg-zinc-900 border border-white/10 rounded">
                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-widest uppercase leading-none">THREAT_ALERTS</h1>
                                <p className="text-[10px] text-zinc-500 font-mono tracking-[0.4em] uppercase mt-2">CRITICAL_DETECTIONS // REAL_TIME</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-red-400 font-mono font-bold">{threatLog.length} THREATS</span>
                        </div>
                    </div>
                </div>

                {/* Threat Canvas */}
                <div className="flex-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col relative shadow-2xl overflow-hidden">
                    {/* HUD Accents */}
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />

                    {/* Header */}
                    <div className="bg-white/[0.03] px-6 py-4 border-b border-white/5 flex gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                            </div>
                            <div className="h-3 w-px bg-white/10 mx-2" />
                            <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">THREAT_MONITOR // AUTONOMOUS_SHIELD</span>
                        </div>
                        <div className="flex gap-4 text-[10px] uppercase font-black text-zinc-600 tracking-widest">
                            <span>STATUS: ACTIVE</span>
                        </div>
                    </div>

                    {/* Threat List */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {threatLog.length > 0 ? (
                            <div className="space-y-3">
                                <AnimatePresence initial={false}>
                                    {threatLog.map((threat, idx) => (
                                        <motion.div
                                            key={threat.id}
                                            layout
                                            initial={{ opacity: 0, x: -20, height: 0 }}
                                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className={cn(
                                                "p-4 rounded-lg border backdrop-blur-sm",
                                                threat.threat_level === 'critical'
                                                    ? "bg-red-500/10 border-red-500/30"
                                                    : "bg-yellow-500/10 border-yellow-500/30"
                                            )}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    {threat.threat_level === 'critical' && (
                                                        <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                                                    )}
                                                    {threat.threat_level === 'suspicious' && (
                                                        <Shield className="w-5 h-5 text-yellow-500" />
                                                    )}
                                                    <div>
                                                        <h3 className={cn(
                                                            "text-sm font-black uppercase tracking-wider",
                                                            threat.threat_level === 'critical' ? "text-red-400" : "text-yellow-400"
                                                        )}>
                                                            {threat.class}
                                                        </h3>
                                                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                                            Detection ID: {threat.detection_id.split('_').pop()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className={cn(
                                                        "text-xs font-bold font-mono mb-1",
                                                        threat.threat_level === 'critical' ? "text-red-500" : "text-yellow-500"
                                                    )}>
                                                        {(threat.confidence * 100).toFixed(1)}%
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                                        <Clock className="w-3 h-3" />
                                                        {format(new Date(threat.timestamp), 'HH:mm:ss')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={cn(
                                                "text-xs px-2 py-1 rounded inline-block font-mono",
                                                threat.threat_level === 'critical'
                                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                            )}>
                                                {threat.threat_level === 'critical' ? 'CRITICAL THREAT' : 'SUSPICIOUS ACTIVITY'}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <Shield className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                                    <p className="text-zinc-600 text-sm font-mono">No threats detected</p>
                                    <p className="text-zinc-700 text-xs mt-2">System is monitoring...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </PageTransition>
        </Layout>
    );
}

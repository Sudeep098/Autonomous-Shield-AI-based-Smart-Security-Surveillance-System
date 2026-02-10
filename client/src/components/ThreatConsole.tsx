import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Alert {
    alert_id: string;
    type: string;
    object: string;
    confidence: string;
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    description: string;
    timestamp: string;
    requires_action: boolean;
    acknowledged?: boolean;
}

interface ThreatConsoleProps {
    alerts: Alert[];
}

export function ThreatConsole({ alerts }: ThreatConsoleProps) {
    const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

    return (
        <div className="h-full bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black/60">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Threat Console
                    </h3>
                    <div className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-[10px] font-black text-red-400">
                        {unacknowledgedAlerts.length} ACTIVE
                    </div>
                </div>

                <p className="text-[9px] text-zinc-500 font-mono mt-2 uppercase tracking-widest">
                    Management by Exception - Critical Events Only
                </p>
            </div>

            {/* Alert List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <AnimatePresence mode="popLayout">
                    {alerts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center p-6"
                        >
                            <CheckCircle className="w-12 h-12 text-green-500/50 mb-4" />
                            <p className="text-sm font-mono text-zinc-500 uppercase tracking-wider">
                                No Active Threats
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-2">
                                All systems nominal
                            </p>
                        </motion.div>
                    ) : (
                        alerts.map((alert, index) => (
                            <ThreatAlertCard key={alert.alert_id} alert={alert} index={index} />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Stats */}
            <div className="p-3 border-t border-white/10 bg-black/60">
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div>
                        <span className="text-zinc-500">Total Alerts:</span>
                        <span className="text-white ml-2 font-bold">{alerts.length}</span>
                    </div>
                    <div>
                        <span className="text-zinc-500">Pending:</span>
                        <span className="text-red-400 ml-2 font-bold">{unacknowledgedAlerts.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ThreatAlertCard({ alert, index }: { alert: Alert; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                'mb-2 p-3 rounded-lg border backdrop-blur-sm relative overflow-hidden',
                alert.type === 'CRITICAL_THREAT'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
            )}
        >
            {/* Pulsing indicator for unacknowledged */}
            {!alert.acknowledged && (
                <motion.div
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-red-500/5"
                />
            )}

            <div className="relative">
                {/* Alert Header */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        </motion.div>
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">
                            {alert.type.replace('_', ' ')}
                        </span>
                    </div>

                    <div className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-mono text-white">
                        {alert.confidence}
                    </div>
                </div>

                {/* Alert Description */}
                <p className="text-xs text-white font-medium mb-2">
                    {alert.description}
                </p>

                {/* Metadata */}
                <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{alert.location}</span>
                        <span className="text-zinc-600">
                            ({alert.coordinates.lat.toFixed(4)}°, {alert.coordinates.lng.toFixed(4)}°)
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                </div>

                {/* Actions */}
                {alert.requires_action && !alert.acknowledged && (
                    <div className="mt-3 flex gap-2">
                        <button className="flex-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase rounded transition-colors">
                            Dispatch
                        </button>
                        <button className="flex-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase rounded transition-colors">
                            View Feed
                        </button>
                        <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 text-[10px] font-black uppercase rounded transition-colors">
                            <XCircle className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

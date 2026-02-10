import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Bell, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
    id: string;
    title: string;
    description: string;
    severity: string;
    timestamp: string;
}

interface AlertFeedProps {
    alerts: Alert[];
    onDismiss?: (id: string) => void;
    maxVisible?: number;
}

export function AlertFeed({ alerts, onDismiss, maxVisible = 3 }: AlertFeedProps) {
    const visibleAlerts = alerts.slice(0, maxVisible);

    if (visibleAlerts.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 w-80">
            <AnimatePresence>
                {visibleAlerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className={cn(
                            "relative p-4 rounded-lg border shadow-lg backdrop-blur-md",
                            alert.severity === 'critical'
                                ? "bg-red-500/20 border-red-500/50 shadow-red-500/20"
                                : "bg-yellow-500/20 border-yellow-500/50 shadow-yellow-500/20"
                        )}
                    >
                        {/* Pulse effect */}
                        <div className="absolute inset-0 rounded-lg bg-red-500/10 animate-ping" style={{ animationDuration: '2s' }} />

                        <div className="relative flex items-start gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                alert.severity === 'critical' ? "bg-red-500/30" : "bg-yellow-500/30"
                            )}>
                                <AlertTriangle className={cn(
                                    "w-5 h-5",
                                    alert.severity === 'critical' ? "text-red-400" : "text-yellow-400"
                                )} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                    "text-sm font-bold uppercase tracking-wider",
                                    alert.severity === 'critical' ? "text-red-400" : "text-yellow-400"
                                )}>
                                    {alert.title}
                                </h4>
                                <p className="text-xs text-white/70 mt-1 line-clamp-2">
                                    {alert.description}
                                </p>
                                <p className="text-[10px] text-white/40 mt-2 font-mono">
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                </p>
                            </div>

                            {onDismiss && (
                                <button
                                    onClick={() => onDismiss(alert.id)}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                    <X className="w-4 h-4 text-white/50" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {alerts.length > maxVisible && (
                <div className="text-center text-xs text-white/40 font-mono">
                    +{alerts.length - maxVisible} more alerts
                </div>
            )}
        </div>
    );
}

// Compact alert indicator for header
export function AlertIndicator({ count, onClick }: { count: number; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                count > 0
                    ? "bg-red-500/20 border border-red-500/50 hover:bg-red-500/30"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
            )}
        >
            <Bell className={cn(
                "w-4 h-4",
                count > 0 ? "text-red-400 animate-pulse" : "text-white/50"
            )} />
            <span className={cn(
                "text-xs font-bold",
                count > 0 ? "text-red-400" : "text-white/50"
            )}>
                {count}
            </span>

            {count > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
        </button>
    );
}

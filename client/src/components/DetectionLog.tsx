import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Clock, AlertTriangle, Terminal, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Detection {
    id: string;
    timestamp: string | Date;
    class: string;
    confidence: number;
    threat_level?: 'normal' | 'suspicious' | 'critical';
    bbox?: any;
    type?: string;
}

interface DetectionLogProps {
    detections: Detection[];
}

export function DetectionLog({ detections = [] }: DetectionLogProps) {
    const scrollRef = useRef<HTMLDivElement>(null);


    return (
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl border-l border-white/5 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                    <Scan className="w-4 h-4 text-green-500" />
                    <h3 className="text-xs font-black tracking-wider uppercase text-white">
                        AI_DETECTION_STREAM
                    </h3>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                    <span>YOLOv8-N INSTANCE_01</span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        LIVE
                    </span>
                </div>
            </div>

            {/* Log Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0 space-y-[1px]">
                <AnimatePresence initial={false}>
                    {detections.map((d) => (
                        <motion.div
                            key={d.id}
                            initial={{ opacity: 0, x: 20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0 }}
                            className="group flex flex-col p-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors relative"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide">
                                    {d.class}
                                </span>
                                <span className={cn(
                                    "text-[9px] font-mono font-bold",
                                    d.threat_level === 'critical' ? "text-red-500" :
                                        d.confidence > 0.9 ? "text-green-500" : "text-amber-500"
                                )}>
                                    {(d.confidence * 100).toFixed(1)}%
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5 text-[9px] text-zinc-600 font-mono">
                                    <Clock className="w-2.5 h-2.5" />
                                    {typeof d.timestamp === 'string' ? new Date(d.timestamp).toLocaleTimeString() : format(d.timestamp, 'HH:mm:ss.SSS')}
                                </div>
                                <Terminal className="w-2.5 h-2.5 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {detections.length === 0 && (
                    <div className="p-8 text-center text-zinc-600 text-[10px] font-mono animate-pulse">
                        AWAITING_INPUT_STREAM...
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BootScreenProps {
    onComplete: () => void;
}

const bootLogs = [
    "INITIALIZING_KERNEL_V3.0.4...",
    "LOADING_NEURAL_NETWORKS... [OK]",
    "ESTABLISHING_SECURE_UPLINK... [OK]",
    "CRYPTOGRAPHIC_HANDSHAKE_INITIATED...",
    "VERIFYING_BIOMETRIC_SIGNATURES...",
    "MOUNTING_VIRTUAL_VOLUMES...",
    "ALLOCATING_MEMORY_BLOCKS_0X4F... [OK]",
    "BYPASSING_FIREWALL_LAYER_7...",
    "SYSTEM_INTEGRITY_CHECK... NOMINAL",
    "ACCESS_GRANTED_WELCOME_COMMANDER"
];

export function BootScreen({ onComplete }: BootScreenProps) {
    const [logs, setLogs] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let logIndex = 0;
        const logInterval = setInterval(() => {
            if (logIndex < bootLogs.length) {
                setLogs(prev => [...prev, bootLogs[logIndex]]);
                logIndex++;
                setProgress(p => Math.min(p + 10, 100)); // Increment progress
            } else {
                clearInterval(logInterval);
                setTimeout(onComplete, 800); // 800ms delay after finish before unmount
            }
        }, 150); // Speed of log scrolling

        return () => clearInterval(logInterval);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono text-green-500 overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
        >
            <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
            <div className="absolute inset-0 crt-flicker pointer-events-none" />

            <div className="w-full max-w-2xl p-8 border border-green-500/30 bg-black/80 backdrop-blur-md relative">
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500" />

                <h1 className="text-4xl font-black mb-8 animate-pulse text-center tracking-[0.5em] glitch" data-text="SYSTEM_BOOT">
                    SYSTEM_BOOT
                </h1>

                <div className="h-48 overflow-y-auto custom-scrollbar flex flex-col-reverse mb-8 font-bold text-xs">
                    {/* Reverse column to keep newest at bottom visually if we mapped comfortably, but standard log feels better descending */}
                    <div className="flex flex-col gap-1">
                        {logs.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2"
                            >
                                <span className="text-green-500/50">[{new Date().toLocaleTimeString()}]</span>
                                <span className={log?.includes("ERROR") ? "text-red-500" : "text-green-400"}>
                                    {log}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-green-900/30 rounded-full overflow-hidden">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-green-500 shadow-[0_0_10px_#22c55e]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs uppercase tracking-widest text-green-500/70">
                    <span>Loading Modules...</span>
                    <span>{progress}%</span>
                </div>
            </div>
        </motion.div>
    );
}

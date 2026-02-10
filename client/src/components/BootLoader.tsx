import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Terminal, Shield, Cpu, Wifi } from "lucide-react";

export function BootLoader({ onComplete }: { onComplete?: () => void }) {
    const [step, setStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const bootSequence = [
        { text: "INITIALIZING_KERNEL_CORE...", delay: 200 },
        { text: "LOADING_SECURITY_MODULES...", delay: 500 },
        { text: "ESTABLISHING_SECURE_HANDSHAKE...", delay: 800 },
        { text: "VERIFYING_BIOMETRICS_DB...", delay: 1200 },
        { text: "MOUNTING_VIRTUAL_VOLUMES...", delay: 1500 },
        { text: "CONNECTING_TO_SATELLITE_LINK...", delay: 1900 },
        { text: "SYSTEM_READY", delay: 2200 }
    ];

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const runSequence = async () => {
            for (let i = 0; i < bootSequence.length; i++) {
                await new Promise(r => setTimeout(r, Math.random() * 300 + 100));
                setLogs(prev => [...prev, bootSequence[i].text]);
                setStep(i);
            }
            if (onComplete) setTimeout(onComplete, 800);
        };

        runSequence();

        return () => clearTimeout(timeout);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono cursor-none"
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            <div className="w-full max-w-md space-y-8 p-8 relative">
                {/* Central Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-xl animate-pulse" />
                        <Shield className="w-16 h-16 text-white" />
                    </div>
                    <h1 className="text-3xl font-black tracking-[0.5em] text-white uppercase text-center">
                        SKY<span className="text-green-500">WATCH</span>
                    </h1>
                </motion.div>

                {/* Loading Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                        <span>System_Boot</span>
                        <span>{Math.min(100, Math.round((step / (bootSequence.length - 1)) * 100))}%</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-green-500 shadow-[0_0_10px_#22c55e]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / (bootSequence.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Log Stream */}
                <div className="h-32 flex flex-col justify-end items-start overflow-hidden">
                    <AnimatePresence>
                        {logs.slice(-5).map((log, i) => (
                            <motion.p
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[10px] text-green-500/80 uppercase tracking-widest leading-relaxed before:content-['>'] before:mr-2 before:text-zinc-600"
                            >
                                {log}
                            </motion.p>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Background Grid */}
            <div className="absolute inset-0 z-[-1] opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #22c55e 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />
        </motion.div>
    );
}

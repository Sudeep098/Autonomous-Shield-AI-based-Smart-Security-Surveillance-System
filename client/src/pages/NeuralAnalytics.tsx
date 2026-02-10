import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { GlitchText } from "@/components/GlitchText";
import { Brain, Cpu, Activity, Zap, Network, Share2, ShieldCheck, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAIStats } from "@/hooks/useAIStats";

import { useState, useEffect } from "react";

// Mock data for initial state (and fallback)
const initialNeuralActivity = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    processing: 0,
    learning: 0,
    inference: 0,
}));

const performanceMetrics = [
    { subject: 'Object Detection', A: 120, B: 110, fullMark: 150 },
    { subject: 'Face Recognition', A: 98, B: 130, fullMark: 150 },
    { subject: 'Anomaly', A: 86, B: 130, fullMark: 150 },
    { subject: 'Tracking', A: 99, B: 100, fullMark: 150 },
    { subject: 'Classification', A: 85, B: 90, fullMark: 150 },
    { subject: 'Segmentation', A: 65, B: 85, fullMark: 150 },
];

export default function NeuralAnalytics() {
    const { currentDetections, fps } = useAIStats();
    const [telemetry, setTelemetry] = useState<any>(null);
    const [processingHistory, setProcessingHistory] = useState(initialNeuralActivity);

    // WebSocket Connection for Telemetry
    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;

        let ws: WebSocket | null = null;
        let retryInterval: any = null;

        const connect = () => {
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("✅ Connected to Telemetry Stream");
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setTelemetry(data);

                    // Update graph history
                    setProcessingHistory(prev => {
                        const newData = [...prev.slice(1), {
                            time: Date.now(),
                            processing: data.gpu?.gpu_load_percent || 0,
                            learning: data.memory?.memory_percent || 0,
                            inference: (data.ai?.inference_latency_ms || 0) * 2, // Scale for visibility
                        }];
                        return newData;
                    });
                } catch (e) {
                    console.error("Telemetry parse error", e);
                }
            };

            ws.onclose = () => {
                console.log("⚠️ Telemetry Disconnected - Retrying...");
                ws = null;
                // Auto-reconnect managed by retryInterval if needed, or simple timeout here
                setTimeout(connect, 2000);
            };
        };

        connect();

        return () => {
            if (ws) ws.close();
        };
    }, []);

    const cpu = telemetry?.cpu?.cpu_percent || 0;
    const gpu = telemetry?.gpu?.gpu_load_percent || 0;
    const memory = telemetry?.memory?.memory_percent || 0;
    const latency = telemetry?.ai?.inference_latency_ms || 0;
    const temp = telemetry?.gpu?.gpu_temp_c || 0;

    return (
        <Layout className="flex flex-col p-6 space-y-6 bg-black text-white">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between border-b border-white/10 pb-6"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                        <Brain className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-[0.2em] flex gap-3">
                            <GlitchText text="NEURAL" />
                            <span className="text-purple-500"><GlitchText text="ANALYTICS" /></span>
                        </h1>
                        <p className="text-xs text-zinc-500 font-mono tracking-widest mt-1">
                            AI_CORE_VERSION_4.2 // ONLINE
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-right">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Edge Device</div>
                        <div className="text-xl font-mono font-bold text-blue-500">{telemetry?.device_id || "SEARCHING..."}</div>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-right">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Active Threads</div>
                        <div className="text-xl font-mono font-bold text-purple-500">128</div>
                    </div>
                </div>
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* Column 1: Core Metrics */}
                <div className="space-y-6">
                    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-blue-400" />
                                Processing Load (GPU/NPU)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={processingHistory}>
                                        <defs>
                                            <linearGradient id="colorProcessing" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.2)' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="processing"
                                            stroke="#8884d8"
                                            fillOpacity={1}
                                            fill="url(#colorProcessing)"
                                            strokeWidth={2}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                            <CardContent className="pt-6">
                                <Activity className="w-8 h-8 text-green-500 mb-2" />
                                <div className="text-2xl font-bold font-mono">{gpu.toFixed(1)}%</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">GPU Load</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                            <CardContent className="pt-6">
                                <Zap className="w-8 h-8 text-yellow-500 mb-2" />
                                <div className="text-2xl font-bold font-mono">{latency.toFixed(1)}ms</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Inference Latency</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Column 2: Performance Radar */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-black/40 border-white/10 backdrop-blur-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Network className="w-4 h-4 text-purple-400" />
                                Model Performance Matrix
                            </CardTitle>
                            <CardDescription className="text-zinc-500 text-xs font-mono">
                                Comparative analysis of active neural models
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceMetrics}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Current Model"
                                        dataKey="A"
                                        stroke="#a855f7"
                                        strokeWidth={2}
                                        fill="#a855f7"
                                        fillOpacity={0.3}
                                    />
                                    <Radar
                                        name="Baseline"
                                        dataKey="B"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fill="#3b82f6"
                                        fillOpacity={0.1}
                                    />
                                    <Legend />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.2)' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Row: Active Detections & System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            Safety Protocol
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-green-500 font-mono text-sm">ACTIVE // ENFORCED</div>
                        <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-green-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5 }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Fingerprint className="w-4 h-4 text-blue-500" />
                            Identity Match
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-blue-500 font-mono text-sm">SCANNING...</div>
                        <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-500"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/10 backdrop-blur-sm lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Share2 className="w-4 h-4 text-zinc-500" />
                            Neural Network Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                            <span>EDGE_NODES_ACTIVE: 14</span>
                            <span>CLOUD_SYNC: <span className="text-green-500">CONNECTED</span></span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}

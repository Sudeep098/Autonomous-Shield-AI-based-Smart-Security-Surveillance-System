import { motion } from 'framer-motion';
import { Radar, Activity, Thermometer, Zap } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface SensorFusionProps {
    data: any; // { radar: [], seismic: {}, thermal: {} }
}

export function SensorFusion({ data }: SensorFusionProps) {
    if (!data) return null;

    const { radar, seismic, thermal } = data;

    // Format seismic data for chart
    const seismicData = seismic?.waveform?.map((v: number, i: number) => ({ v })) || [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {/* 1. Radar View */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-md relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-2 z-10 relative">
                    <Radar className="w-4 h-4 text-green-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        Radar Sweep
                    </h3>
                </div>

                <div className="relative aspect-square w-full max-w-[200px] mx-auto mt-2">
                    {/* Radar Grid */}
                    <div className="absolute inset-0 border rounded-full border-green-500/20" />
                    <div className="absolute inset-[25%] border rounded-full border-green-500/20" />
                    <div className="absolute inset-[50%] border rounded-full border-green-500/20" />
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-green-500/20" />
                    <div className="absolute inset-y-0 left-1/2 w-[1px] bg-green-500/20" />

                    {/* Sweep Animation */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 origin-center"
                    >
                        <div className="w-1/2 h-1/2 bg-gradient-to-tl from-green-500/50 to-transparent border-r-[1px] border-green-500/50 absolute top-0 left-0 origin-bottom-right rotate-90"
                            style={{ borderRadius: '100% 0 0 0' }}
                        />
                    </motion.div>

                    {/* Blips */}
                    {radar?.map((blip: any, i: number) => {
                        // Convert polar to cartesian for plotting (simplified)
                        const angleRad = (blip.angle - 90) * (Math.PI / 180);
                        const distNorm = Math.min(blip.distance / 500, 1) * 50; // 0-50%
                        const x = 50 + (Math.cos(angleRad) * distNorm);
                        const y = 50 + (Math.sin(angleRad) * distNorm);

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 1, scale: 1.5 }}
                                animate={{ opacity: 0, scale: 1 }}
                                transition={{ duration: 2 }}
                                className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
                                style={{ top: `${y}%`, left: `${x}%` }}
                            />
                        );
                    })}
                </div>
                <div className="absolute bottom-2 right-2 text-[9px] font-mono text-green-400">
                    Objects: {radar?.length || 0}
                </div>
            </div>

            {/* 2. Seismic Monitor */}
            <div className={`bg-black/40 border ${seismic?.status === 'CRITICAL' ? 'border-red-500/50 animate-pulse' : 'border-white/10'} rounded-xl p-4 backdrop-blur-md flex flex-col`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Activity className={`w-4 h-4 ${seismic?.status === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`} />
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">
                            Seismic Activity
                        </h3>
                    </div>
                    {seismic?.status === 'CRITICAL' && (
                        <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded animate-pulse font-bold">TUNNEL DETECTED</span>
                    )}
                </div>

                <div className="flex-1 min-h-[100px] w-full" style={{ minWidth: 0, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={seismicData}>
                            <defs>
                                <linearGradient id="colorSeismic" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={seismic?.status === 'CRITICAL' ? '#ef4444' : '#f59e0b'} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={seismic?.status === 'CRITICAL' ? '#ef4444' : '#f59e0b'} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <YAxis domain={[-2, 2]} hide />
                            <Area
                                type="monotone"
                                dataKey="v"
                                stroke={seismic?.status === 'CRITICAL' ? '#ef4444' : '#f59e0b'}
                                fill="url(#colorSeismic)"
                                strokeWidth={2}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-[9px] font-mono mt-2 text-zinc-400">
                    <span>MAG: {seismic?.magnitude}</span>
                    <span>DEPTH: {seismic?.depth ? `${seismic.depth.toFixed(1)}m` : 'N/A'}</span>
                </div>
            </div>

            {/* 3. Thermal Status */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        Thermal Matrix
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                    <div className="bg-white/5 rounded p-2 text-center">
                        <div className="text-2xl font-black text-white">{thermal?.max_temp_detected}°C</div>
                        <div className="text-[9px] text-zinc-500 uppercase">MAX TEMP</div>
                    </div>
                    <div className="bg-white/5 rounded p-2 text-center">
                        <div className="text-2xl font-black text-white">{thermal?.hotspots}</div>
                        <div className="text-[9px] text-zinc-500 uppercase">HOTSPOTS</div>
                    </div>
                </div>

                {/* Simulated Thermal Gradient Bar */}
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded mt-3 opacity-80" />
            </div>
        </div>
    );
}

import { Layout } from "@/components/Layout";
import { PageTransition } from "@/components/ui/PageTransition";
import { useState, useRef, useEffect } from "react";
import { Calendar, Play, Pause, SkipBack, SkipForward, Clock, Download, Share2, ZoomIn, ZoomOut, Film, Activity, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Playback() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(50); // percentage
    const [showExportModal, setShowExportModal] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Mock timeline events
    const events = [
        { time: 15, type: 'motion', label: 'Motion Detected' },
        { time: 45, type: 'alert', label: 'Person Identified' },
        { time: 80, type: 'motion', label: 'Vehicle Entry' },
    ];

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
        setCurrentTime(percent);
    };

    const jumpToEvent = (eventTime: number) => {
        setCurrentTime(eventTime);
        setIsPlaying(false);
    };

    // Simulate playback
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentTime(prev => (prev >= 100 ? 0 : prev + (0.1 * playbackSpeed)));
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed]);

    return (
        <Layout className="h-full flex flex-col p-6 bg-black overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #222 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/[0.02] to-transparent pointer-events-none" />

            <PageTransition className="flex-1 flex flex-col gap-6 relative z-10 h-full">
                {/* Header HUD */}
                <div className="flex justify-between items-end pb-8 border-b border-white/5 relative">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500/20 via-transparent to-transparent" />

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/20 blur-md animate-pulse" />
                            <div className="relative p-3 bg-zinc-900 border border-white/10 rounded-lg">
                                <Film className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-widest uppercase leading-none">ARCHIVE_VAULT</h1>
                            <p className="text-[10px] text-zinc-500 font-mono tracking-[0.4em] uppercase mt-2">ENCRYPTED_MEDIA_STREAM // GRID_S7</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 flex gap-2">
                            <button className="flex items-center gap-3 px-5 py-2 hover:bg-white/10 rounded-lg text-[10px] font-black font-mono text-zinc-400 hover:text-white transition-all uppercase tracking-widest">
                                <Calendar className="h-4 w-4" />
                                QUERY_DATE
                            </button>
                            <button
                                onClick={() => setShowExportModal(true)}
                                className="flex items-center gap-3 px-5 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-[10px] font-black font-mono text-purple-400 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                            >
                                <Download className="h-4 w-4" />
                                EXPORT_FRAG
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Player Area */}
                <div className="flex-1 grid grid-cols-4 gap-6 min-h-0">
                    <div className="col-span-3 bg-zinc-950 border border-white/10 rounded-2xl relative overflow-hidden group shadow-2xl flex flex-col">
                        {/* HUD Scanning Lines */}
                        <div className="absolute inset-0 pointer-events-none z-10 opacity-10 flex flex-col justify-between p-4">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className="h-px w-full bg-purple-500/20" />
                            ))}
                        </div>

                        {/* Video Content Placeholder */}
                        <div className="flex-1 bg-black flex flex-col items-center justify-center relative">
                            <motion.div
                                animate={{ opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="flex flex-col items-center gap-6"
                            >
                                <div className="p-8 border border-white/5 rounded-full relative">
                                    <div className="absolute inset-0 border border-dashed border-purple-500/20 rounded-full animate-spin-slow" />
                                    <Film className="h-16 w-16 text-zinc-800" />
                                </div>
                                <div className="text-center">
                                    <span className="text-[10px] text-zinc-600 font-mono tracking-[0.5em] uppercase block mb-2">STREAM_OFFLINE</span>
                                    <span className="text-2xl font-black text-zinc-800 font-mono">00:00:00:00</span>
                                </div>
                            </motion.div>

                            {/* HUD Viewfinder */}
                            <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-white/10 rounded-tl-xl" />
                            <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-white/10 rounded-tr-xl" />
                            <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-white/10 rounded-bl-xl" />
                            <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-white/10 rounded-br-xl" />
                        </div>

                        {/* Overlay Controls */}
                        <div className="absolute top-8 right-8 flex gap-3 z-20">
                            <div className="bg-black/80 backdrop-blur-xl px-4 py-1.5 rounded-lg border border-white/10 text-[9px] font-black font-mono text-white tracking-[0.2em] uppercase">
                                4K_UHD_MASTER
                            </div>
                            <div className="bg-purple-500/20 backdrop-blur-xl px-4 py-1.5 rounded-lg border border-purple-500/30 text-[9px] font-black font-mono text-purple-400 tracking-[0.2em] uppercase">
                                H.265_SECURE
                            </div>
                        </div>
                    </div>

                    {/* Metadata Sidebar */}
                    <div className="space-y-6 flex flex-col min-h-0">
                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-[2px] bg-gradient-to-l from-purple-500/40 to-transparent w-full h-[1px]" />
                            <h3 className="text-[10px] font-black text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-3">
                                <Activity className="h-4 w-4 text-purple-500" />
                                SEGMENT_INTEL
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Selected camera</p>
                                    <p className="text-xs font-black text-white uppercase tracking-tight">Main Gate Entrance - C04</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Storage Node</p>
                                    <p className="text-xs font-black text-purple-400 uppercase tracking-tight">VOL_ARC_P09 (NY_SEC)</p>
                                </div>
                                <div className="space-y-1 pt-4 border-t border-white/5">
                                    <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Motion events</p>
                                    <div className="flex gap-2 items-center mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <span className="text-xs font-bold text-white uppercase">12 DETECTIONS</span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <span className="text-xs font-bold text-white uppercase">2 CRIT_ALERTS</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col shadow-xl">
                            <h3 className="text-[10px] font-black text-white mb-6 uppercase tracking-[0.2em]">EVENT_MARKERS</h3>
                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                                {events.map((ev, i) => (
                                    <div
                                        key={i}
                                        onClick={() => jumpToEvent(ev.time)}
                                        className="p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:border-purple-500/30 hover:bg-purple-500/5 transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={cn("text-[9px] font-black uppercase tracking-widest transition-colors",
                                                ev.type === 'alert' ? "text-red-500" : "text-blue-500"
                                            )}>{ev.type}</span>
                                            <span className="text-[8px] font-mono text-zinc-600 group-hover:text-purple-400 transition-colors">12:30 PM</span>
                                        </div>
                                        <p className="text-[10px] text-white font-bold uppercase tracking-tight group-hover:text-purple-400 transition-colors">{ev.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline Controls */}
                <div className="h-44 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col p-6 shadow-[0_-10px_50px_rgba(0,0,0,0.5)] relative z-20">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

                    {/* Slider Area */}
                    <div
                        ref={timelineRef}
                        onClick={handleTimelineClick}
                        className="flex-1 relative mb-6 flex items-center bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden px-4 cursor-crosshair group/timeline"
                    >
                        <div className="absolute inset-x-0 h-full flex items-end pointer-events-none">
                            {/* Time Ticks */}
                            {Array.from({ length: 48 }).map((_, i) => (
                                <div key={i} className="flex-1 h-3 border-r border-white/5 relative group cursor-pointer hover:bg-white/5 transition-colors">
                                    {i % 4 === 0 && <span className="absolute -top-6 left-0 text-[8px] text-zinc-600 font-mono group-hover:text-white uppercase tracking-tighter transition-colors">{Math.floor(i / 2)}:00</span>}
                                </div>
                            ))}
                        </div>

                        {/* Events on Timeline */}
                        {events.map((ev, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.5 }}
                                className={cn("absolute w-1.5 h-10 rounded-full z-10 cursor-pointer shadow-xl transition-colors",
                                    ev.type === 'alert' ? "bg-red-500 top-2" : "bg-blue-500 top-4"
                                )}
                                style={{ left: `${ev.time}%` }}
                                title={ev.label}
                            />
                        ))}

                        {/* Scrubber */}
                        <motion.div
                            className="absolute top-0 bottom-0 w-0.5 bg-purple-500 z-20 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                            style={{ left: `${currentTime}%` }}
                            layout
                        >
                            <div className="absolute -top-2 -translate-x-1/2 w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-xl" />
                            <div className="absolute -bottom-4 -translate-x-1/2 px-2 py-1 bg-purple-500 text-[10px] font-black text-white rounded-lg shadow-2xl whitespace-nowrap opacity-100 group-hover/timeline:opacity-100 transition-opacity">
                                ARC_00:12:30:45
                            </div>
                        </motion.div>
                    </div>

                    {/* Control Bar */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-6">
                                <button className="text-zinc-500 hover:text-white transition-all transform hover:scale-110" onClick={() => setCurrentTime(t => Math.max(0, t - 5))}><SkipBack className="h-5 w-5" /></button>
                                <button
                                    className={cn("w-14 h-14 flex items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-xl group/btn",
                                        isPlaying ? "bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "bg-white text-black hover:bg-purple-500 hover:text-white"
                                    )}
                                    onClick={() => setIsPlaying(!isPlaying)}
                                >
                                    {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                                </button>
                                <button className="text-zinc-500 hover:text-white transition-all transform hover:scale-110" onClick={() => setCurrentTime(t => Math.min(100, t + 5))}><SkipForward className="h-5 w-5" /></button>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="flex flex-col items-end mr-4">
                                <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Playback speed</span>
                                <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                                    {[0.5, 1, 2, 4].map((speed) => (
                                        <button
                                            key={speed}
                                            onClick={() => setPlaybackSpeed(speed)}
                                            className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black font-mono transition-all",
                                                playbackSpeed === speed ? "bg-purple-500 text-white shadow-lg" : "text-zinc-500 hover:text-white"
                                            )}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="p-2 text-zinc-500 hover:text-white transition-colors"><ZoomOut className="h-5 w-5" /></button>
                                <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                                    <div className="absolute inset-0 bg-purple-500/20 w-1/2 h-full" />
                                    <div className="absolute top-0 left-[48%] w-1 h-full bg-white shadow-[0_0_10px_white]" />
                                </div>
                                <button className="p-2 text-zinc-500 hover:text-white transition-colors"><ZoomIn className="h-5 w-5" /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Modal */}
                <AnimatePresence>
                    {showExportModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowExportModal(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-zinc-950 border border-white/10 rounded-2xl p-8 max-w-md w-full relative z-10 shadow-2xl"
                            >
                                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2 flex items-center gap-3">
                                    <Download className="h-6 w-6 text-purple-500" />
                                    Export_Fragment
                                </h3>
                                <p className="text-xs text-zinc-500 font-mono mb-8">Select timeframe and compression ratio.</p>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Start Time</label>
                                            <div className="p-3 bg-black border border-white/10 rounded text-center font-mono text-sm text-white">12:30:00</div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">End Time</label>
                                            <div className="p-3 bg-black border border-white/10 rounded text-center font-mono text-sm text-white">12:35:00</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Format</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['MP4', 'MKV', 'RAW'].map(fmt => (
                                                <button key={fmt} className="py-2 border border-white/10 rounded hover:bg-white/5 hover:border-purple-500/50 transition-colors text-xs font-bold text-zinc-300">
                                                    {fmt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => { setShowExportModal(false); alert('Export initiated (Simulated)'); }}
                                        className="w-full py-4 bg-purple-500 text-white rounded-lg font-black uppercase tracking-[0.2em] hover:bg-purple-600 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                                    >
                                        Initiate_Export
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </PageTransition>
        </Layout>
    );
}

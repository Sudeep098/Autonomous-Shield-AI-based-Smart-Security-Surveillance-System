import { useState } from 'react';
import { useCameraStream } from '@/hooks/useCameraStream';
import { AIDetectionOverlay } from './AIDetectionOverlay';
import { Camera, Activity, Signal, SignalHigh } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Detection {
    id: string;
    class: string;
    confidence: number;
    bbox: { x: number; y: number; width: number; height: number };
    bbox_normalized?: number[];
    threat_level: 'normal' | 'suspicious' | 'critical';
    timestamp: string;
}

interface CameraFeedProps {
    cameraId: string;
    cameraName: string;
    isLive?: boolean;
    selected?: boolean;
    onSelect: () => void;
}

export function CameraFeed({ cameraId, cameraName, isLive = false, selected = false, onSelect }: CameraFeedProps) {
    const { detections, isConnected, fps } = useCameraStream(cameraId, isLive);

    const hasCritical = detections.some(d => d.threat_level === 'critical');

    return (
        <div
            onClick={onSelect}
            className={cn(
                "relative bg-black rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer group h-full",
                selected
                    ? "border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                    : hasCritical
                        ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                        : "border-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            )}
        >
            {/* Video Feed */}
            <div className="relative h-full w-full bg-neutral-950">
                {isLive ? (
                    <div className="relative w-full h-full">
                        {/* MJPEG Stream from AI Service */}
                        <img
                            src={`http://${window.location.hostname}:8000/api/ai/video_feed`}
                            className="w-full h-full object-cover"
                            alt="Live Feed"
                        />

                        {/* Detection Overlay */}
                        <AIDetectionOverlay
                            detections={detections}
                            isConnected={isConnected}
                        />

                        {/* Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.03)_2px,rgba(0,255,255,0.03)_4px)]" />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                                <Camera className="w-8 h-8 text-zinc-700" />
                            </div>
                            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Offline</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Top Status Bar */}
            <div className="absolute top-0 left-0 right-0 p-2 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                    {/* Connection Status */}
                    <div className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider",
                        isLive
                            ? isConnected
                                ? "bg-green-500/20 border border-green-500/30 text-green-400"
                                : "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400"
                            : "bg-zinc-800 border border-zinc-700 text-zinc-500"
                    )}>
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isLive && isConnected ? "bg-green-500 animate-pulse" : isLive ? "bg-yellow-500" : "bg-zinc-600"
                        )} />
                        {isLive ? (isConnected ? 'LIVE' : 'CONNECTING') : 'OFFLINE'}
                    </div>

                    {/* Camera ID */}
                    <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-md px-2 py-1">
                        <span className="text-[9px] font-mono text-cyan-400">{cameraId}</span>
                    </div>
                </div>

                {/* FPS Counter */}
                {isLive && isConnected && (
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-md px-2 py-1">
                        <SignalHigh className="w-3 h-3 text-cyan-400" />
                        <span className="text-[9px] font-mono text-white">{fps || '--'} FPS</span>
                    </div>
                )}
            </div>

            {/* Bottom Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-white font-semibold truncate">{cameraName}</p>
                        {isLive && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-zinc-500 font-mono">AI-ENABLED</span>
                                {detections.length > 0 && (
                                    <>
                                        <span className="text-[10px] text-zinc-600">•</span>
                                        <span className={cn(
                                            "text-[10px] font-bold",
                                            hasCritical ? "text-red-400" : "text-cyan-400"
                                        )}>
                                            {detections.length} DETECTION{detections.length !== 1 ? 'S' : ''}
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Activity Indicator */}
                    {selected && (
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-cyan-400" />
                        </div>
                    )}
                </div>
            </div>

            {/* Critical Alert Pulse */}
            {hasCritical && (
                <div className="absolute inset-0 pointer-events-none rounded-xl border-2 border-red-500 animate-pulse" />
            )}
        </div>
    );
}

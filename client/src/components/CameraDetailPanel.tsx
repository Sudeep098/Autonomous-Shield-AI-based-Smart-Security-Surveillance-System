import { useState, useMemo } from 'react';
import { useCameraStream } from '@/hooks/useCameraStream';
import { Camera, AlertTriangle, Clock, Activity, HardDrive } from 'lucide-react';
import { KASHMIR_CAMERAS, generateCameraStatus } from '@/data/kashmirCameras';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CameraDetailPanelProps {
    cameraId: string;
    onClose: () => void;
}

export function CameraDetailPanel({ cameraId, onClose }: CameraDetailPanelProps) {
    const camera = useMemo(() => {
        const cam = KASHMIR_CAMERAS.find(c => c.id === cameraId);
        if (!cam) return null;
        return {
            ...cam,
            ...generateCameraStatus(cameraId),
        };
    }, [cameraId]);

    if (!camera) return null;

    const { detections: liveDetections, isConnected } = useCameraStream(cameraId, camera ? camera.status === 'LIVE' : false);

    // Calculate stats from live detections
    const stats = useMemo(() => {
        return {
            people: liveDetections.filter(d => d.class === 'person').length,
            vehicles: liveDetections.filter(d => d.class === 'vehicle').length,
            total: liveDetections.length,
            critical: liveDetections.filter(d => d.threat_level === 'critical').length
        };
    }, [liveDetections]);

    // Use live detections if available, otherwise fallback to empty for now
    const recentDetections = liveDetections.slice(0, 5);

    const isDemoCamera = cameraId === 'CAM_SRG_001';

    const alerts = isDemoCamera ? [
        { id: 'ALT_001', type: 'Loitering Detected', severity: 'HIGH', timestamp: new Date(Date.now() - 60000), acknowledged: false },
    ] : [];

    return (
        <div className="fixed right-0 top-0 h-screen w-[480px] bg-black/95 backdrop-blur-xl border-l border-cyan-500/30 z-50 flex flex-col">
            {/* Header */}
            <div className="flex-none p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-transparent">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h2 className="text-lg font-black text-white tracking-wider uppercase flex items-center gap-2">
                            <Camera className="w-5 h-5 text-cyan-400" />
                            {camera.id}
                        </h2>
                        <p className="text-xs text-zinc-400 mt-1">{camera.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-white/5 p-2 rounded">
                        <div className="text-[9px] text-zinc-500 uppercase">Status</div>
                        <div className={cn(
                            "text-sm font-bold",
                            camera.status === 'LIVE' ? "text-green-400" : "text-red-400"
                        )}>
                            {camera.status}
                        </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded">
                        <div className="text-[9px] text-zinc-500 uppercase">Health</div>
                        <div className="text-sm font-bold text-cyan-400">{camera.health}%</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded">
                        <div className="text-[9px] text-zinc-500 uppercase">Detection Rate</div>
                        <div className="text-sm font-bold text-white flex items-end gap-1">
                            {stats.total} <span className="text-[9px] text-zinc-500 font-normal mb-0.5">objs</span>
                        </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded">
                        <div className="text-[9px] text-zinc-500 uppercase">Threat Level</div>
                        <div className={cn(
                            "text-sm font-bold uppercase",
                            camera.threatLevel === 'critical' ? "text-red-400" :
                                camera.threatLevel === 'suspicious' ? "text-yellow-400" : "text-green-400"
                        )}>
                            {camera.threatLevel}
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Feed */}
            <div className="flex-none h-64 bg-black relative border-b border-white/10 overflow-hidden group">
                {camera.status === 'LIVE' ? (
                    <>
                        <img
                            src={`http://${window.location.hostname}:8000/api/ai/video_feed`}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            alt="Live Feed"
                        />
                        {/* Detection Overlay */}
                        {/* We can temporarily disable overlay here if it's too cluttered in small view, or keep it. Let's keep it but maybe scaled? */}
                        {/* For now, just show the detections if we have the component imported, or just raw video */}
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <Activity className="w-12 h-12 text-cyan-500/30 mx-auto mb-2" />
                            <p className="text-xs text-zinc-600 font-mono">
                                CAMERA OFFLINE
                            </p>
                        </div>
                    </div>
                )}


                {/* Recording Indicator */}
                {camera.recording && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded px-2 py-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-red-400 font-bold uppercase">Recording</span>
                    </div>
                )}

                {/* Camera Info Overlay */}
                <div className="absolute bottom-3 left-3 text-[9px] font-mono text-zinc-400">
                    <div>Zone: {camera.zone.toUpperCase()}</div>
                    <div>Coords: {camera.location[0].toFixed(4)}, {camera.location[1].toFixed(4)}</div>
                    <div>Elevation: {camera.location[2]}m</div>
                    <div className={cn("mt-1 font-bold", isConnected ? "text-green-400" : "text-red-400")}>
                        {isConnected ? "AI LINK ACTIVE" : "AI LINK OFFLINE"}
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Active Alerts */}
                {alerts.length > 0 && (
                    <div>
                        <h3 className="text-xs font-black text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" />
                            Active Alerts ({alerts.length})
                        </h3>
                        <div className="space-y-2">
                            {alerts.map(alert => (
                                <div key={alert.id} className="bg-red-500/10 border border-red-500/30 rounded p-3">
                                    <div className="flex items-start justify-between mb-1">
                                        <span className="text-xs font-bold text-red-400">{alert.type}</span>
                                        <span className="text-[9px] text-red-500 bg-red-500/20 px-2 py-0.5 rounded">
                                            {alert.severity}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {format(alert.timestamp, 'HH:mm:ss')}
                                    </div>
                                    {!alert.acknowledged && (
                                        <button className="mt-2 text-[10px] text-white bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded uppercase tracking-wide">
                                            Acknowledge
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Detections */}
                <div>
                    <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Recent Detections
                    </h3>
                    {recentDetections.length > 0 ? (
                        <div className="space-y-1">
                            {recentDetections.map((det, idx) => (
                                <div key={det.id || idx} className="bg-white/5 border border-white/10 rounded p-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-white font-semibold uppercase">{det.class}</span>
                                            {det.threat_level === 'critical' && <AlertTriangle className="w-3 h-3 text-red-500" />}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-mono font-bold",
                                            det.threat_level === 'critical' ? "text-red-500" :
                                                det.threat_level === 'suspicious' ? "text-yellow-500" : "text-green-500"
                                        )}>
                                            {(det.confidence * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="text-[9px] text-zinc-500 mt-1 flex justify-between">
                                        <span>ID: {det.id.split('_').pop()}</span>
                                        <span>{format(new Date(det.timestamp), 'HH:mm:ss')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[10px] text-zinc-600 italic">No recent detections</p>
                    )}
                </div>

                {/* Storage & Backup */}
                <div>
                    <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <HardDrive className="w-3 h-3" />
                        Storage & Backup
                    </h3>
                    <div className="space-y-2">
                        <div className="bg-white/5 border border-white/10 rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-zinc-400">Local Recording</span>
                                <span className="text-[10px] text-green-400 font-bold">
                                    {camera.recording ? 'ACTIVE' : 'PAUSED'}
                                </span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-cyan-500 w-[65%] h-full" />
                            </div>
                            <div className="text-[9px] text-zinc-500 mt-1">
                                6.5TB Used / 10TB Total
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-zinc-400">Backup Status</span>
                                <span className="text-[10px] text-purple-400 font-bold">SYNCED</span>
                            </div>
                            <div className="text-[9px] text-zinc-500">
                                Last: {format(new Date(), 'dd MMM HH:mm')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

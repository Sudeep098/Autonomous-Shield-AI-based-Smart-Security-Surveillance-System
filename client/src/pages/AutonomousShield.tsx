import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Tactical3DMap } from '@/components/Tactical3DMap';
import { CameraDetailPanel } from '@/components/CameraDetailPanel';
import { CameraFeed } from '@/components/CameraFeed';
import { SuspectManager } from '@/components/SuspectManager';
import { Shield, Activity, Grid3x3, Map, UserPlus } from 'lucide-react';
import { GlitchText } from '@/components/GlitchText';
import { KASHMIR_CAMERAS, generateCameraStatus } from '@/data/kashmirCameras';
import { AlertsWidget } from '@/components/AlertsWidget';
import { cn } from '@/lib/utils';

export default function AutonomousShield() {
    const [selectedCamera, setSelectedCamera] = useState<string | null>('CAM_SRG_001'); // Demo camera selected
    const [viewMode, setViewMode] = useState<'map' | 'grid'>('grid'); // Start with grid view
    const [showSuspectManager, setShowSuspectManager] = useState(false);
    const [systemStats, setSystemStats] = useState({
        totalCameras: 55,
        onlineCameras: 52,
        totalDetections: 1847,
        criticalAlerts: 3,
    });

    // Featured cameras for grid view (show 6 cameras)
    const featuredCameras = [
        { id: 'CAM_SRG_001', name: 'Srinagar Central Square', isLive: true }, // PC Webcam
        // Dal Lake removed for Alerts Widget
        { id: 'CAM_BDR_001', name: 'Uri Sector Checkpoint', isLive: false },
        { id: 'CAM_JMU_001', name: 'Jammu Tawi Station', isLive: false },
        { id: 'CAM_HWY_001', name: 'NH-44 Qazigund', isLive: false },
        { id: 'CAM_BDR_003', name: 'Kargil Sector Watch', isLive: false },
    ];

    // Real System Stats
    const { data: stats } = useQuery({
        queryKey: ['system-stats'],
        queryFn: async () => {
            const res = await fetch('/api/stats');
            return res.json();
        },
        refetchInterval: 2000
    });

    useEffect(() => {
        const cameras = KASHMIR_CAMERAS.map(cam => ({ ...cam, ...generateCameraStatus(cam.id) }));
        const online = cameras.filter(c => c.status === 'LIVE').length;

        setSystemStats({
            totalCameras: 55,
            onlineCameras: online,
            totalDetections: stats?.totalDetections || 0,
            criticalAlerts: stats?.criticalAlerts || 0,
        });
    }, [stats]);

    return (
        <Layout>
            <div className="min-h-screen flex flex-col bg-black relative">
                {/* Background */}
                <div className="fixed inset-0 pointer-events-none z-0 bg-neutral-950">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-black" />
                </div>

                {/* Header */}
                <div className="flex-none px-6 py-4 border-b border-cyan-500/30 bg-black/90 backdrop-blur-md relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                                <Shield className="w-7 h-7 text-cyan-400" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-black tracking-[0.2em] uppercase text-white flex gap-3">
                                    <GlitchText text="AUTONOMOUS" />
                                    <span className="text-cyan-500"><GlitchText text="SHIELD" /></span>
                                </h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[10px] text-zinc-500 font-mono tracking-[0.3em]">MULTI_CAMERA_TACTICAL_SYSTEM</p>
                                    <div className="h-3 w-[1px] bg-white/10" />
                                    <p className="text-[10px] text-green-500 font-mono tracking-widest uppercase">AI_ONLINE</p>
                                </div>
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                                        viewMode === 'grid'
                                            ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                            : "text-zinc-400 hover:text-white"
                                    )}
                                >
                                    <Grid3x3 className="w-4 h-4" />
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={cn(
                                        "px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                                        viewMode === 'map'
                                            ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                            : "text-zinc-400 hover:text-white"
                                    )}
                                >
                                    <Map className="w-4 h-4" />
                                    Map
                                </button>
                            </div>

                            {/* Suspect Manager Button */}
                            <button
                                onClick={() => setShowSuspectManager(true)}
                                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500/30 transition-colors flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Suspect
                            </button>

                            {/* System Stats */}
                            <div className="flex items-center gap-3">
                                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                                    <div className="text-[9px] text-zinc-500 uppercase">Cameras</div>
                                    <div className="text-lg font-black text-cyan-400">{systemStats.onlineCameras}/{systemStats.totalCameras}</div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                                    <div className="text-[9px] text-zinc-500 uppercase">Detections (24h)</div>
                                    <div className="text-lg font-black text-white">{systemStats.totalDetections}</div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                                    <div className="text-[9px] text-zinc-500 uppercase">Critical</div>
                                    <div className="text-lg font-black text-red-400">{systemStats.criticalAlerts}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 relative z-10 p-6">
                    {viewMode === 'grid' ? (
                        // Camera Grid View - Asymmetric with primary camera larger
                        <div className="grid grid-cols-3 gap-4 h-full">
                            {/* Primary Camera - Square, spans 2 columns */}
                            <div className="col-span-2 aspect-square">
                                <CameraFeed
                                    cameraId={featuredCameras[0].id}
                                    cameraName={featuredCameras[0].name}
                                    isLive={featuredCameras[0].isLive}
                                    selected={selectedCamera === featuredCameras[0].id}
                                    onSelect={() => setSelectedCamera(featuredCameras[0].id)}
                                />
                            </div>

                            {/* Threat Stream Widget (Replaces Dal Lake) */}
                            <AlertsWidget />

                            {/* Secondary Cameras - Standard size */}
                            {featuredCameras.slice(1).map(camera => (
                                <CameraFeed
                                    key={camera.id}
                                    cameraId={camera.id}
                                    cameraName={camera.name}
                                    isLive={camera.isLive}
                                    selected={selectedCamera === camera.id}
                                    onSelect={() => setSelectedCamera(camera.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        // Map View
                        <Tactical3DMap
                            selectedCamera={selectedCamera}
                            onCameraSelect={(cameraId) => setSelectedCamera(cameraId)}
                        />
                    )}
                </div>

                {/* Camera Detail Panel */}
                {selectedCamera && (
                    <CameraDetailPanel
                        cameraId={selectedCamera}
                        onClose={() => setSelectedCamera(null)}
                    />
                )}

                {/* Suspect Manager Modal */}
                <SuspectManager
                    isOpen={showSuspectManager}
                    onClose={() => setShowSuspectManager(false)}
                />
            </div>
        </Layout>
    );
}

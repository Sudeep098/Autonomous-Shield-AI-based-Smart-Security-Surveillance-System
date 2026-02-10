import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import DeckGL from '@deck.gl/react';
import { ColumnLayer, ScatterplotLayer, LineLayer } from '@deck.gl/layers';
import { FlyToInterpolator } from '@deck.gl/core';
import { motion } from 'framer-motion';
import { Layers, Zap, Shield, Target, Navigation } from 'lucide-react';

// Mock Data Generation
const INDIA_CENTER = { longitude: 78.9629, latitude: 20.5937 };

const generateThreats = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        position: [
            INDIA_CENTER.longitude + (Math.random() - 0.5) * 15,
            INDIA_CENTER.latitude + (Math.random() - 0.5) * 15
        ],
        height: Math.random() * 50000 + 10000,
        intensity: Math.random(),
        type: Math.random() > 0.7 ? 'CRITICAL' : 'MONITORING'
    }));
};



const INITIAL_VIEW_STATE = {
    longitude: INDIA_CENTER.longitude,
    latitude: INDIA_CENTER.latitude,
    zoom: 4,
    pitch: 45,
    bearing: 0
};

export default function Tactical3D() {
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
    const [hoverInfo, setHoverInfo] = useState<any>(null);
    const [layersVisible, setLayersVisible] = useState({
        threats: true,
        grid: true,
        links: true
    });

    // Ensure threats are stable and accessible
    const threats = React.useMemo(() => generateThreats(50), []);

    const layers = [
        // Threat Columns (3D Bars)
        layersVisible.threats && new ColumnLayer({
            id: 'threat-columns',
            data: threats,
            diskResolution: 12,
            radius: 20000,
            extruded: true,
            pickable: true,
            elevationScale: 100,
            getPosition: (d: any) => d.position,
            getFillColor: (d: any) => d.type === 'CRITICAL' ? [255, 0, 0, 200] : [0, 255, 255, 100],
            getLineColor: [255, 255, 255],
            getElevation: (d: any) => d.height,
            onHover: info => setHoverInfo(info)
        }),

        // Connecting Lines (Network Links)
        layersVisible.links && new LineLayer({
            id: 'network-links',
            data: threats, // Pass fast full array, but Slice in getTarget if needed? No, logic below uses index.
            // Better: Create valid link data first
            // But preserving current visual logic:
            getSourcePosition: (d: any) => d.position,
            getTargetPosition: ((d: any, i: number) => {
                const next = threats[(i + 1) % threats.length];
                return next ? (next.position as [number, number]) : (d.position as [number, number]);
            }) as any,
            getColor: [0, 255, 0, 50],
            getWidth: 2
        }),

        // Base Pulse Points
        new ScatterplotLayer({
            id: 'base-points',
            data: threats,
            getPosition: (d: any) => d.position as [number, number],
            getRadius: 10000,
            getFillColor: [255, 255, 255, 20],
            stroked: true,
            getLineColor: [255, 255, 255, 50],
            filled: true
        })
    ].filter(Boolean);

    const rotateCamera = () => {
        setViewState(v => ({
            ...v,
            bearing: v.bearing + 0.5,
            transitionDuration: 100,
            transitionInterpolator: new FlyToInterpolator()
        }));
    };

    // Auto-rotate effect
    useEffect(() => {
        const interval = setInterval(rotateCamera, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <Layout className="h-full relative overflow-hidden bg-black">
            <div className="absolute inset-0 z-0">
                <DeckGL
                    viewState={viewState}
                    onViewStateChange={({ viewState }: any) => setViewState(viewState)}
                    controller={true}
                    layers={layers}
                    getTooltip={({ object }: any) => object && {
                        html: `
              <div style="background: rgba(0,0,0,0.8); color: white; padding: 10px; font-family: monospace; border: 1px solid #333;">
                <div style="font-weight: bold; color: ${object.type === 'CRITICAL' ? 'red' : 'cyan'}">${object.type} TARGET</div>
                <div>ALTITUDE: ${Math.round(object.height)}M</div>
                <div>INTENSITY: ${(object.intensity * 100).toFixed(0)}%</div>
              </div>
            `
                    }}
                >
                    {/* Background Grid for "Void" effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"
                        style={{ transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)', opacity: 0.2 }} />
                </DeckGL>
            </div>

            {/* TACTICAL HUD */}
            <div className="relative z-10 p-6 pointer-events-none w-full h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <div className="bg-black/80 backdrop-blur border border-white/10 p-4 rounded-xl">
                        <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <Layers className="w-6 h-6 text-purple-500 animate-pulse" />
                            TACTICAL_3D_VIEW
                        </h1>
                        <div className="flex gap-4 text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-widest">
                            <span>PITCH: {viewState.pitch.toFixed(0)}°</span>
                            <span>BEARING: {viewState.bearing.toFixed(0)}°</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setLayersVisible(l => ({ ...l, threats: !l.threats }))}
                            className={`p-3 border rounded-lg transition-all ${layersVisible.threats ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-black/50 border-white/10 text-zinc-500'}`}
                        >
                            <Target className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setLayersVisible(l => ({ ...l, links: !l.links }))}
                            className={`p-3 border rounded-lg transition-all ${layersVisible.links ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'bg-black/50 border-white/10 text-zinc-500'}`}
                        >
                            <Navigation className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="flex items-end justify-between pointer-events-auto">
                    <div className="bg-black/80 backdrop-blur border border-white/10 p-4 rounded-xl w-64">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            Coverage_Status
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                                <span>ACTIVE_NODES</span>
                                <span className="text-white font-bold">{threats.length}</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: '80%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

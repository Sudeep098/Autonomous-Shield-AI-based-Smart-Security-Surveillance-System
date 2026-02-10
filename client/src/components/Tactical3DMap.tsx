import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import { KASHMIR_CAMERAS, KASHMIR_BOUNDS, generateCameraStatus } from '@/data/kashmirCameras';
import { Camera, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Camera {
    id: string;
    name: string;
    location: [number, number, number];
    zone: string;
}

interface TacticalMapProps {
    onCameraSelect?: (cameraId: string) => void;
    selectedCamera?: string | null;
}

function MapController() {
    const map = useMap();
    map.setView([34.0, 75.0], 8);
    return null;
}

export function Tactical3DMap({ onCameraSelect, selectedCamera }: TacticalMapProps) {
    const cameras = useMemo(() => {
        return KASHMIR_CAMERAS.map(camera => ({
            ...camera,
            ...generateCameraStatus(camera.id),
            position: camera.location,
        }));
    }, []);

    const createCustomIcon = (camera: any) => {
        const isSelected = camera.id === selectedCamera;
        const isDemo = camera.id === 'CAM_SRG_001';
        const color = camera.status === 'LIVE' ? '#10b981' : '#ef4444';
        const size = isSelected ? 40 : isDemo ? 36 : 32;

        return L.divIcon({
            className: 'custom-camera-marker',
            html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 ${isSelected ? '20px' : '10px'} rgba(6,182,212,0.5);
          cursor: pointer;
        ">
          <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
            <path d="M23 7l-7 5 7 5V7z"/>
            <rect width="15" height="12" x="1" y="6" rx="2" ry="2"/>
          </svg>
        </div>
      `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        });
    };

    return (
        <div className="relative w-full h-[calc(100vh-140px)] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            <MapContainer
                center={[34.0, 75.0]}
                zoom={8}
                className="w-full h-full"
                style={{ background: '#0a0a0a' }}
            >
                <MapController />
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Satellite (Esri)">
                        <TileLayer
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Tactical (Dark)">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Street (OSM)">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {cameras.map(camera => (
                    <Marker
                        key={camera.id}
                        position={[camera.location[1], camera.location[0]]}
                        icon={createCustomIcon(camera)}
                        eventHandlers={{
                            click: () => onCameraSelect && onCameraSelect(camera.id),
                        }}
                    >
                        <Popup>
                            <div className="text-xs font-mono">
                                <div className="font-bold text-cyan-400">{camera.id}</div>
                                <div className="text-zinc-300">{camera.name}</div>
                                <div className="mt-1 text-[10px]">
                                    <div>Status: <span className={camera.status === 'LIVE' ? 'text-green-400' : 'text-red-400'}>{camera.status}</span></div>
                                    <div>Zone: {camera.zone}</div>
                                    <div>Detections: {camera.detectionCount}</div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Map Header */}
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 pointer-events-none z-[1000]">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
                    <h2 className="text-lg font-black text-white tracking-[0.2em] uppercase">
                        Kashmir Tactical Grid
                    </h2>
                </div>
                <p className="text-[10px] text-cyan-400 font-mono">
                    {cameras.filter(c => c.status === 'LIVE').length}/{cameras.length} CAMERAS ONLINE
                </p>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 z-[1000]">
                <div className="text-[9px] font-mono space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-zinc-400">LIVE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-zinc-400">OFFLINE</span>
                    </div>
                </div>
            </div>

            {/* Camera Count by Zone */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 text-[10px] font-mono z-[1000]">
                <div className="text-white font-bold mb-2">DEPLOYMENT</div>
                <div className="space-y-1 text-zinc-400">
                    <div>Urban: {cameras.filter(c => c.zone === 'urban').length}</div>
                    <div>Border: {cameras.filter(c => c.zone === 'border').length}</div>
                    <div>Highway: {cameras.filter(c => c.zone === 'highway').length}</div>
                    <div>Remote: {cameras.filter(c => c.zone === 'remote').length}</div>
                </div>
            </div>
        </div>
    );
}

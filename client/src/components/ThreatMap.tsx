import { MapContainer, TileLayer, Marker, Popup, Circle, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PredictiveThreats } from '@/components/PredictiveThreats';

interface Alert {
    alert_id: string;
    type: string;
    object: string;
    confidence: string;
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    description: string;
    timestamp: string;
}

interface ThreatMapProps {
    alerts: Alert[];
    predictions?: any[];
}

export function ThreatMap({ alerts, predictions }: ThreatMapProps) {
    const [geoJsonData, setGeoJsonData] = useState<any>(null);

    // Default center (Jammu & Kashmir)
    const defaultCenter: [number, number] = [33.7782, 76.5762];

    useEffect(() => {
        // Fetch India Border GeoJSON (Keep for context)
        fetch('https://raw.githubusercontent.com/datameet/maps/master/Country/india-osm.geojson')
            .then(response => response.json())
            .then(data => setGeoJsonData(data))
            .catch(error => console.error("Error loading GeoJSON:", error));
    }, []);

    // Create threat marker icon
    const createThreatIcon = (color: string) => {
        return L.divIcon({
            className: 'custom-threat-marker',
            html: `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 32px;
            height: 32px;
            background: ${color};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 20px ${color}80, 0 0 40px ${color}40;
            animation: threatPulse 1.5s ease-in-out infinite;
          "></div>
          <style>
            @keyframes threatPulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.8; }
            }
          </style>
        </div>
      `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });
    };

    const threatIcon = createThreatIcon('#ef4444');
    const cameraIcon = createThreatIcon('#06b6d4'); // Cyan for cameras

    // Demo Cameras in Kashmir
    const demoCameras = [
        { id: 'CAM_SRINAGAR_01', lat: 34.0837, lng: 74.7973, name: 'Srinagar Central' },
        { id: 'CAM_JAMMU_01', lat: 32.7266, lng: 74.8570, name: 'Jammu Tawi' },
        { id: 'CAM_ANANTNAG_01', lat: 33.7311, lng: 75.1487, name: 'Anantnag Square' },
        { id: 'CAM_BARAMULLA_01', lat: 34.1980, lng: 74.3636, name: 'Baramulla Checkpost' },
    ];

    return (
        <div className="relative h-full w-full">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-[1000] p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                            J&K SURVEILLANCE GRID
                        </h3>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 bg-black/60 border border-red-500/30 rounded-lg backdrop-blur-sm">
                            <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider">
                                Active Threats: {alerts.length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <MapContainer
                center={defaultCenter}
                zoom={9}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                className="z-0 bg-slate-900" // Dark background for map
            >
                {/* Satellite Imagery */}
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='© Esri'
                />

                {/* Dark Overlay for Cyberpunk effect */}
                <div className="leaflet-overlay-pane" style={{ mixBlendMode: 'multiply', opacity: 0.5, backgroundColor: '#002' }}></div>

                {/* India Border Highlight */}
                {geoJsonData && (
                    <GeoJSON
                        data={geoJsonData}
                        style={{
                            color: '#334155',
                            weight: 1,
                            opacity: 0.5,
                            fillColor: 'transparent',
                            fillOpacity: 0
                        }}
                    />
                )}

                {/* Demo Cameras */}
                {demoCameras.map(cam => (
                    <Marker
                        key={cam.id}
                        position={[cam.lat, cam.lng]}
                        icon={cameraIcon}
                    >
                        <Popup className="custom-popup">
                            <div className="p-2 font-mono text-xs">
                                <strong>{cam.name}</strong><br />
                                <span className="text-cyan-600">ONLINE</span>
                            </div>
                        </Popup>
                    </Marker>
                ))}


                {/* Threat Markers */}
                {alerts.map((alert) => (
                    <div key={alert.alert_id}>
                        {/* Marker */}
                        <Marker
                            position={[alert.coordinates.lat, alert.coordinates.lng]}
                            icon={threatIcon}
                        >
                            <Popup className="custom-popup">
                                <div className="p-2 font-mono">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                        <span className="text-xs font-black text-red-600 uppercase">
                                            {alert.type}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-[10px]">
                                        <div>
                                            <span className="text-zinc-600">Object: </span>
                                            <span className="text-black font-bold">{alert.object}</span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-600">Confidence: </span>
                                            <span className="text-black font-bold">{alert.confidence}</span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-600">Location: </span>
                                            <span className="text-black font-bold">{alert.location}</span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-600">Time: </span>
                                            <span className="text-black font-bold">
                                                {new Date(alert.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-zinc-300">
                                        <p className="text-[9px] text-zinc-700">{alert.description}</p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Threat radius circle */}
                        <Circle
                            center={[alert.coordinates.lat, alert.coordinates.lng]}
                            radius={200} // 200 meter threat zone
                            pathOptions={{
                                color: '#ef4444',
                                fillColor: '#ef4444',
                                fillOpacity: 0.1,
                                weight: 2,
                                opacity: 0.6,
                            }}
                        />
                    </div>
                ))}
            </MapContainer>

            {/* Info Box */}
            <div className="absolute bottom-4 right-4 z-[1000] bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 pointer-events-none">
                <div className="text-[10px] font-mono text-zinc-400 space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full opacity-20 border border-red-500" />
                        <span>Border Sovereignty Zone</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full border border-white" />
                        <span>Critical Threat</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-red-500 rounded-full opacity-30" />
                        <span>200m Threat Zone</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

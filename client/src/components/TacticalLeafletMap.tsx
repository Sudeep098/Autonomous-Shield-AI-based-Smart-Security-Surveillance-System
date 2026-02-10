import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap, WMSTileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { INDIA_GEOJSON, THERMAL_DATA } from '@/lib/geo-data';
import { useDevices } from '@/hooks/use-devices';

// --- Tactical Dark Mode Styles for Leaflet ---
// We inject this style to invert the standard OSM tiles, creating a high-tech "Defense" look.
const tacticalMapStyle = `
  .leaflet-layer {
    filter: grayscale(100%) invert(100%) contrast(1.2) brightness(0.8);
  }
  .range-rings {
      animation: pulse 2s infinite;
  }
`;

// Heatmap Component (must be child of MapContainer)
function HeatmapLayer() {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // @ts-ignore - leaflet.heat is a plugin
        const heat = L.heatLayer(THERMAL_DATA, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
        }).addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [map]);

    return null;
}



// Controls map position from external props
function MapController({ target, zoomCmd }: { target: { lat: number, lng: number, zoom: number } | null, zoomCmd?: any }) {
    const map = useMap();

    useEffect(() => {
        if (target) {
            map.flyTo([target.lat, target.lng], target.zoom, {
                duration: 2,
                easeLinearity: 0.25
            });
        }
    }, [target]);

    useEffect(() => {
        if (zoomCmd) {
            if (zoomCmd.action === 'in') map.zoomIn();
            if (zoomCmd.action === 'out') map.zoomOut();
        }
    }, [zoomCmd]);

    return null;
}

// Measurement Tool
function MeasureTool({ active }: { active: boolean | undefined }) {
    const map = useMap();
    const [points, setPoints] = useState<L.LatLng[]>([]);

    // Clear points when tool deactivated
    useEffect(() => {
        if (!active) setPoints([]);
    }, [active]);

    useEffect(() => {
        if (!active) return;

        const handler = (e: L.LeafletMouseEvent) => {
            setPoints(prev => {
                if (prev.length >= 2) return [e.latlng]; // Reset on 3rd click
                return [...prev, e.latlng];
            });
        };

        map.on('click', handler);
        return () => { map.off('click', handler); }
    }, [map, active]);

    if (!active || points.length === 0) return null;

    return (
        <>
            {points.map((p, i) => (
                <Marker key={i} position={p}>
                    <Popup>POINT {i + 1}</Popup>
                </Marker>
            ))}
            {points.length === 2 && (
                <Polyline positions={points} color="#3b82f6" dashArray="5, 10">
                    <Popup isOpen={true} autoClose={false}>
                        DISTANCE: {(points[0].distanceTo(points[1])).toFixed(2)} M
                    </Popup>
                </Polyline>
            )}
        </>
    )
}

// Route Display Layer
// Route Display Layer
function RouteLayer({ geometry }: { geometry: any }) {
    if (!geometry) return null;
    const positions = geometry.coordinates.map((c: any) => [c[1], c[0]]); // Swap to Lat/Lng

    return (
        <>
            {/* Glow Effect */}
            <Polyline
                key={`glow-${geometry.coordinates[0][0]}`}
                positions={positions}
                color="#f97316"
                weight={8}
                opacity={0.4}
            />
            {/* Core Line */}
            <Polyline
                key={`line-${geometry.coordinates[0][0]}`}
                positions={positions}
                color="#fff"
                weight={3}
                dashArray="10, 10"
            />
        </>
    );
}

function MapEvents({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
    useMap().on('click', (e) => {
        if (onClick) onClick(e.latlng.lat, e.latlng.lng);
    });
    return null;
}

export function TacticalLeafletMap({ active, layers, focusTarget, routeData, currentLocation, onMapClick, measureMode, zoomCmd }: {
    active: boolean,
    layers: any,
    focusTarget?: { lat: number, lng: number, zoom: number } | null,
    routeData?: any,
    currentLocation?: { lat: number, lng: number } | null,
    onMapClick?: (lat: number, lng: number) => void,
    measureMode?: boolean,
    zoomCmd?: { action: 'in' | 'out', ts: number } | null
}) {
    const { data: devices } = useDevices();

    // Fix for default Leaflet markers in React
    useEffect(() => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    if (!active) return null;

    return (
        <div className="absolute inset-0 z-0 bg-black">
            <style>{tacticalMapStyle}</style>

            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
                zoomControl={false}
                attributionControl={false}
            >
                <MapController target={focusTarget || null} zoomCmd={zoomCmd} />
                <MapEvents onClick={measureMode ? undefined : onMapClick} />
                <MeasureTool active={measureMode} />

                {/* 1. Base Layer (Geoapify Backend Proxy) */}
                {/* Fetches from /api/gis/tiles which proxies to Geoapify Dark Matter */}
                <TileLayer
                    url="/api/gis/tiles/{z}/{x}/{y}"
                    eventHandlers={{
                        tileerror: (e) => {
                            console.warn("Tile Failed, switching to fallback", e);
                            e.target.setUrl('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
                        }
                    }}
                />

                {layers.terrain && (
                    <WMSTileLayer
                        url="/api/gis/bhuvan/wms"
                        params={{
                            layers: 'L3-INDIA', // LISS III Composite
                            format: 'image/jpeg',
                            transparent: true,
                            version: '1.1.1',
                            attribution: 'ISRO / NRSC Bhuvan'
                        }}
                    />
                )}

                {/* 3. India Borders & Zones (GeoJSON) */}
                {INDIA_GEOJSON.features.map((feature, i) => (
                    <Polygon
                        key={i}
                        positions={feature.geometry.coordinates[0].map((coord: any) => [coord[1], coord[0]])} // GeoJSON is Lng/Lat, Leaflet is Lat/Lng
                        pathOptions={{
                            color: feature.properties.type === 'high-risk' ? '#ef4444' : '#f59e0b',
                            fillColor: feature.properties.type === 'high-risk' ? '#ef4444' : '#f59e0b',
                            fillOpacity: 0.2,
                            weight: 2,
                            dashArray: '5, 10'
                        }}
                    />
                ))}

                {/* 4. Thermal / Heatmap Layer */}
                {layers.heatmap && <HeatmapLayer />}

                {/* 5. Search Taret Marker (New) */}
                {focusTarget && (
                    <Marker position={[focusTarget.lat, focusTarget.lng]}>
                        <Popup>TARGET_SECTOR</Popup>
                    </Marker>
                )}

                {/* 6. Tactical Route (New) */}
                {routeData && <RouteLayer geometry={routeData} />}

                {/* 6.5 Current Location Marker (Blue Pulse) */}
                {currentLocation && (
                    <Marker
                        position={[currentLocation.lat, currentLocation.lng]}
                        icon={L.divIcon({
                            className: 'bg-transparent',
                            html: `<div style="width: 16px; height: 16px; background-color: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 20px #3b82f6; animation: pulse 1s infinite;"></div>`
                        })}
                    >
                        <Popup>UNIT_LOCATION (YOU)</Popup>
                    </Marker>
                )}

                {/* 7. Device Markers */}
                {devices?.map((device) => {
                    // Map Backend 'x/y' (which were 2500, etc) to Real Lat/Lng
                    // In a real system, DB would store lat/lng directly. 
                    // For this demo, we project 2500,2500 -> Center of India [20.5937, 78.9629]
                    // and scale offsets.
                    const lat = 20.5937 + ((2500 - (device.y || 2500)) / 100);
                    const lng = 78.9629 + (((device.x || 2500) - 2500) / 100);

                    const customIcon = L.divIcon({
                        className: 'bg-transparent',
                        html: `<div style="
                            width: 12px; 
                            height: 12px; 
                            background-color: ${device.status === 'online' ? '#22c55e' : '#ef4444'}; 
                            border-radius: 50%; 
                            border: 2px solid white;
                            box-shadow: 0 0 10px ${device.status === 'online' ? '#22c55e' : '#ef4444'};
                            animation: pulse 2s infinite;
                        "></div>`
                    });

                    return (
                        <Marker
                            key={device.id}
                            position={[lat, lng]}
                            icon={customIcon}
                        >
                            <Popup className="tactical-popup">
                                <div className="text-black font-mono text-xs p-1">
                                    <strong>{device.name}</strong><br />
                                    STATUS: {device.status.toUpperCase()}<br />
                                    BAT: {device.battery}%
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}

            </MapContainer>

        </div>
    );
}

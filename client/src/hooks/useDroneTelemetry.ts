import { useEffect, useState } from 'react';
import { DroneTelemetry, DroneMode, DroneStatus } from '@/../../shared/types/drone';

// Mock telemetry generator for demo purposes
const generateMockTelemetry = (droneId: string, index: number): DroneTelemetry => {
    const baseLocations = [
        { lat: 28.6139 + (index * 0.001), lng: 77.2090 + (index * 0.001) },
        { lat: 28.6150 + (index * 0.001), lng: 77.2100 + (index * 0.001) },
        { lat: 28.6160 + (index * 0.001), lng: 77.2110 + (index * 0.001) },
    ];

    return {
        id: droneId,
        name: `AQR-${droneId.slice(0, 4).toUpperCase()}`,
        status: Math.random() > 0.2 ? DroneStatus.ACTIVE : DroneStatus.CHARGING,
        mode: Math.random() > 0.5 ? DroneMode.PATROL : DroneMode.IDLE,
        location: {
            ...baseLocations[index % baseLocations.length],
            altitude: 50 + Math.random() * 100,
        },
        battery: 60 + Math.random() * 40,
        signalStrength: 70 + Math.random() * 30,
        speed: Math.random() * 15,
        heading: Math.random() * 360,
        lastUpdate: new Date(),
    };
};

export const useDroneTelemetry = (droneIds: string[]) => {
    const [telemetry, setTelemetry] = useState<Record<string, DroneTelemetry>>({});
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize with mock data
        const initialTelemetry: Record<string, DroneTelemetry> = {};
        droneIds.forEach((id, index) => {
            initialTelemetry[id] = generateMockTelemetry(id, index);
        });
        setTelemetry(initialTelemetry);
        setIsConnected(true);

        // Simulate real-time updates every 3 seconds
        const interval = setInterval(() => {
            setTelemetry((prev) => {
                const updated: Record<string, DroneTelemetry> = {};
                droneIds.forEach((id, index) => {
                    const current = prev[id];
                    if (!current) {
                        updated[id] = generateMockTelemetry(id, index);
                        return;
                    }

                    // Update with slight variations
                    updated[id] = {
                        ...current,
                        location: {
                            lat: current.location.lat + (Math.random() - 0.5) * 0.0001,
                            lng: current.location.lng + (Math.random() - 0.5) * 0.0001,
                            altitude: Math.max(20, current.location.altitude + (Math.random() - 0.5) * 5),
                        },
                        battery: Math.max(0, current.battery - Math.random() * 0.5),
                        signalStrength: Math.min(100, Math.max(50, current.signalStrength + (Math.random() - 0.5) * 5)),
                        speed: Math.max(0, current.speed + (Math.random() - 0.5) * 2),
                        heading: (current.heading + Math.random() * 10) % 360,
                        lastUpdate: new Date(),
                    };
                });
                return updated;
            });
        }, 3000);

        return () => {
            clearInterval(interval);
            setIsConnected(false);
        };
    }, [droneIds]);

    return { telemetry, isConnected };
};

const defaultDroneIds = ['drone-001', 'drone-002', 'drone-003', 'drone-004'];

export const useDroneFleet = () => {
    const { telemetry, isConnected } = useDroneTelemetry(defaultDroneIds);

    const fleetStatus = {
        totalDrones: defaultDroneIds.length,
        activeDrones: Object.values(telemetry).filter(d => d.status === DroneStatus.ACTIVE).length,
        onPatrol: Object.values(telemetry).filter(d => d.mode === DroneMode.PATROL).length,
        tracking: Object.values(telemetry).filter(d => d.mode === DroneMode.TRACKING).length,
        charging: Object.values(telemetry).filter(d => d.status === DroneStatus.CHARGING).length,
        offline: Object.values(telemetry).filter(d => d.status === DroneStatus.OFFLINE).length,
    };

    return {
        drones: Object.values(telemetry),
        fleetStatus,
        isConnected,
    };
};

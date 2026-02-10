export enum DroneMode {
    IDLE = 'IDLE',
    PATROL = 'PATROL',
    TRACKING = 'TRACKING',
    RETURNING = 'RETURNING',
    EMERGENCY = 'EMERGENCY',
}

export enum DroneStatus {
    ACTIVE = 'ACTIVE',
    OFFLINE = 'OFFLINE',
    MAINTENANCE = 'MAINTENANCE',
    CHARGING = 'CHARGING',
    ERROR = 'ERROR',
}

export interface DroneLocation {
    lat: number;
    lng: number;
    altitude: number;
}

export interface DroneTelemetry {
    id: string;
    name: string;
    status: DroneStatus;
    mode: DroneMode;
    location: DroneLocation;
    battery: number; // 0-100
    signalStrength: number; // 0-100
    speed: number; // m/s
    heading: number; // degrees 0-360
    lastUpdate: Date;
    assignedCamera?: string; // Camera ID if in TRACKING mode
}

export interface PatrolRoute {
    id: string;
    name: string;
    waypoints: DroneLocation[];
    duration: number; // estimated minutes
    coverage: string[]; // Array of zone IDs
}

export interface DroneFleetStatus {
    totalDrones: number;
    activeDrones: number;
    onPatrol: number;
    tracking: number;
    charging: number;
    offline: number;
}

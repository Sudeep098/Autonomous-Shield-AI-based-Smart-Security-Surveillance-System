export enum ThreatLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export enum BehaviorType {
    NORMAL = 'NORMAL',
    LOITERING = 'LOITERING',
    CLIMBING = 'CLIMBING',
    CRAWLING = 'CRAWLING',
    RUNNING = 'RUNNING',
    UNATTENDED_BAGGAGE = 'UNATTENDED_BAGGAGE',
    FENCE_BREACH = 'FENCE_BREACH',
    VEHICLE_SPEEDING = 'VEHICLE_SPEEDING',
}

export enum ObjectType {
    PERSON = 'PERSON',
    VEHICLE = 'VEHICLE',
    ANIMAL = 'ANIMAL',
    BAGGAGE = 'BAGGAGE',
    UNKNOWN = 'UNKNOWN',
}

export interface DetectedObject {
    id: string;
    type: ObjectType;
    confidence: number; // 0-1
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    timestamp: Date;
    cameraId: string;
    snapshot?: string; // base64 or URL
}

export interface BehavioralAnomaly {
    id: string;
    behavior: BehaviorType;
    threatLevel: ThreatLevel;
    detectedObject: DetectedObject;
    location: {
        lat: number;
        lng: number;
    };
    description: string;
    timestamp: Date;
    resolved: boolean;
}

export interface AnalyticsEvent {
    id: string;
    type: 'detection' | 'anomaly' | 'alert' | 'system';
    timestamp: Date;
    cameraId?: string;
    droneId?: string;
    severity: ThreatLevel;
    title: string;
    description: string;
    metadata?: Record<string, any>;
    relatedObjects?: DetectedObject[];
}

export interface ForensicSearchQuery {
    text?: string;
    objectType?: ObjectType;
    threatLevel?: ThreatLevel;
    startDate?: Date;
    endDate?: Date;
    cameraIds?: string[];
    tags?: string[];
}

export interface ForensicSearchResult {
    events: AnalyticsEvent[];
    objects: DetectedObject[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export enum SpectralMode {
    VISIBLE = 'VISIBLE', // Standard 4K
    THERMAL = 'THERMAL',
    INFRARED = 'INFRARED',
}

export interface CameraCapability {
    id: string;
    name: string;
    supportedModes: SpectralMode[];
    currentMode: SpectralMode;
    hasAI: boolean;
    resolution: string;
}

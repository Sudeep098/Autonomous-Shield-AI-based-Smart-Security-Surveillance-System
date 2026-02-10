import { mysqlTable, text, serial, int, boolean, timestamp, json, double, date, decimal, varchar } from "drizzle-orm/mysql-core";

// ==============================================================================
// KASHMIR SURVEILLANCE SYSTEM - CENTRAL DATABASE SCHEMA  
// MySQL via Drizzle ORM
// ==============================================================================

// === STATIONS ===
export const stations = mysqlTable("stations", {
    id: varchar("id", { length: 255 }).primaryKey(), // e.g., STATION_SRINAGAR
    name: text("name").notNull(),
    zone: text("zone").notNull(), // SRINAGAR, BUDGAM, etc.
    ward: text("ward"),
    contactNumber: text("contact_number"),
    ipGateway: text("ip_gateway"),
    createdAt: timestamp("created_at").defaultNow(),
});

// === INCIDENT REPORTS (Synced from Edge) ===
export const incidentReports = mysqlTable("incident_reports", {
    id: serial("id").primaryKey(),
    edgeIncidentId: text("edge_incident_id").unique().notNull(),
    stationId: text("station_id").references(() => stations.id),

    // Incident Details
    title: text("title").notNull(),
    summary: text("summary"),
    priority: text("priority", { enum: ['critical', 'high', 'medium', 'low'] }).notNull(),
    type: text("type"),
    status: text("status").default('resolved'),

    // Source
    cameraId: text("camera_id"),
    detectionCount: integer("detection_count").default(0),

    // Evidence
    evidenceUrl: text("evidence_url"),
    snapshotCount: integer("snapshot_count").default(0),

    // Timeline
    incidentCreatedAt: timestamp("incident_created_at").notNull(),
    incidentResolvedAt: timestamp("incident_resolved_at"),
    resolutionNotes: text("resolution_notes"),

    // Sync
    syncedAt: timestamp("synced_at").defaultNow(),
});

// === DAILY STATISTICS ===
export const dailyStatistics = mysqlTable("daily_statistics", {
    id: serial("id").primaryKey(),
    statDate: date("stat_date").notNull(),
    stationId: text("station_id").references(() => stations.id),

    // Detection Metrics
    totalDetections: integer("total_detections").default(0),
    personDetections: integer("person_detections").default(0),
    vehicleDetections: integer("vehicle_detections").default(0),

    // Event Metrics
    qualifiedEvents: integer("qualified_events").default(0),
    incidentsOpened: integer("incidents_opened").default(0),
    incidentsResolved: integer("incidents_resolved").default(0),

    // Threat Metrics
    criticalThreats: integer("critical_threats").default(0),
    highThreats: integer("high_threats").default(0),
    mediumThreats: integer("medium_threats").default(0),

    // Performance
    avgResponseTimeSeconds: doublePrecision("avg_response_time_seconds"),
    cameraUptimePercentage: doublePrecision("camera_uptime_percentage"),

    createdAt: timestamp("created_at").defaultNow(),
});

// === CAMERA STATISTICS ===
export const cameraStatistics = mysqlTable("camera_statistics", {
    id: serial("id").primaryKey(),
    statDate: date("stat_date").notNull(),
    cameraId: text("camera_id").notNull(),
    stationId: text("station_id").references(() => stations.id),

    // Availability
    uptimePercentage: doublePrecision("uptime_percentage"),
    downtimeMinutes: integer("downtime_minutes").default(0),

    // Detections
    totalDetections: integer("total_detections").default(0),
    personDetections: integer("person_detections").default(0),
    vehicleDetections: integer("vehicle_detections").default(0),
    threatDetections: integer("threat_detections").default(0),

    // Recording
    recordingHours: doublePrecision("recording_hours"),
    storageUsedGb: doublePrecision("storage_used_gb"),

    createdAt: timestamp("created_at").defaultNow(),
});

// === AUDIT TRAIL ===
export const auditTrail = mysqlTable("audit_trail", {
    id: serial("id").primaryKey(),
    auditId: text("audit_id").unique().notNull(),

    // Action
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),

    // Actor
    userId: text("user_id"),
    username: text("username"),
    stationId: text("station_id"),
    ipAddress: text("ip_address"),

    // State Changes
    previousState: jsonb("previous_state"),
    newState: jsonb("new_state"),

    // Integrity
    timestamp: timestamp("timestamp").notNull(),
    checksum: text("checksum").notNull(),

    syncedAt: timestamp("synced_at").defaultNow(),
});

// === RECORDING ARCHIVES ===
export const recordingArchives = mysqlTable("recording_archives", {
    id: serial("id").primaryKey(),
    recordingId: text("recording_id").unique().notNull(),
    cameraId: text("camera_id").notNull(),
    stationId: text("station_id").references(() => stations.id),

    // Recording Details
    recordingDate: date("recording_date").notNull(),
    durationSeconds: integer("duration_seconds"),
    fileSizeMb: doublePrecision("file_size_mb"),
    storagePath: text("storage_path").notNull(),

    // Integrity
    checksumSha256: text("checksum_sha256"),
    verified: boolean("verified").default(false),

    // Retention
    retentionDays: integer("retention_days").default(30),
    deleteAfter: date("delete_after"),
    deleted: boolean("deleted").default(false),

    // Linked Incidents
    incidentCount: integer("incident_count").default(0),

    createdAt: timestamp("created_at").defaultNow(),
});

// === ALERTS (Dashboard) ===
export const alerts = mysqlTable("alerts", {
    id: serial("id").primaryKey(),
    alertId: text("alert_id").unique(),
    incidentId: text("incident_id"),
    title: text("title").notNull(),
    message: text("message"),
    priority: text("priority", { enum: ['HIGH', 'MEDIUM', 'LOW'] }).notNull(),
    type: text("type"),
    acknowledged: boolean("acknowledged").default(false),
    acknowledgedBy: text("acknowledged_by"),
    acknowledgedAt: timestamp("acknowledged_at"),
    stationId: text("station_id").references(() => stations.id),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// === DEVICES ===
export const devices = mysqlTable("devices", {
    id: serial("id").primaryKey(),
    deviceId: text("device_id").unique().notNull(),
    name: text("name").notNull(),
    type: text("type", { enum: ['camera', 'drone', 'sensor', 'server'] }).notNull(),
    status: text("status", { enum: ['online', 'offline', 'warning', 'maintenance'] }).notNull(),
    zone: text("zone").notNull(),
    stationId: text("station_id").references(() => stations.id),

    // Position (for 3D map)
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    altitude: doublePrecision("altitude"),

    // Connection
    ipAddress: text("ip_address"),
    streamUrl: text("stream_url"),

    // Health
    lastPing: timestamp("last_ping").defaultNow(),
    cpuUsage: integer("cpu_usage"),
    memoryUsage: integer("memory_usage"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// === LOGS (Unified - No Duplicates) ===
export const logs = mysqlTable("logs", {
    id: serial("id").primaryKey(),
    logId: text("log_id").unique(),
    level: text("level", { enum: ['info', 'warning', 'error', 'success'] }).notNull(),
    category: text("category", { enum: ['system', 'detection', 'user', 'sync', 'error'] }).notNull(),
    action: text("action").notNull(),
    message: text("message"),
    module: text("module"),

    // Context
    userId: text("user_id"),
    cameraId: text("camera_id"),
    incidentId: text("incident_id"),
    stationId: text("station_id"),

    // Metadata
    meta: jsonb("meta"),

    timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// === USERS ===
export const users = mysqlTable("users", {
    id: serial("id").primaryKey(),
    userId: text("user_id").unique().notNull(),
    username: text("username").unique().notNull(),
    email: text("email").unique(),
    passwordHash: text("password_hash").notNull(),

    // Role
    role: text("role", { enum: ['admin', 'supervisor', 'operator', 'viewer'] }).notNull(),
    stationId: text("station_id").references(() => stations.id),

    // Status
    active: boolean("active").default(true),
    lastLogin: timestamp("last_login"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Edge Database - MongoDB Schema & Operations
 * Kashmir Surveillance System
 * 
 * This module handles all MongoDB operations for the edge node.
 */

const { MongoClient, ObjectId } = require('mongodb');

// Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'kashmir_surveillance';

let client = null;
let db = null;

// ==============================================================================
// CONNECTION
// ==============================================================================

async function connect() {
    if (db) return db;

    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);

    // Create indexes
    await createIndexes();

    console.log('✅ MongoDB Connected:', DB_NAME);
    return db;
}

async function disconnect() {
    if (client) {
        await client.close();
        client = null;
        db = null;
    }
}

// ==============================================================================
// INDEXES & TTL
// ==============================================================================

async function createIndexes() {
    // Cameras
    await db.collection('cameras').createIndex({ camera_id: 1 }, { unique: true });
    await db.collection('cameras').createIndex({ zone: 1, status: 1 });
    await db.collection('cameras').createIndex({ 'position.lat': 1, 'position.lng': 1 });

    // Detections (24h TTL)
    await db.collection('detections').createIndex({ camera_id: 1, timestamp: -1 });
    await db.collection('detections').createIndex({ threat_level: 1, timestamp: -1 });
    await db.collection('detections').createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });

    // Qualified Events
    await db.collection('qualified_events').createIndex({ camera_id: 1, timestamp: -1 });
    await db.collection('qualified_events').createIndex({ threat_level: 1 });

    // Incidents
    await db.collection('incidents').createIndex({ incident_id: 1 }, { unique: true });
    await db.collection('incidents').createIndex({ status: 1, priority: 1 });
    await db.collection('incidents').createIndex({ created_at: -1 });
    await db.collection('incidents').createIndex({ synced_to_central: 1 });

    // Alerts (1h TTL)
    await db.collection('alerts').createIndex({ acknowledged: 1, priority: 1 });
    await db.collection('alerts').createIndex({ show_on_dashboard: 1, timestamp: -1 });
    await db.collection('alerts').createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });

    // Logs (7 day TTL)
    await db.collection('logs').createIndex({ timestamp: -1 });
    await db.collection('logs').createIndex({ level: 1, category: 1 });
    await db.collection('logs').createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });

    // Audit Logs (no TTL - permanent)
    await db.collection('audit_logs').createIndex({ timestamp: -1 });
    await db.collection('audit_logs').createIndex({ user_id: 1 });
    await db.collection('audit_logs').createIndex({ target_type: 1, target_id: 1 });
}

// ==============================================================================
// CAMERAS
// ==============================================================================

async function upsertCamera(cameraData) {
    const now = new Date();
    return db.collection('cameras').updateOne(
        { camera_id: cameraData.camera_id },
        {
            $set: {
                ...cameraData,
                updated_at: now
            },
            $setOnInsert: {
                created_at: now,
                counters: {
                    total_detections: 0,
                    persons: 0,
                    vehicles: 0,
                    threats: 0,
                    today_threats: 0
                }
            }
        },
        { upsert: true }
    );
}

async function updateCameraHealth(cameraId, health) {
    return db.collection('cameras').updateOne(
        { camera_id: cameraId },
        {
            $set: {
                'health.cpu': health.cpu,
                'health.memory': health.memory,
                'health.storage': health.storage,
                'health.temperature': health.temperature,
                'health.last_heartbeat': new Date(),
                status: 'LIVE'
            }
        }
    );
}

async function getAllCameras() {
    return db.collection('cameras').find({}).toArray();
}

async function getCamerasByZone(zone) {
    return db.collection('cameras').find({ zone }).toArray();
}

// ==============================================================================
// DETECTIONS
// ==============================================================================

async function insertDetection(detection) {
    const now = new Date();
    const doc = {
        detection_id: `DET_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        ...detection,
        timestamp: now,
        expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24h TTL
    };

    await db.collection('detections').insertOne(doc);

    // Increment camera counters
    const incField = detection.object_class === 'person' ? 'counters.persons'
        : detection.object_class === 'vehicle' ? 'counters.vehicles'
            : 'counters.total_detections';

    await db.collection('cameras').updateOne(
        { camera_id: detection.camera_id },
        {
            $inc: {
                'counters.total_detections': 1,
                [incField]: 1
            }
        }
    );

    return doc;
}

async function getRecentDetections(cameraId, limit = 100) {
    const query = cameraId ? { camera_id: cameraId } : {};
    return db.collection('detections')
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
}

// ==============================================================================
// QUALIFIED EVENTS
// ==============================================================================

async function createQualifiedEvent(event) {
    const now = new Date();
    const doc = {
        event_id: `EVT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        ...event,
        escalated_to_incident: false,
        created_at: now,
        timestamp: now
    };

    await db.collection('qualified_events').insertOne(doc);
    return doc;
}

// ==============================================================================
// INCIDENTS
// ==============================================================================

async function createIncident(incidentData) {
    const now = new Date();
    const doc = {
        incident_id: `INC_${Date.now()}`,
        ...incidentData,
        status: 'open',
        acknowledged: false,
        synced_to_central: false,
        created_at: now,
        updated_at: now
    };

    await db.collection('incidents').insertOne(doc);

    // Create alert
    await createAlert({
        incident_id: doc.incident_id,
        title: `${doc.priority.toUpperCase()}: ${doc.title}`,
        message: doc.summary,
        priority: doc.priority === 'critical' ? 'HIGH' : 'MEDIUM',
        type: doc.type
    });

    // Log
    await createLog('INFO', 'INCIDENT', 'Incident Created', doc.title, { incident_id: doc.incident_id });

    return doc;
}

async function acknowledgeIncident(incidentId, userId) {
    const now = new Date();
    const incident = await db.collection('incidents').findOne({ incident_id: incidentId });

    await db.collection('incidents').updateOne(
        { incident_id: incidentId },
        {
            $set: {
                status: 'investigating',
                acknowledged: true,
                acknowledged_at: now,
                assigned_to: userId,
                updated_at: now
            }
        }
    );

    // Audit log
    await createAuditLog('INCIDENT_ACKNOWLEDGED', 'incident', incidentId, userId, {
        previous_state: { status: incident.status, acknowledged: false },
        new_state: { status: 'investigating', acknowledged: true }
    });

    return true;
}

async function resolveIncident(incidentId, userId, notes) {
    const now = new Date();
    await db.collection('incidents').updateOne(
        { incident_id: incidentId },
        {
            $set: {
                status: 'resolved',
                resolved_at: now,
                resolution_notes: notes,
                updated_at: now
            }
        }
    );

    await createAuditLog('INCIDENT_RESOLVED', 'incident', incidentId, userId, {
        resolution_notes: notes
    });

    return true;
}

async function getActiveIncidents() {
    return db.collection('incidents')
        .find({ status: { $in: ['open', 'investigating'] } })
        .sort({ priority: -1, created_at: -1 })
        .toArray();
}

async function getUnsyncedIncidents() {
    return db.collection('incidents')
        .find({ synced_to_central: false, status: 'resolved' })
        .toArray();
}

// ==============================================================================
// ALERTS
// ==============================================================================

async function createAlert(alertData) {
    const now = new Date();
    const doc = {
        alert_id: `ALT_${Date.now()}`,
        ...alertData,
        acknowledged: false,
        show_on_dashboard: true,
        timestamp: now,
        expires_at: new Date(now.getTime() + 60 * 60 * 1000) // 1h TTL
    };

    await db.collection('alerts').insertOne(doc);
    return doc;
}

async function acknowledgeAlert(alertId, userId) {
    await db.collection('alerts').updateOne(
        { alert_id: alertId },
        {
            $set: {
                acknowledged: true,
                acknowledged_by: userId,
                acknowledged_at: new Date()
            }
        }
    );
}

async function getActiveAlerts(limit = 10) {
    return db.collection('alerts')
        .find({ acknowledged: false, show_on_dashboard: true })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
}

// ==============================================================================
// LOGS (UNIFIED PIPELINE - NO DUPLICATES)
// ==============================================================================

async function createLog(level, category, action, message, context = {}) {
    const now = new Date();
    const doc = {
        log_id: `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        level,
        category,
        action,
        message,
        ...context,
        timestamp: now,
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 day TTL
    };

    await db.collection('logs').insertOne(doc);
    return doc;
}

async function getRecentLogs(limit = 20) {
    return db.collection('logs')
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
}

async function getLogsByFilter(filter, limit = 100) {
    return db.collection('logs')
        .find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
}

// ==============================================================================
// AUDIT LOGS (IMMUTABLE)
// ==============================================================================

const crypto = require('crypto');

async function createAuditLog(action, targetType, targetId, userId, details = {}) {
    const now = new Date();
    const doc = {
        audit_id: `AUD_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        action,
        target_type: targetType,
        target_id: targetId,
        user_id: userId,
        ...details,
        timestamp: now
    };

    // Generate checksum for tamper detection
    doc.checksum = crypto
        .createHash('sha256')
        .update(JSON.stringify(doc))
        .digest('hex');

    await db.collection('audit_logs').insertOne(doc);
    return doc;
}

// ==============================================================================
// DASHBOARD AGGREGATIONS
// ==============================================================================

async function getDashboardStats() {
    const [cameraStats, incidentStats, alertCount] = await Promise.all([
        db.collection('cameras').aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    online: { $sum: { $cond: [{ $eq: ['$status', 'LIVE'] }, 1, 0] } },
                    threats_today: { $sum: '$counters.today_threats' },
                    total_detections: { $sum: '$counters.total_detections' }
                }
            }
        ]).toArray(),

        db.collection('incidents').aggregate([
            { $match: { status: { $in: ['open', 'investigating'] } } },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]).toArray(),

        db.collection('alerts').countDocuments({ acknowledged: false })
    ]);

    return {
        cameras: cameraStats[0] || { total: 0, online: 0, threats_today: 0 },
        incidents: incidentStats.reduce((acc, i) => ({ ...acc, [i._id]: i.count }), {}),
        active_alerts: alertCount
    };
}

// ==============================================================================
// EXPORTS
// ==============================================================================

module.exports = {
    connect,
    disconnect,

    // Cameras
    upsertCamera,
    updateCameraHealth,
    getAllCameras,
    getCamerasByZone,

    // Detections
    insertDetection,
    getRecentDetections,

    // Events
    createQualifiedEvent,

    // Incidents
    createIncident,
    acknowledgeIncident,
    resolveIncident,
    getActiveIncidents,
    getUnsyncedIncidents,

    // Alerts
    createAlert,
    acknowledgeAlert,
    getActiveAlerts,

    // Logs (unified)
    createLog,
    getRecentLogs,
    getLogsByFilter,

    // Audit
    createAuditLog,

    // Dashboard
    getDashboardStats
};

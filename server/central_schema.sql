-- ==============================================================================
-- CENTRAL DATABASE SCHEMA - Kashmir Surveillance System
-- PostgreSQL - City HQ Reporting Database
-- ==============================================================================

-- Station Registry
CREATE TABLE IF NOT EXISTS stations (
    station_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    ward VARCHAR(50),
    contact_number VARCHAR(20),
    ip_gateway VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Incident Reports (Synced from Edge - Immutable)
CREATE TABLE IF NOT EXISTS incident_reports (
    id SERIAL PRIMARY KEY,
    edge_incident_id VARCHAR(50) UNIQUE NOT NULL,
    station_id VARCHAR(50) REFERENCES stations(station_id),
    
    -- Incident Details
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'resolved',
    
    -- Source
    camera_id VARCHAR(50),
    detection_count INTEGER DEFAULT 0,
    
    -- Evidence
    evidence_url TEXT,
    snapshot_count INTEGER DEFAULT 0,
    
    -- Timeline
    incident_created_at TIMESTAMP NOT NULL,
    incident_resolved_at TIMESTAMP,
    resolution_notes TEXT,
    
    -- Sync Metadata
    synced_at TIMESTAMP DEFAULT NOW(),
    sync_source VARCHAR(100)
);

-- Daily Statistics (Aggregated from Edge)
CREATE TABLE IF NOT EXISTS daily_statistics (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    station_id VARCHAR(50) REFERENCES stations(station_id),
    
    -- Detection Metrics
    total_detections INTEGER DEFAULT 0,
    person_detections INTEGER DEFAULT 0,
    vehicle_detections INTEGER DEFAULT 0,
    
    -- Event Metrics
    qualified_events INTEGER DEFAULT 0,
    incidents_opened INTEGER DEFAULT 0,
    incidents_resolved INTEGER DEFAULT 0,
    
    -- Threat Metrics
    critical_threats INTEGER DEFAULT 0,
    high_threats INTEGER DEFAULT 0,
    medium_threats INTEGER DEFAULT 0,
    
    -- Performance
    avg_response_time_seconds DECIMAL(10,2),
    camera_uptime_percentage DECIMAL(5,2),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(stat_date, station_id)
);

-- Camera Statistics (Daily per camera)
CREATE TABLE IF NOT EXISTS camera_statistics (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    camera_id VARCHAR(50) NOT NULL,
    station_id VARCHAR(50) REFERENCES stations(station_id),
    
    -- Availability
    uptime_percentage DECIMAL(5,2),
    downtime_minutes INTEGER DEFAULT 0,
    
    -- Detections
    total_detections INTEGER DEFAULT 0,
    person_detections INTEGER DEFAULT 0,
    vehicle_detections INTEGER DEFAULT 0,
    threat_detections INTEGER DEFAULT 0,
    
    -- Recording
    recording_hours DECIMAL(5,2),
    storage_used_gb DECIMAL(10,2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(stat_date, camera_id)
);

-- Audit Trail (Legal Compliance)
CREATE TABLE IF NOT EXISTS audit_trail (
    id SERIAL PRIMARY KEY,
    audit_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Action
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(50),
    
    -- Actor
    user_id VARCHAR(50),
    username VARCHAR(100),
    station_id VARCHAR(50),
    ip_address VARCHAR(50),
    
    -- State Changes
    previous_state JSONB,
    new_state JSONB,
    
    -- Integrity
    timestamp TIMESTAMP NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    
    -- Sync
    synced_at TIMESTAMP DEFAULT NOW()
);

-- Recording Archives (Metadata only)
CREATE TABLE IF NOT EXISTS recording_archives (
    id SERIAL PRIMARY KEY,
    recording_id VARCHAR(100) UNIQUE NOT NULL,
    camera_id VARCHAR(50) NOT NULL,
    station_id VARCHAR(50) REFERENCES stations(station_id),
    
    -- Recording Details
    recording_date DATE NOT NULL,
    duration_seconds INTEGER,
    file_size_mb DECIMAL(10,2),
    storage_path TEXT NOT NULL,
    
    -- Integrity
    checksum_sha256 VARCHAR(64),
    verified BOOLEAN DEFAULT FALSE,
    
    -- Retention
    retention_days INTEGER DEFAULT 30,
    delete_after DATE,
    deleted BOOLEAN DEFAULT FALSE,
    
    -- Linked Incidents
    incident_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_incidents_date ON incident_reports(incident_created_at);
CREATE INDEX IF NOT EXISTS idx_incidents_station ON incident_reports(station_id);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incident_reports(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incident_reports(type);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_statistics(stat_date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_station ON daily_statistics(station_id);

CREATE INDEX IF NOT EXISTS idx_camera_stats_date ON camera_statistics(stat_date);
CREATE INDEX IF NOT EXISTS idx_camera_stats_camera ON camera_statistics(camera_id);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_trail(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_trail(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_recordings_camera ON recording_archives(camera_id);
CREATE INDEX IF NOT EXISTS idx_recordings_date ON recording_archives(recording_date);

-- ==============================================================================
-- VIEWS FOR REPORTS
-- ==============================================================================

-- Daily Summary View
CREATE OR REPLACE VIEW daily_summary AS
SELECT 
    ds.stat_date,
    s.name as station_name,
    ds.total_detections,
    ds.incidents_opened,
    ds.incidents_resolved,
    ds.critical_threats,
    ds.avg_response_time_seconds,
    ds.camera_uptime_percentage
FROM daily_statistics ds
JOIN stations s ON ds.station_id = s.station_id
ORDER BY ds.stat_date DESC, s.name;

-- Incident Report View
CREATE OR REPLACE VIEW incident_summary AS
SELECT 
    ir.edge_incident_id,
    ir.title,
    ir.priority,
    ir.type,
    ir.camera_id,
    s.name as station_name,
    ir.incident_created_at,
    ir.incident_resolved_at,
    EXTRACT(EPOCH FROM (ir.incident_resolved_at - ir.incident_created_at)) / 60 as resolution_time_minutes
FROM incident_reports ir
JOIN stations s ON ir.station_id = s.station_id
ORDER BY ir.incident_created_at DESC;

-- ==============================================================================
-- SAMPLE DATA
-- ==============================================================================

-- Insert default stations
INSERT INTO stations (station_id, name, zone, ward) VALUES
    ('STATION_SRINAGAR', 'Srinagar Central Command', 'SRINAGAR', 'Central'),
    ('STATION_BUDGAM', 'Budgam District HQ', 'BUDGAM', 'Main'),
    ('STATION_BARAMULLA', 'Baramulla Sector', 'BARAMULLA', 'Sector-A'),
    ('STATION_KUPWARA', 'Kupwara Border Command', 'KUPWARA', 'Border'),
    ('STATION_ANANTNAG', 'Anantnag District', 'ANANTNAG', 'Main')
ON CONFLICT (station_id) DO NOTHING;

-- ==============================================================================
-- FUNCTIONS
-- ==============================================================================

-- Function to insert daily statistics
CREATE OR REPLACE FUNCTION upsert_daily_stats(
    p_date DATE,
    p_station_id VARCHAR,
    p_total_detections INTEGER,
    p_incidents_opened INTEGER,
    p_incidents_resolved INTEGER,
    p_critical_threats INTEGER
) RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_statistics (
        stat_date, station_id, total_detections, 
        incidents_opened, incidents_resolved, critical_threats
    ) VALUES (
        p_date, p_station_id, p_total_detections,
        p_incidents_opened, p_incidents_resolved, p_critical_threats
    )
    ON CONFLICT (stat_date, station_id) DO UPDATE SET
        total_detections = EXCLUDED.total_detections,
        incidents_opened = EXCLUDED.incidents_opened,
        incidents_resolved = EXCLUDED.incidents_resolved,
        critical_threats = EXCLUDED.critical_threats;
END;
$$ LANGUAGE plpgsql;

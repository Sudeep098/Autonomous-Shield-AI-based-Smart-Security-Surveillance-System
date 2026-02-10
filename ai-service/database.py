"""
Database Layer - Kashmir Surveillance System
Complete Schema with ALL Tables
SQLite for Edge, PostgreSQL for Production
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, JSON, Boolean, Text
from datetime import datetime
import os

# Configuration - MySQL by default, fallback to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./autonomous_shield.db")

# Engine
engine = create_async_engine(
    DATABASE_URL, 
    echo=False,
    future=True
)

# Session Factory
AsyncSessionLocal = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

Base = declarative_base()

# ==============================================================================
# CAMERAS - All 60 cameras tracked
# ==============================================================================

class Camera(Base):
    """Camera registry for 3D tactical map"""
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String, unique=True, index=True)  # CAM_SRG_001
    name = Column(String, nullable=False)
    zone = Column(String, index=True)  # SRINAGAR, BUDGAM, etc.
    
    # 3D Position
    latitude = Column(Float)
    longitude = Column(Float)
    altitude = Column(Float)
    heading = Column(Float)  # Direction camera is facing
    
    # Status
    status = Column(String, default="offline")  # LIVE, OFFLINE, MAINTENANCE
    is_primary = Column(Boolean, default=False)  # Main demo camera
    
    # Connection
    ip_address = Column(String)
    stream_url = Column(String)
    
    # Health Metrics
    cpu_usage = Column(Float, default=0)
    memory_usage = Column(Float, default=0)
    storage_usage = Column(Float, default=0)
    temperature = Column(Float, default=0)
    last_heartbeat = Column(DateTime, default=datetime.utcnow)
    
    # Counters (daily reset)
    total_detections = Column(Integer, default=0)
    person_detections = Column(Integer, default=0)
    vehicle_detections = Column(Integer, default=0)
    threat_detections = Column(Integer, default=0)
    
    # Recording
    recording_active = Column(Boolean, default=False)
    recording_path = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ==============================================================================
# DETECTIONS - Every object detected by AI
# ==============================================================================

class Detection(Base):
    """Raw AI detection events - ALL objects"""
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    detection_id = Column(String, unique=True, index=True)
    camera_id = Column(String, ForeignKey("cameras.camera_id"), index=True)
    frame_id = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Detection Data
    object_class = Column(String, index=True)  # person, vehicle, bag, etc.
    confidence = Column(Float)
    bbox_x = Column(Integer)
    bbox_y = Column(Integer)
    bbox_width = Column(Integer)
    bbox_height = Column(Integer)
    bbox_normalized = Column(JSON)  # [x, y, w, h] as percentages
    
    # Classification
    threat_level = Column(String, default="normal", index=True)  # normal, suspicious, critical
    is_qualified = Column(Boolean, default=False)  # Passed threshold?
    
    # Face Recognition (if person)
    face_matched = Column(Boolean, default=False)
    suspect_id = Column(String)
    suspect_name = Column(String)
    match_score = Column(Float)

# ==============================================================================
# SUSPICIOUS EVENTS - Detections that need attention
# ==============================================================================

class SuspiciousEvent(Base):
    """Events that passed suspicion threshold"""
    __tablename__ = "suspicious_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True)
    detection_id = Column(String, ForeignKey("detections.detection_id"))
    camera_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Classification
    suspicion_type = Column(String)  # LOITERING, INTRUSION, CROWD, UNUSUAL_BEHAVIOR
    confidence = Column(Float)
    threat_level = Column(String)  # suspicious, critical
    
    # Evidence
    snapshot_path = Column(String)
    video_clip_path = Column(String)
    
    # Escalation
    escalated = Column(Boolean, default=False)
    incident_id = Column(String)

# ==============================================================================
# INCIDENTS - Confirmed security events
# ==============================================================================

class Incident(Base):
    """Confirmed incidents requiring action"""
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    summary = Column(Text)
    
    # Classification
    priority = Column(String, index=True)  # critical, high, medium, low
    type = Column(String)  # SUSPECT_DETECTION, WEAPON, INTRUSION, etc.
    status = Column(String, default="open", index=True)  # open, investigating, resolved
    
    # Source
    camera_id = Column(String)
    event_id = Column(String)
    detection_count = Column(Integer, default=1)
    
    # Evidence
    snapshot_paths = Column(JSON)  # List of image paths
    video_clip_paths = Column(JSON)  # List of video paths
    
    # Assignment
    assigned_to = Column(String)
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime)
    
    # Timeline
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime)
    resolution_notes = Column(Text)
    
    # Sync
    synced_to_central = Column(Boolean, default=False)
    sync_timestamp = Column(DateTime)

# ==============================================================================
# ALERTS - Real-time notifications
# ==============================================================================

class Alert(Base):
    """Dashboard alerts"""
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, unique=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.incident_id"))
    
    title = Column(String, nullable=False)
    message = Column(Text)
    priority = Column(String)  # HIGH, MEDIUM, LOW
    type = Column(String)  # SUSPECT_ALERT, WEAPON_ALERT, etc.
    
    # Status
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String)
    acknowledged_at = Column(DateTime)
    show_on_dashboard = Column(Boolean, default=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

# ==============================================================================
# LOGS - System, Detection, User, Sync logs
# ==============================================================================

class Log(Base):
    """Unified logging - NO duplicates"""
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(String, unique=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Classification
    level = Column(String, index=True)  # INFO, WARN, ERROR, SUCCESS
    category = Column(String, index=True)  # SYSTEM, DETECTION, USER, SYNC, ERROR
    
    # Content
    action = Column(String, nullable=False)
    message = Column(Text)
    module = Column(String)  # vision_engine, api, sync, etc.
    
    # Context
    user_id = Column(String)
    camera_id = Column(String)
    incident_id = Column(String)
    
    # Extra data
    meta = Column(JSON)

# ==============================================================================
# RECORDINGS - Video archive metadata
# ==============================================================================

class Recording(Base):
    """Video recording references (files stored on disk)"""
    __tablename__ = "recordings"

    id = Column(Integer, primary_key=True, index=True)
    recording_id = Column(String, unique=True, index=True)
    camera_id = Column(String, index=True)
    
    # File Info
    file_path = Column(String, nullable=False)
    file_size_mb = Column(Float)
    duration_seconds = Column(Integer)
    format = Column(String, default="mp4")
    
    # Time Range
    started_at = Column(DateTime, index=True)
    ended_at = Column(DateTime)
    
    # Integrity
    checksum_sha256 = Column(String)
    verified = Column(Boolean, default=False)
    
    # Retention
    retention_days = Column(Integer, default=30)
    delete_after = Column(DateTime)
    deleted = Column(Boolean, default=False)
    
    # Linked Incidents
    incident_ids = Column(JSON)  # List of incident IDs

# ==============================================================================
# SUSPECTS - Face recognition targets
# ==============================================================================

class Suspect(Base):
    """Known suspects for face recognition"""
    __tablename__ = "suspects"

    id = Column(Integer, primary_key=True, index=True)
    suspect_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    
    # Image
    image_path = Column(String, nullable=False)
    embedding = Column(JSON)  # Face embedding vector
    
    # Status
    active = Column(Boolean, default=True)
    priority = Column(String, default="high")  # critical, high, medium
    
    # Info
    description = Column(Text)
    last_seen = Column(DateTime)
    last_seen_camera = Column(String)
    total_matches = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ==============================================================================
# SETTINGS - System configuration
# ==============================================================================

class Setting(Base):
    """System settings and configuration"""
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(Text)
    type = Column(String)  # string, number, boolean, json
    category = Column(String)  # general, detection, alerts, sync, ui
    description = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ==============================================================================
# USERS - Operator accounts
# ==============================================================================

class User(Base):
    """System users"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String)
    password_hash = Column(String)
    
    # Role
    role = Column(String)  # admin, supervisor, operator, viewer
    station_id = Column(String)
    
    # Status
    active = Column(Boolean, default=True)
    last_login = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)

# ==============================================================================
# AUDIT LOGS - Tamper-proof action trail
# ==============================================================================

class AuditLog(Base):
    """Immutable audit trail for legal compliance"""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(String, unique=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Action
    action = Column(String, nullable=False)  # INCIDENT_CREATED, ALERT_ACKNOWLEDGED, etc.
    target_type = Column(String)  # incident, alert, user, setting
    target_id = Column(String)
    
    # Actor
    user_id = Column(String)
    username = Column(String)
    ip_address = Column(String)
    
    # State Changes
    previous_state = Column(JSON)
    new_state = Column(JSON)
    
    # Integrity
    checksum = Column(String)  # SHA-256 for tamper detection

# ==============================================================================
# DAILY STATS - Aggregated statistics
# ==============================================================================

class DailyStat(Base):
    """Daily aggregated statistics"""
    __tablename__ = "daily_stats"

    id = Column(Integer, primary_key=True, index=True)
    stat_date = Column(String, index=True)  # YYYY-MM-DD
    camera_id = Column(String, index=True)  # NULL for system-wide
    
    # Detection counts
    total_detections = Column(Integer, default=0)
    person_detections = Column(Integer, default=0)
    vehicle_detections = Column(Integer, default=0)
    
    # Event counts
    suspicious_events = Column(Integer, default=0)
    critical_events = Column(Integer, default=0)
    incidents_opened = Column(Integer, default=0)
    incidents_resolved = Column(Integer, default=0)
    
    # Performance
    avg_response_time = Column(Float)
    camera_uptime_percent = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow)

# ==============================================================================
# UTILITIES
# ==============================================================================

async def init_db():
    """Initialize all database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database initialized with ALL tables")

async def get_db():
    """Dependency for FastAPI"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Helper to generate unique IDs
def generate_id(prefix: str) -> str:
    import time
    import random
    return f"{prefix}_{int(time.time())}_{random.randint(1000, 9999)}"

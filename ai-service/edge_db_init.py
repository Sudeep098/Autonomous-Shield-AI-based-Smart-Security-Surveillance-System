import pymongo
from datetime import datetime

# Configuration
EDGE_DB_URI = "mongodb://localhost:27017/"
DB_NAME = "surveillance_edge_db"

def init_edge_db():
    print(f"🔌 Connecting to Edge Database: {EDGE_DB_URI}...")
    try:
        client = pymongo.MongoClient(EDGE_DB_URI, serverSelectionTimeoutMS=2000)
        client.server_info() # Trigger connection check
        db = client[DB_NAME]
        print(f"✅ Connected to MongoDB: {DB_NAME}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("💡 Ensure MongoDB is running locally (mongod)")
        return

    # ==============================================================================
    # 1. CAMERAS COLLECTION
    # ==============================================================================
    print("🛠️  Setting up collection: cameras")
    if "cameras" not in db.list_collection_names():
        db.create_collection("cameras")
    
    # Indexes
    db.cameras.create_index("station_id")
    db.cameras.create_index("status")
    print("   - Indexes created: station_id, status")

    # ==============================================================================
    # 2. DETECTIONS COLLECTION (Capped / TTL)
    # ==============================================================================
    print("🛠️  Setting up collection: detections")
    # TTL Index: Expire after 24 hours (86400 seconds)
    db.detections.create_index("timestamp", expireAfterSeconds=86400)
    db.detections.create_index("camera_id")
    print("   - TTL Index created: 24 hours")

    # ==============================================================================
    # 3. INCIDENTS COLLECTION
    # ==============================================================================
    print("🛠️  Setting up collection: incidents")
    db.incidents.create_index([("status", pymongo.ASCENDING)])
    db.incidents.create_index([("sync_status", pymongo.ASCENDING)])
    db.incidents.create_index([("start_time", pymongo.DESCENDING)])
    print("   - Indexes created: status, sync_status, start_time")

    # ==============================================================================
    # 4. ALERTS COLLECTION
    # ==============================================================================
    print("🛠️  Setting up collection: alerts")
    db.alerts.create_index("incident_id")
    db.alerts.create_index("status")
    db.alerts.create_index("created_at")
    print("   - Indexes created: incident_id, status, created_at")

    # ==============================================================================
    # 5. AUDIT LOGS COLLECTION
    # ==============================================================================
    print("🛠️  Setting up collection: audit_logs")
    # TTL Index: 90 days
    db.audit_logs.create_index("timestamp", expireAfterSeconds=90 * 86400)
    print("   - TTL Index created: 90 days")

    print(f"\n✅ Edge Database ({DB_NAME}) initialized successfully according to architecture.")

if __name__ == "__main__":
    init_edge_db()

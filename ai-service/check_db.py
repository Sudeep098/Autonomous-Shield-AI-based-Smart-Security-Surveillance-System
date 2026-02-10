"""
Database Verification Script
Run this to check if your database is working correctly.
"""

import sqlite3
import os
from datetime import datetime

DB_PATH = "autonomous_shield.db"

def check_database():
    print("=" * 60)
    print("🔍 DATABASE VERIFICATION")
    print("=" * 60)
    
    # Check if file exists
    if not os.path.exists(DB_PATH):
        print(f"❌ Database file not found: {DB_PATH}")
        print("   The database will be created when the AI service starts.")
        return False
    
    file_size = os.path.getsize(DB_PATH) / 1024  # KB
    print(f"✅ Database file found: {DB_PATH}")
    print(f"   File size: {file_size:.2f} KB")
    print()
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [t[0] for t in cursor.fetchall()]
        print(f"📋 Tables found: {len(tables)}")
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            status = "✅" if count > 0 else "○"
            print(f"   {status} {table}: {count} records")
        
        print()
        
        # Show recent detections
        if 'detections' in tables:
            print("📹 Recent Detections:")
            cursor.execute("SELECT detection_id, object_class, confidence, threat_level FROM detections ORDER BY id DESC LIMIT 5")
            dets = cursor.fetchall()
            if dets:
                for det in dets:
                    print(f"   {det[1]} (conf: {det[2]:.2f}) - {det[3]}")
            else:
                print("   No detections recorded yet.")
        
        print()
        
        # Show recent alerts
        if 'alerts' in tables:
            print("🚨 Recent Alerts:")
            cursor.execute("SELECT alert_id, title, priority FROM alerts ORDER BY id DESC LIMIT 5")
            alerts = cursor.fetchall()
            if alerts:
                for alert in alerts:
                    print(f"   [{alert[2]}] {alert[1][:50]}")
            else:
                print("   No alerts recorded yet.")
        
        print()
        
        # Show suspects
        if 'suspects' in tables:
            print("👤 Registered Suspects:")
            cursor.execute("SELECT suspect_id, name, total_matches FROM suspects")
            suspects = cursor.fetchall()
            if suspects:
                for s in suspects:
                    print(f"   {s[1]} (matches: {s[2]})")
            else:
                print("   No suspects registered yet.")
        
        conn.close()
        
        print()
        print("=" * 60)
        print("✅ DATABASE IS WORKING CORRECTLY")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

if __name__ == "__main__":
    check_database()

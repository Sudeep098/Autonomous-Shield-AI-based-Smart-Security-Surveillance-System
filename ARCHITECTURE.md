
# Defense Surveillance System - Architecture & Backend Design

## 1. System Overview
The Defense Surveillance System (DSS) is a comprehensive situational awareness platform designed for the Indian borders. It integrates data from various sensors (cameras, drones, ground sensors) into a unified GIS-enabled Tactical Dashboard.

## 2. Technology Stack

### Frontend (Tactical Dashboard)
*   **Framework**: React (Vite) + TypeScript
*   **State Management**: TanStack Query (Server State), Zustand (Client State)
*   **GIS Engine**: Leaflet.js (Open-Source) with `react-leaflet`
*   **Visualization**: D3.js / Recharts for telemetry, Leaflet.heat for thermal data.
*   **Styling**: Tailwind CSS + Custom "Tactical Dark" Theme.

### Backend (Command Center API)
*   **Runtime**: Node.js (v20+)
*   **Framework**: Express.js
*   **API Protocol**: REST + WebSockets (for real-time alert broadcasting).
*   **Authentication**: Passport.js (JWT / Session-based).

### Database (Data Persistence)
*   **Primary DB**: PostgreSQL 16
*   **Spatial Extension**: PostGIS (Required for geographical queries).
*   **ORM**: Drizzle ORM (Type-safe SQL schemas).

## 3. Database Schema Design (PostGIS Optimized)

### `locations` (Strategic Points)
*   `id`: SERIAL PRIMARY KEY
*   `name`: TEXT (e.g., "Outpost Alpha")
*   `type`: ENUM ('base', 'bunker', 'sensor_tower')
*   `geom`: GEOMETRY(POINT, 4326) -- Spatial Index
*   `elevation`: INTEGER

### `zones` (Geofences)
*   `id`: SERIAL PRIMARY KEY
*   `name`: TEXT
*   `risk_level`: ENUM ('safe', 'watch', 'high_risk')
*   `geom`: GEOMETRY(POLYGON, 4326)

### `incidents` (Events)
*   `id`: SERIAL PRIMARY KEY
*   `type`: TEXT ('intrusion', 'fire', 'movement')
*   `priority`: ENUM ('critical', 'high', 'medium')
*   `geom`: GEOMETRY(POINT, 4326)
*   `timestamp`: TIMESTAMPTZ

### `devices` (Assets)
*   `id`: SERIAL PRIMARY KEY
*   `geom`: GEOMETRY(POINT, 4326) -- Real-time location
*   `telemetry`: JSONB (Battery, Signal, Status)

## 4. API Endpoints

### GIS & Terrain
*   `GET /api/gis/zones` - Fetch all tactical zones (GeoJSON).
*   `GET /api/gis/heatmap` - Fetch thermal activity points.
*   `GET /api/gis/route?start=lat,lng&end=lat,lng` - Calc optimal patrol path (uses Bhuvan/OSRM).

### Surveillance
*   `GET /api/devices` - List all active assets.
*   `POST /api/incidents` - Report a new threat.

## 5. Bhuvan (ISRO) Integration Strategy
*   **Service**: `Bhuvan 2D/3D Raster Services`
*   **Integration**:
    *   Since Bhuvan APIs are restricted/govt-only, we implement a **Proxy Layer** in Express (`/api/proxy/bhuvan`).
    *   The frontend requests tiles/data from our backend.
    *   Our backend authenticates with Bhuvan (simulated for demo) and forwards the request.
    *   **Fallback**: If Bhuvan is unreachable, fallback to OSM/ESRI tiles.

## 6. Data Flow
1.  **Ingestion**: Field sensors send MQTT packets to the **Ingestion Service**.
2.  **Processing**: Node.js parses coordinates, checks against `zones` (Point-in-Polygon check via PostGIS).
3.  **Alerting**: If a device enters a 'high_risk' zone, an `alert` is generated.
4.  **Storage**: Valid data is written to PostgreSQL.
5.  **Visualization**: The React frontend polls (or receives WS push) for updates and re-renders markers on the Leaflet Map.

## 7. Security
*   **Air-Gapped Design Compatible**: The system can run offline with local map tiles.
*   **RBAC**: 'Commander' (Read/Write), 'Analyst' (Read-Only).
*   **Encryption**: AES-256 for all stored telemetry.

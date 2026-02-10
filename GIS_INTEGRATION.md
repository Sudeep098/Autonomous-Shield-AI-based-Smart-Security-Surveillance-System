
# GEOAPIFY & BHUVAN INTEGRATION ARCHITECTURE

## 1. Overview
We are integrating two powerful GIS providers to create a comprehensive Indian Defense Surveillance System:
1.  **Geoapify**: General-purpose "Civilian" layer (Maps, Routing, Reverse Geocoding).
2.  **Bhuvan (ISRO)**: "Tactical" layer (Terrain, LULC Stats, Official Village Data).

## 2. Security & Data Flow
*   **Zero-Exposure**: Frontend NEVER sees API keys.
*   **Proxy Pattern**: All GIS requests go through our Node.js Backend (`/api/gis/...`).
*   **Caching**: Common requests (like district boundaries) are cached in-memory/DB to save credits.

## 3. Backend Implementation (Node.js/Express)

### A. Environment Variables (`.env`)
```env
GEOAPIFY_KEY=your_key_here
BHUVAN_TOKEN=your_token_here
```

### B. Service Modules
*   `server/services/geoapify.ts` -> Handles HTTP calls to `api.geoapify.com`.
*   `server/services/bhuvan.ts` -> Handles specific WMS/WFS calls to Bhuvan servers.

### C. API Endpoints

| Purpose | Method | Endpoint | Provider |
| :--- | :--- | :--- | :--- |
| **Basemap** | GET | `/api/gis/tiles/{z}/{x}/{y}.png` | Geoapify (Proxy) |
| **Search** | GET | `/api/gis/search?q=Delhi` | Geoapify (Geocoding) |
| **Routing** | POST | `/api/gis/route` | Geoapify (Routing) |
| **LULC Stats** | GET | `/api/gis/lulc?lat=..&lng=..` | Bhuvan (WMS Feature Info) |
| **Elevation** | GET | `/api/gis/elevation` | Bhuvan (DEM) |
| **Strategic** | GET | `/api/gis/village-info` | Bhuvan (Proprietary) |

## 4. Frontend Integration (Leaflet)

### Layer Management
*   **Base Layer**: Fetches tiles from *our* backend (`/api/gis/tiles/...`).
*   **Overlays**:
    *   `Risk Zones`: GeoJSON from local DB.
    *   `LULC`: WMS Overlay from Bhuvan (proxied).
    *   `Route`: Polyline drawn from routing API response.

### Visualization Strategy
*   **Heatmaps**: Generated client-side using Lat/Lng array from backend.
*   **Isochrones**: "Reachability" polygons from Geoapify to show potential movement range of threats.

## 5. Implementation Steps
1.  **Install SDKs**: (None needed on frontend, plain REST).
2.  **Backend Proxy**: Set up `express-http-proxy` or custom `fetch` handlers.
3.  **Frontend Config**: Point Leaflet `TileLayer` to `localhost:5000/api/gis/tiles`.


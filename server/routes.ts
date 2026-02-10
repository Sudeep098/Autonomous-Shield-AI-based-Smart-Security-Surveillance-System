import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Alerts
  app.get(api.alerts.list.path, async (req, res) => {
    const alerts = await storage.getAlerts();
    res.json(alerts);
  });

  app.get("/api/stats", async (req, res) => {
    const alertsData = await storage.getAlerts();
    const totalDetections = alertsData.length;
    const criticalAlerts = alertsData.filter(a => a.priority === 'CRITICAL' || a.priority === 'HIGH').length;
    res.json({
      totalDetections,
      criticalAlerts
    });
  });

  // Temporary Admin Route for Demo
  app.post("/api/admin/clear", async (req, res) => {
    const { db } = await import("./db");
    const { alerts } = await import("./db/schema");
    const { sql } = await import("drizzle-orm");

    try {
      await db.delete(alerts);
      // await db.execute(sql`TRUNCATE TABLE alerts RESTART IDENTITY`);
      res.json({ message: "Alerts cleared for demo" });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });



  app.post(api.alerts.create.path, async (req, res) => {
    try {
      console.log("POST /api/alerts received:", JSON.stringify(req.body));
      const input = api.alerts.create.input.parse(req.body);
      const alert = await storage.createAlert(input);
      console.log("Alert created:", alert.id);
      res.status(201).json(alert);
    } catch (err) {
      console.error("POST /api/alerts failed:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.issues[0].message,
          field: err.issues[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.alerts.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const input = api.alerts.update.input.parse(req.body);
      const alert = await storage.updateAlert(id, input);
      res.json(alert);
    } catch (err) {
      res.status(400).json({ message: "Invalid input or ID" });
    }
  });

  // Devices
  app.get(api.devices.list.path, async (req, res) => {
    const devices = await storage.getDevices();
    res.json(devices);
  });

  app.get(api.devices.get.path, async (req, res) => {
    const device = await storage.getDevice(parseInt(req.params.id as string));
    if (!device) return res.status(404).json({ message: "Device not found" });
    res.json(device);
  });

  // Incidents
  app.get(api.incidents.list.path, async (req, res) => {
    const incidents = await storage.getIncidents();
    res.json(incidents);
  });

  app.get(api.incidents.get.path, async (req, res) => {
    const incident = await storage.getIncident(parseInt(req.params.id as string));
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    res.json(incident);
  });

  // Logs
  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  // --- TELEMETRY SIMULATION ENDPOINT ---
  app.post("/api/telemetry", async (req, res) => {
    const telemetry = req.body;
    // console.log("Received telemetry:", JSON.stringify(telemetry).substring(0, 100) + "...");

    // Broadcast to WebSocket clients
    const { broadcastTelemetry } = await import("./index");
    broadcastTelemetry(telemetry);

    res.json({ status: "ok" });
  });

  // --- GIS PROXY ROUTES (Geoapify & Bhuvan) ---

  // 1. Map Tiles (Geoapify)
  // GET /api/gis/tiles/:z/:x/:y
  app.get("/api/gis/tiles/:z/:x/:y", async (req, res) => {
    try {
      const { geoapifyService } = await import("./services/geoapify");
      const { z, x, y } = req.params;
      const tileData = await geoapifyService.getTile(z, x, y);
      res.setHeader('Content-Type', 'image/png');
      res.send(tileData);
    } catch (e) {
      console.error("Tile Error", e);
      res.status(500).send("Tile Error");
    }
  });

  // 2. Search (Geoapify)
  app.get("/api/gis/search", async (req, res) => {
    try {
      const { geoapifyService } = await import("./services/geoapify");
      const query = req.query.q as string;
      if (!query) return res.status(400).json({ error: "Missing query parameter 'q'" });
      const data = await geoapifyService.search(query);
      res.json(data);
    } catch (e) {
      console.error("Search Route Error:", e);
      res.status(500).json({ error: "Search failed", details: e instanceof Error ? e.message : String(e) });
    }
  });

  // 3. Routing (Geoapify)
  // GET /api/gis/route?start=lat,lon&end=lat,lon
  app.get("/api/gis/route", async (req, res) => {
    try {
      const { geoapifyService } = await import("./services/geoapify");
      const start = (req.query.start as string).split(',');
      const end = (req.query.end as string).split(',');

      if (start.length !== 2 || end.length !== 2) return res.status(400).send("Invalid format");

      const data = await geoapifyService.route(
        { lat: parseFloat(start[0]), lon: parseFloat(start[1]) },
        { lat: parseFloat(end[0]), lon: parseFloat(end[1]) }
      );
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Routing Failed" });
    }
  });

  // 4. Bhuvan Services (Official ISRO Data)
  const { bhuvanService } = await import("./services/bhuvan");

  // Village / General Info
  app.get("/api/gis/bhuvan/info", async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const info = await bhuvanService.reverseGeocodeVillage(lat, lon);
    res.json(info);
  });

  // Official Routing
  app.get("/api/gis/bhuvan/route", async (req, res) => {
    try {
      const start = (req.query.start as string).split(',');
      const end = (req.query.end as string).split(',');

      if (start.length !== 2 || end.length !== 2) return res.status(400).send("Invalid format");

      const data = await bhuvanService.getRoute(
        { lat: parseFloat(start[0]), lon: parseFloat(start[1]) },
        { lat: parseFloat(end[0]), lon: parseFloat(end[1]) }
      );
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Bhuvan Route Failed" });
    }
  });

  // LULC Analysis
  app.get("/api/gis/bhuvan/lulc", async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const data = await bhuvanService.getLulcAnalysis(lat, lon);
    res.json(data);
  });

  // Geoid Elevation
  app.get("/api/gis/bhuvan/elevation", async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const data = await bhuvanService.getElevation(lat, lon);
    res.json(data);
  });

  // Bhuvan: Satellite WMS Proxy (Bypasses CORS)
  app.get("/api/gis/bhuvan/wms", async (req, res) => {
    const bhuvanUrl = "https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms";
    try {
      const { bhuvanService } = await import("./services/bhuvan"); // Lazy load if needed or just use axios directly
      const axios = (await import("axios")).default;

      const response = await axios.get(bhuvanUrl, {
        params: req.query,
        responseType: 'arraybuffer'
      });

      res.set('Content-Type', response.headers['content-type']);
      res.send(response.data);
    } catch (e) {
      console.warn("Bhuvan WMS Proxy Error");
      res.status(502).send("Bhuvan WMS Error");
    }
  });

  // Bhuvan: Village Search
  app.get('/api/gis/bhuvan/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Missing query" });
    try {
      const data = await bhuvanService.searchVillage(String(q));
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Bhuvan Search Error" });
    }
  });

  // Bhuvan: Reverse Geocode (Village Info)
  app.get('/api/gis/bhuvan/reverse', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "Missing coordinates" });
    try {
      const data = await bhuvanService.reverseGeocodeVillage(Number(lat), Number(lon));
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Bhuvan Reverse Geo Error" });
    }
  });

  // Suspect Detection Database (MongoDB)
  app.post("/api/suspects", async (req, res) => {
    try {
      const { Suspect } = await import("./models/suspect");
      const suspectData = {
        suspectName: req.body.object || req.body.suspectName || 'UNKNOWN',
        detectionId: req.body.detection_id || req.body.detectionId || `det_${Date.now()}`,
        confidence: parseFloat(req.body.confidence) || 0,
        threatLevel: req.body.priority === 'CRITICAL' ? 'critical' :
          req.body.priority === 'HIGH' ? 'suspicious' : 'normal',
        detectedAt: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
        location: {
          cameraId: req.body.cameraId || 'CAM_SRG_001',
          name: req.body.location || 'Unknown Location',
          coordinates: req.body.coordinates || { lat: 0, lng: 0 }
        },
        metadata: {
          bbox: req.body.bbox,
          alertId: req.body.alert_id,
          description: req.body.description
        }
      };

      const suspect = new Suspect(suspectData);
      await suspect.save();
      console.log('✅ Suspect saved to MongoDB:', suspect.detectionId);
      res.status(201).json(suspect);
    } catch (error: any) {
      console.error('❌ Error saving suspect:', error);
      // Don't fail the request if MongoDB is down
      res.status(200).json({ message: 'Alert received (MongoDB unavailable)', error: error.message });
    }
  });

  app.get("/api/suspects", async (req, res) => {
    try {
      const { Suspect } = await import("./models/suspect");
      const { threatLevel, limit = 100 } = req.query;

      const query = threatLevel ? { threatLevel } : {};
      const suspects = await Suspect.find(query)
        .sort({ detectedAt: -1 })
        .limit(parseInt(limit as string))
        .lean();

      res.json(suspects);
    } catch (error: any) {
      console.error('❌ Error fetching suspects:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/suspects/:id", async (req, res) => {
    try {
      const { Suspect } = await import("./models/suspect");
      const suspect = await Suspect.findById(req.params.id).lean();

      if (!suspect) {
        return res.status(404).json({ error: 'Suspect not found' });
      }

      res.json(suspect);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;


}

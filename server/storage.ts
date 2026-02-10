// import { db } from "./db"; // DB disabled for local run
import {
  type Alert, type InsertAlert,
  type Device, type InsertDevice,
  type Incident, type InsertIncident,
  type Log, type InsertLog
} from "@shared/schema";
// import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Alerts
  getAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, updates: Partial<InsertAlert>): Promise<Alert>;

  // Devices
  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;

  // Incidents
  getIncidents(): Promise<Incident[]>;
  getIncident(id: number): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;

  // Logs
  getLogs(): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;
}

export class MemStorage implements IStorage {
  private alerts: Alert[] = [];
  private devices: Device[] = [];
  private incidents: Incident[] = [];
  private logs: Log[] = [];

  private alertId = 1;
  private deviceId = 1;
  private incidentId = 1;
  private logId = 1;

  constructor() {
    // Seed some initial data if needed
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return this.alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const alert: Alert = {
      ...insertAlert,
      id: this.alertId++,
      timestamp: new Date(),
      status: insertAlert.status ?? 'active',
      metadata: insertAlert.metadata ?? {}
    };
    this.alerts.push(alert);
    return alert;
  }

  async updateAlert(id: number, updates: Partial<InsertAlert>): Promise<Alert> {
    const index = this.alerts.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Alert not found");
    const updated = { ...this.alerts[index], ...updates };
    this.alerts[index] = updated;
    return updated;
  }

  // Devices
  async getDevices(): Promise<Device[]> {
    return this.devices;
  }

  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.find(d => d.id === id);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const device: Device = {
      ...insertDevice,
      id: this.deviceId++,
      lastPing: new Date(),
      battery: insertDevice.battery ?? null,
      ipAddress: insertDevice.ipAddress ?? null,
      videoUrl: insertDevice.videoUrl ?? null,
      x: insertDevice.x ?? 2500,
      y: insertDevice.y ?? 2500
    };
    this.devices.push(device);
    return device;
  }

  // Incidents
  async getIncidents(): Promise<Incident[]> {
    return this.incidents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    return this.incidents.find(i => i.id === id);
  }

  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const now = new Date();
    const incident: Incident = {
      ...insertIncident,
      id: this.incidentId++,
      createdAt: now,
      updatedAt: now,
      status: insertIncident.status ?? 'open'
    };
    this.incidents.push(incident);
    return incident;
  }

  // Logs
  async getLogs(): Promise<Log[]> {
    return this.logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const log: Log = {
      ...insertLog,
      id: this.logId++,
      timestamp: new Date(),
      details: insertLog.details ?? null
    };
    this.logs.push(log);
    return log;
  }
}

export const storage = new MemStorage();

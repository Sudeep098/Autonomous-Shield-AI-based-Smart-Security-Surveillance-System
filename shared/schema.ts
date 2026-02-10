import { z } from "zod";

// === DOMAIN TYPES ===

export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
} as const;

export const STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  ACKNOWLEDGED: 'acknowledged',
  OFFLINE: 'offline',
  ONLINE: 'online',
  WARNING: 'warning'
} as const;

// === SCHEMAS (Manually defined to avoid mixing server dependencies with client) ===

export const insertAlertSchema = z.object({
  title: z.string(),
  message: z.string().optional(), // Was description
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'), // Was severity
  type: z.string().optional(),
  stationId: z.string().optional(),
  // status/acknowledged handled by defaults
});

export const insertDeviceSchema = z.object({
  name: z.string(),
  type: z.enum(['camera', 'drone', 'sensor', 'server']),
  status: z.enum(['online', 'offline', 'warning', 'maintenance']),
  location: z.string(),
  battery: z.number().optional().nullable(),
  ipAddress: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  x: z.number().default(2500),
  y: z.number().default(2500),
  // id and lastPing are DB generated
});

export const insertIncidentSchema = z.object({
  title: z.string(),
  summary: z.string(),
  status: z.enum(['open', 'investigating', 'closed']).default('open'),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  // id, createdAt, updatedAt are DB generated
});

export const insertLogSchema = z.object({
  level: z.enum(['info', 'warning', 'error', 'success']),
  action: z.string(),
  user: z.string(),
  details: z.string().optional().nullable(),
  // id and timestamp are DB generated
});

// === TYPES ===

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = InsertAlert & { id: number; timestamp: Date | string };

export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = InsertDevice & { id: number; lastPing: Date | string };

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = InsertIncident & { id: number; createdAt: Date | string; updatedAt: Date | string };

export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = InsertLog & { id: number; timestamp: Date | string };

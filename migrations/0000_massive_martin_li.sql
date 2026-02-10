CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"severity" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"location" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"station_id" text
);
--> statement-breakpoint
CREATE TABLE "daily_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"stat_date" date NOT NULL,
	"station_id" text NOT NULL,
	"total_incidents" integer DEFAULT 0,
	"critical_incidents" integer DEFAULT 0,
	"avg_response_time_seconds" double precision
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"location" text NOT NULL,
	"last_ping" timestamp DEFAULT now() NOT NULL,
	"battery" integer,
	"ip_address" text,
	"video_url" text,
	"x" integer DEFAULT 2500,
	"y" integer DEFAULT 2500,
	"station_id" text
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"edge_incident_id" text,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"station_id" text,
	"evidence_url" text,
	"resolution_time" timestamp
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"level" text NOT NULL,
	"action" text NOT NULL,
	"user" text NOT NULL,
	"details" text
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"zone" text NOT NULL,
	"ward" text,
	"contact_number" text,
	"ip_gateway" text
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;
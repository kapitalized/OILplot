-- Oilplot (Oil Data Repository) - oil-only table set
--
-- Required env vars for the app to connect (local/dev):
-- - DATABASE_URL (Neon connection string; prefer `sslmode=verify-full` + optional `channel_binding=require`)
-- - NEON_AUTH_BASE_URL (Neon Auth URL)
-- - NEON_AUTH_COOKIE_SECRET (cookie secret from Neon Auth setup)
--
-- After creating a fresh Neon DB, apply the oil schema migration:
-- - `drizzle/0017_oil_only_schema.sql`
--
-- Note: the original oil schema SQL may use `bigserial` / `bigint` for some columns.
-- Our Drizzle mapping currently uses `integer` for those values, so the migration uses `serial` / `integer` to stay consistent.
--
-- Tables:
-- - dim_* lookups: `dim_countries`, `dim_oil_types`, `dim_oil_types_app`, `dim_refineries`, `dim_wells`
-- - fact_* time-series: `fact_prices`, `fact_prices_app`, `fact_production`, `fact_shipments`, `fact_well_output`
-- - src_* logs: `src_scraper_logs` — human-readable notes: `docs/src_scraper_logs.md`

CREATE SCHEMA "public";
CREATE TABLE "dim_countries" (
	"iso_code" varchar(3) PRIMARY KEY,
	"country_name" text NOT NULL,
	"region" text
);
CREATE TABLE "dim_oil_types" (
	"id" serial PRIMARY KEY,
	"code" text NOT NULL CONSTRAINT "dim_oil_types_code_key" UNIQUE,
	"name" text NOT NULL CONSTRAINT "dim_oil_types_name_key" UNIQUE
);
CREATE TABLE "dim_oil_types_app" (
	"id" integer PRIMARY KEY DEFAULT nextval('dim_oil_types_app_id_seq1'::regclass),
	"code" text NOT NULL CONSTRAINT "dim_oil_types_app_code_key" UNIQUE,
	"name" text NOT NULL
);
CREATE TABLE "dim_refineries" (
	"ref_id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"country_code" varchar(3),
	"capacity_kbd" integer,
	"operator" text,
	"type" text DEFAULT 'Refinery',
	"gps_lat" numeric(9, 6),
	"gps_long" numeric(9, 6)
);
CREATE TABLE "dim_wells" (
	"well_id" serial PRIMARY KEY,
	"well_name" text NOT NULL,
	"field_name" text,
	"country_code" varchar(3),
	"well_size_category" text,
	"discovery_date" date,
	"gps_lat" numeric(9, 6),
	"gps_long" numeric(9, 6)
);
CREATE TABLE "fact_prices" (
	"price_id" serial PRIMARY KEY,
	"oil_type_id" integer UNIQUE,
	"price_usd_per_bbl" numeric(10, 2),
	"market_location" text UNIQUE,
	"price_date" date NOT NULL UNIQUE,
	CONSTRAINT "fact_prices_oil_type_id_price_date_market_location_key" UNIQUE("oil_type_id","price_date","market_location")
);
CREATE TABLE "fact_prices_app" (
	"id" bigserial PRIMARY KEY,
	"oil_type_id" integer NOT NULL UNIQUE,
	"price_date" date NOT NULL UNIQUE,
	"close_price" numeric(18, 6) NOT NULL,
	"change_percent" numeric(10, 4),
	"src" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_prices_app_oil_type_id_price_date_src_key" UNIQUE("oil_type_id","price_date","src")
);
CREATE TABLE "fact_production" (
	"prod_id" serial PRIMARY KEY,
	"country_code" varchar(3),
	"ref_id" integer,
	"oil_type_id" integer,
	"volume_barrels" bigint,
	"report_date" date NOT NULL,
	"is_forecast" boolean DEFAULT false,
	"src_id" integer
);
CREATE TABLE "fact_shipments" (
	"shipment_id" serial PRIMARY KEY,
	"origin_country" varchar(3),
	"dest_refinery_id" integer,
	"oil_type_id" integer,
	"volume_barrels" bigint,
	"arrival_date" date,
	"route_name" text,
	"status" text DEFAULT 'Completed'
);
CREATE TABLE "fact_well_output" (
	"output_id" serial PRIMARY KEY,
	"well_id" integer,
	"daily_barrels" integer,
	"water_cut_pct" numeric(5, 2),
	"report_date" date NOT NULL
);
CREATE TABLE "src_scraper_logs" (
	"log_id" serial PRIMARY KEY,
	"scraper_name" text NOT NULL,
	"run_time" timestamp DEFAULT CURRENT_TIMESTAMP,
	"rows_inserted" integer,
	"status" text,
	"error_message" text,
	"raw_response_json" jsonb
);
CREATE UNIQUE INDEX "dim_countries_pkey" ON "dim_countries" ("iso_code");
CREATE UNIQUE INDEX "dim_oil_types_code_key" ON "dim_oil_types" ("code");
CREATE UNIQUE INDEX "dim_oil_types_name_key" ON "dim_oil_types" ("name");
CREATE UNIQUE INDEX "dim_oil_types_pkey" ON "dim_oil_types" ("id");
CREATE UNIQUE INDEX "dim_oil_types_app_code_key" ON "dim_oil_types_app" ("code");
CREATE UNIQUE INDEX "dim_oil_types_app_pkey" ON "dim_oil_types_app" ("id");
CREATE UNIQUE INDEX "dim_refineries_pkey" ON "dim_refineries" ("ref_id");
CREATE UNIQUE INDEX "dim_wells_pkey" ON "dim_wells" ("well_id");
CREATE UNIQUE INDEX "fact_prices_oil_type_id_price_date_market_location_key" ON "fact_prices" ("oil_type_id","price_date","market_location");
CREATE UNIQUE INDEX "fact_prices_pkey" ON "fact_prices" ("price_id");
CREATE UNIQUE INDEX "fact_prices_app_oil_type_id_price_date_src_key" ON "fact_prices_app" ("oil_type_id","price_date","src");
CREATE UNIQUE INDEX "fact_prices_app_pkey" ON "fact_prices_app" ("id");
CREATE UNIQUE INDEX "fact_production_pkey" ON "fact_production" ("prod_id");
CREATE UNIQUE INDEX "fact_shipments_pkey" ON "fact_shipments" ("shipment_id");
CREATE UNIQUE INDEX "fact_well_output_pkey" ON "fact_well_output" ("output_id");
CREATE UNIQUE INDEX "src_scraper_logs_pkey" ON "src_scraper_logs" ("log_id");
ALTER TABLE "dim_refineries" ADD CONSTRAINT "dim_refineries_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "dim_countries"("iso_code");
ALTER TABLE "dim_wells" ADD CONSTRAINT "dim_wells_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "dim_countries"("iso_code");
ALTER TABLE "fact_prices" ADD CONSTRAINT "fact_prices_oil_type_id_fkey" FOREIGN KEY ("oil_type_id") REFERENCES "dim_oil_types"("id");
ALTER TABLE "fact_prices_app" ADD CONSTRAINT "fact_prices_app_oil_type_id_fkey" FOREIGN KEY ("oil_type_id") REFERENCES "dim_oil_types_app"("id");
ALTER TABLE "fact_production" ADD CONSTRAINT "fact_production_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "dim_countries"("iso_code");
ALTER TABLE "fact_production" ADD CONSTRAINT "fact_production_oil_type_id_fkey" FOREIGN KEY ("oil_type_id") REFERENCES "dim_oil_types"("id");
ALTER TABLE "fact_production" ADD CONSTRAINT "fact_production_ref_id_fkey" FOREIGN KEY ("ref_id") REFERENCES "dim_refineries"("ref_id");
ALTER TABLE "fact_shipments" ADD CONSTRAINT "fact_shipments_dest_refinery_id_fkey" FOREIGN KEY ("dest_refinery_id") REFERENCES "dim_refineries"("ref_id");
ALTER TABLE "fact_shipments" ADD CONSTRAINT "fact_shipments_oil_type_id_fkey" FOREIGN KEY ("oil_type_id") REFERENCES "dim_oil_types"("id");
ALTER TABLE "fact_shipments" ADD CONSTRAINT "fact_shipments_origin_country_fkey" FOREIGN KEY ("origin_country") REFERENCES "dim_countries"("iso_code");
ALTER TABLE "fact_well_output" ADD CONSTRAINT "fact_well_output_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "dim_wells"("well_id");
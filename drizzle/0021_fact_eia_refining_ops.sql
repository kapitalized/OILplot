-- EIA Open Data v2: regional refinery inputs/outputs (wiup, inpt2, refp2) — not plant-level Form EIA-810.
CREATE TABLE IF NOT EXISTS "fact_eia_refining_ops" (
  "id" serial PRIMARY KEY,
  "eia_series_id" text NOT NULL,
  "period" text NOT NULL,
  "route_id" text NOT NULL,
  "frequency" text NOT NULL,
  "duoarea" text,
  "area_name" text,
  "product" text,
  "product_name" text,
  "process" text,
  "process_name" text,
  "value" numeric,
  "units" text,
  "series_description" text
);
CREATE UNIQUE INDEX IF NOT EXISTS "fact_eia_refining_ops_series_period_uidx" ON "fact_eia_refining_ops" ("eia_series_id", "period");

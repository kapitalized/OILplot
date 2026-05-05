-- EIA Open Data v2: petroleum/pnp/cap1 — regional refinery capacity (not per-plant Table 3).
ALTER TABLE "dim_refineries" ADD COLUMN IF NOT EXISTS "eia_series_id" text;
ALTER TABLE "dim_refineries" ADD COLUMN IF NOT EXISTS "eia_duoarea" text;
ALTER TABLE "dim_refineries" ADD COLUMN IF NOT EXISTS "eia_report_year" smallint;
CREATE UNIQUE INDEX IF NOT EXISTS "dim_refineries_eia_series_id_uidx" ON "dim_refineries" ("eia_series_id");

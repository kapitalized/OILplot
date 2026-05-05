#!/usr/bin/env node
/**
 * Adds EIA cap1 columns to dim_refineries (see drizzle/0020_dim_refineries_eia.sql).
 * Required before adapter eia-refinery-capacity can run.
 *
 * Usage: node scripts/migrate-dim-refineries-eia.mjs
 * Or:    npm run migrate:dim-refineries-eia
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found. Create it with DATABASE_URL=...');
  process.exit(1);
}
fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
});

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URI;
if (!connectionString) {
  console.error('DATABASE_URL or DATABASE_URI not set in .env.local');
  process.exit(1);
}

const { neon } = await import('@neondatabase/serverless');
const sql = neon(connectionString);

async function run(query) {
  await sql(query);
}

console.log('Adding dim_refineries EIA columns (eia_series_id, eia_duoarea, eia_report_year)...');

await run(
  `ALTER TABLE "dim_refineries" ADD COLUMN IF NOT EXISTS "eia_series_id" text`,
);
await run(
  `ALTER TABLE "dim_refineries" ADD COLUMN IF NOT EXISTS "eia_duoarea" text`,
);
await run(
  `ALTER TABLE "dim_refineries" ADD COLUMN IF NOT EXISTS "eia_report_year" smallint`,
);
await run(
  `CREATE UNIQUE INDEX IF NOT EXISTS "dim_refineries_eia_series_id_uidx" ON "dim_refineries" ("eia_series_id")`,
);

console.log('Done. Re-run the EIA refinery capacity source from admin.');
await new Promise((r) => setTimeout(r, 150));
process.exit(0);

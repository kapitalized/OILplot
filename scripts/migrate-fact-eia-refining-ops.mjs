#!/usr/bin/env node
/**
 * Creates fact_eia_refining_ops (EIA wiup / inpt2 / refp2 regional refinery I/O).
 * Usage: npm run migrate:fact-eia-refining-ops
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

console.log('Applying fact_eia_refining_ops (0021)...');

await sql(`
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
)`);

await sql(`
CREATE UNIQUE INDEX IF NOT EXISTS "fact_eia_refining_ops_series_period_uidx"
ON "fact_eia_refining_ops" ("eia_series_id", "period")
`);

console.log('Done. Register adapter eia-refining-ops and run from Admin → External APIs.');
// Defer exit so @neondatabase/serverless can finish closing handles (avoids libuv assertion on Windows).
await new Promise((r) => setTimeout(r, 150));
process.exit(0);

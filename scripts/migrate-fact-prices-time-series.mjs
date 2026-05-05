#!/usr/bin/env node
/**
 * fact_prices was created with UNIQUE on oil_type_id, market_location, and price_date separately,
 * which blocks historical time series. This migration drops those constraints and adds one
 * composite unique index so multiple rows per oil type are allowed (per date/source/market).
 *
 * Usage: node scripts/migrate-fact-prices-time-series.mjs
 * Or:    npm run migrate:fact-prices-time-series
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

console.log('Migrating fact_prices constraints for time series...');

// Drop legacy single-column UNIQUE constraints from 0017_oil_only_schema.sql
await run(`ALTER TABLE fact_prices DROP CONSTRAINT IF EXISTS fact_prices_oil_type_id_key`);
await run(`ALTER TABLE fact_prices DROP CONSTRAINT IF EXISTS fact_prices_market_location_key`);
await run(`ALTER TABLE fact_prices DROP CONSTRAINT IF EXISTS fact_prices_price_date_key`);

// One row per (type, market, calendar day, provider tag). NULL source treated as '' for uniqueness.
await run(`
  CREATE UNIQUE INDEX IF NOT EXISTS fact_prices_series_dedupe_idx
  ON fact_prices (
    oil_type_id,
    COALESCE(market_location, ''),
    price_date,
    COALESCE(source, '')
  )
`);

console.log('Done. Re-run EIA/Yahoo sources from /admin/external-apis (increase length / lookbackDays for more history).');
await new Promise((r) => setTimeout(r, 150));
process.exit(0);

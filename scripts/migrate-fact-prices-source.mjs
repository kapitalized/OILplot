#!/usr/bin/env node
/**
 * Add source column to fact_prices for provider attribution.
 * Usage: node scripts/migrate-fact-prices-source.mjs
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

for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URI;
if (!connectionString) {
  console.error('DATABASE_URL or DATABASE_URI not set in .env.local');
  process.exit(1);
}

const { neon } = await import('@neondatabase/serverless');
const sql = neon(connectionString);

await sql`ALTER TABLE fact_prices ADD COLUMN IF NOT EXISTS source text`;
await sql`CREATE INDEX IF NOT EXISTS fact_prices_source_idx ON fact_prices(source)`;

console.log('Done. fact_prices.source is ready.');
process.exit(0);

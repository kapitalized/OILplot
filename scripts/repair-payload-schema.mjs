#!/usr/bin/env node
/**
 * Calls POST /api/admin/repair-payload-schema. Dev server must be running.
 * Usage: node scripts/repair-payload-schema.mjs [baseUrl] [key]
 *
 * Loads .env.local / .env so INTERNAL_SERVICE_KEY matches the running app.
 */
import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env.local') });
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const baseUrl = process.argv[2] || 'http://localhost:3000';
const key = process.argv[3] || process.env.INTERNAL_SERVICE_KEY || 'dev-secret-handshake';
const url = `${baseUrl.replace(/\/$/, '')}/api/admin/repair-payload-schema?key=${encodeURIComponent(key)}`;

async function main() {
  let res;
  try {
    res = await fetch(url, { method: 'POST' });
  } catch (e) {
    const cause = e?.cause?.code || e?.cause?.message || e?.cause;
    const detail = [e?.message || e, cause].filter(Boolean).join(' — ');
    console.error(detail);
    console.error(
      '\nCould not reach the app. Start dev: npm run dev\n' +
        'Or run repair without HTTP (uses DATABASE_URL): npm run repair:payload'
    );
    process.exit(1);
  }

  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    console.error(`HTTP ${res.status} ${res.statusText} — response was not JSON.`);
    console.error(text.slice(0, 2000));
    process.exit(1);
  }

  if (!res.ok || body.error) {
    console.error(body.error || `HTTP ${res.status}`);
    if (body.hint) console.error('Hint:', body.hint);
    process.exit(1);
  }
  console.log(body.message || JSON.stringify(body));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

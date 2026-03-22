#!/usr/bin/env node
/**
 * Seeds default Yahoo + EIA API sources. Dev server must be running.
 * Usage: node scripts/seed-oil-api-sources.mjs [baseUrl] [key]
 */
const baseUrl = process.argv[2] || 'http://localhost:3000';
const key = process.argv[3] || process.env.INTERNAL_SERVICE_KEY || 'dev-secret-handshake';
const url = `${baseUrl}/api/seed-oil-api-sources?key=${encodeURIComponent(key)}`;

fetch(url, { method: 'POST' })
  .then((r) => r.json())
  .then((body) => {
    if (body.error) {
      console.error(body.error);
      process.exit(1);
    }
    console.log('Created:', body.created?.join(', ') || 'none');
    console.log('Skipped (already exist):', body.skipped?.join(', ') || 'none');
    console.log(body.message || 'Done.');
  })
  .catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });

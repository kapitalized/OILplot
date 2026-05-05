import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^EIA_API_KEY=(.*)$/);
  if (m) process.env.EIA_API_KEY = m[1].replace(/^["']|["']$/g, '').trim();
}
const k = process.env.EIA_API_KEY;

async function get(path) {
  const sep = path.includes('?') ? '&' : '?';
  const url = `https://api.eia.gov${path}${sep}api_key=${encodeURIComponent(k)}`;
  const res = await fetch(url);
  return res.json();
}

const j = await get('/v2/petroleum/pnp/cap1/facet/process/?length=50');
console.log('process facets sample', JSON.stringify(j, null, 2).slice(0, 8000));

const s = await get('/v2/petroleum/pnp/cap1/facet/series/?length=30');
console.log('\nseries facets sample', JSON.stringify(s, null, 2).slice(0, 8000));

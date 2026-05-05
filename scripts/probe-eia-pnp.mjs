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
const url = `https://api.eia.gov/v2/petroleum/pnp/?api_key=${encodeURIComponent(k)}`;
const res = await fetch(url);
const j = await res.json();
console.log(JSON.stringify(j, null, 2).slice(0, 25000));

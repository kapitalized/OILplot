import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('No .env.local');
  process.exit(1);
}
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^EIA_API_KEY=(.*)$/);
  if (m) process.env.EIA_API_KEY = m[1].replace(/^["']|["']$/g, '').trim();
}
const k = process.env.EIA_API_KEY;
if (!k) {
  console.error('EIA_API_KEY missing');
  process.exit(1);
}

const url = `https://api.eia.gov/v2/petroleum/refcap/?api_key=${encodeURIComponent(k)}`;
const res = await fetch(url);
const text = await res.text();
console.log('status', res.status);
try {
  const j = JSON.parse(text);
  console.log(JSON.stringify(j, null, 2).slice(0, 15000));
} catch {
  console.log(text.slice(0, 2000));
}

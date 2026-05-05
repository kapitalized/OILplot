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

async function probe(path) {
  const sep = path.includes('?') ? '&' : '?';
  const url = `https://api.eia.gov${path}${sep}api_key=${encodeURIComponent(k)}`;
  const res = await fetch(url);
  const text = await res.text();
  console.log('\n===', path, res.status, '===');
  try {
    const j = JSON.parse(text);
    console.log(JSON.stringify(j, null, 2).slice(0, 12000));
  } catch {
    console.log(text.slice(0, 2000));
  }
}

await probe('/v2/petroleum/pnp/cap1/');
await probe('/v2/petroleum/pnp/cap1/data/?length=5');

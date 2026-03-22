/**
 * Drizzle Kit config. Base stack uses Neon (DATABASE_URL).
 * Run: npx drizzle-kit pull, npx drizzle-kit generate, npx drizzle-kit migrate
 *
 * Loads `.env` / `.env.local` so CLI commands see DATABASE_URL (Next.js loads these for `npm run dev` only).
 */

import { existsSync } from 'fs';
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

for (const name of ['.env', '.env.local']) {
  const p = resolve(process.cwd(), name);
  if (existsSync(p)) loadEnv({ path: p });
}

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URI || 'postgresql://localhost:5432/app';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: connectionString },
});

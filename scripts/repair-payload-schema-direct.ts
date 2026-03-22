/**
 * Runs Payload schema repair against DATABASE_URL — no HTTP, no dev server.
 * Loads .env.local / .env before any DB import.
 */
import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env.local') });
dotenv.config({ path: resolve(__dirname, '..', '.env') });

async function main() {
  if (!process.env.DATABASE_URL && !process.env.DATABASE_URI) {
    console.error('DATABASE_URL (or DATABASE_URI) is not set. Add it to .env.local');
    process.exit(1);
  }

  const { runRepairPayloadSchema, REPAIR_PAYLOAD_SUCCESS_MESSAGE } = await import(
    '../lib/repair-payload-schema'
  );

  await runRepairPayloadSchema();
  console.log(REPAIR_PAYLOAD_SUCCESS_MESSAGE);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

/**
 * One-shot repair for partial Payload DBs (when `payload migrate` was not run end-to-end):
 * - `users.role` + `enum_users_role`
 * - `pages.meta_keywords` (migration 20260315)
 * - `api_sources`, `external_api_runs`, `payload_locked_documents_rels.api_sources_id` / `external_api_runs_id` (20260317)
 *
 * POST /api/admin/repair-payload-schema?key=INTERNAL_SERVICE_KEY
 * Header: x-internal-key: <same>
 *
 * Safe to call multiple times (idempotent).
 * CLI (no dev server): `npm run repair:payload` uses `DATABASE_URL` from `.env.local`.
 */
import { NextResponse } from 'next/server';
import { REPAIR_PAYLOAD_SUCCESS_MESSAGE, runRepairPayloadSchema } from '@/lib/repair-payload-schema';

const SECRET = process.env.INTERNAL_SERVICE_KEY || 'dev-secret-handshake';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key') ?? request.headers.get('x-internal-key');
  if (key !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL && !process.env.DATABASE_URI) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 503 });
  }

  try {
    await runRepairPayloadSchema();

    return NextResponse.json({
      ok: true,
      message: REPAIR_PAYLOAD_SUCCESS_MESSAGE,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error: msg,
        hint:
          'If users table is missing, run full Payload migrations: npm run payload:migrate',
      },
      { status: 500 }
    );
  }
}

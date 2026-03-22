/**
 * Seed default oil API sources (Yahoo + EIA) into Payload. POST only.
 * Requires ?key=INTERNAL_SERVICE_KEY (or header x-seed-key).
 *
 * With dev server: curl -X POST "http://localhost:3000/api/seed-oil-api-sources?key=YOUR_KEY"
 */

import { NextResponse } from 'next/server';
import { seedOilApiSources } from '@/lib/seed-oil-api-sources';

const SECRET = process.env.INTERNAL_SERVICE_KEY || 'dev-secret-handshake';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key') ?? request.headers.get('x-seed-key');
  if (key !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await seedOilApiSources();
    return NextResponse.json({
      ok: true,
      created: result.created,
      skipped: result.skipped,
      message:
        'Enable "WTI spot (EIA)" in admin after setting EIA_API_KEY. Run sync from External APIs or cron.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

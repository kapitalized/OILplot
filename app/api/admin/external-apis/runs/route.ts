/**
 * Admin: list recent external API runs. GET ?limit=50
 */
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { getSessionForApi } from '@/lib/auth/session';
import { isPayloadAdmin } from '@/lib/auth/payload-admin';

export async function GET(request: Request) {
  const session = await getSessionForApi();
  if (!session && !(await isPayloadAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 200);
  try {
    const resolvedConfig = typeof config.then === 'function' ? await config : config;
    const payload = await getPayload({ config: resolvedConfig });
    const result = await payload.find({
      collection: 'external-api-runs',
      limit,
      sort: '-startedAt',
      depth: 1,
      overrideAccess: true,
    });
    const runs = result.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>;
      const sourceVal = d.source as unknown;
      let sourceId: string | null = null;
      let sourceName: string | null = null;
      if (sourceVal && typeof sourceVal === 'object') {
        const anySource = sourceVal as Record<string, unknown>;
        if (anySource.id != null) sourceId = String(anySource.id);
        if (anySource.name != null) sourceName = String(anySource.name);
      } else if (sourceVal != null) {
        sourceId = String(sourceVal);
      }
      return {
        id: String(doc.id),
        sourceId,
        sourceName,
        startedAt: d.startedAt != null ? String(d.startedAt) : null,
        finishedAt: d.finishedAt != null ? String(d.finishedAt) : null,
        status: (d.status as string) ?? null,
        recordsFetched: typeof d.recordsFetched === 'number' ? d.recordsFetched : null,
        errorMessage: (d.errorMessage as string) ?? null,
      };
    });
    return NextResponse.json({ runs });
  } catch (e) {
    // Surface enough detail to debug admin view failures.
    // (This route is already auth-gated above.)
    // eslint-disable-next-line no-console
    console.error('Failed to load external API runs', e);
    const msg = e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV !== 'production') {
      const stack = e instanceof Error ? e.stack : undefined;
      const anyErr = e as unknown as {
        cause?: { message?: string; code?: string; detail?: string; hint?: string };
        code?: string;
        detail?: string;
        hint?: string;
      };
      const cause = anyErr?.cause;
      return NextResponse.json(
        {
          error: msg,
          stack,
          code: anyErr?.code ?? cause?.code,
          detail: anyErr?.detail ?? cause?.detail,
          hint: anyErr?.hint ?? cause?.hint,
          causeMessage: cause?.message,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

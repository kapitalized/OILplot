/**
 * Admin: list external API sources. Allowed: dashboard session OR Payload admin.
 */
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { getSessionForApi } from '@/lib/auth/session';
import { isPayloadAdmin } from '@/lib/auth/payload-admin';

function summarizeApiSourceConfig(adapter: string, raw: unknown): string {
  if (raw == null || typeof raw !== 'object') return '—';
  const c = raw as Record<string, unknown>;
  if (adapter === 'eia-petroleum') {
    const length = c.length != null ? String(c.length) : 'default (180)';
    const series = typeof c.series === 'string' ? c.series : 'RWTC';
    const freq = typeof c.frequency === 'string' ? c.frequency : 'daily';
    return `length=${length} · series=${series} · ${freq}`;
  }
  if (adapter === 'eia-refinery-capacity') {
    const y = typeof c.year === 'number' ? String(c.year) : 'current year';
    const sd = c.streamDay === true ? 'B/SD' : 'B/CD';
    return `year=${y} · ${sd}`;
  }
  if (adapter === 'eia-refining-ops') {
    const w = c.weeksBack != null ? String(c.weeksBack) : '26';
    const m = c.monthsBack != null ? String(c.monthsBack) : '24';
    const inpt = c.netInputMonthly === true ? 'inpt2 on' : 'inpt2 off';
    return `weeks=${w} · months=${m} · ${inpt}`;
  }
  if (adapter === 'yahoo-prices') {
    const lb = c.lookbackDays != null ? String(c.lookbackDays) : 'default (10)';
    const n = Array.isArray(c.markets) ? c.markets.length : 0;
    return `lookbackDays=${lb} · markets=${n}`;
  }
  try {
    const s = JSON.stringify(raw);
    return s.length > 120 ? `${s.slice(0, 120)}…` : s;
  } catch {
    return '—';
  }
}

export async function GET(request: Request) {
  const session = await getSessionForApi();
  if (!session && !(await isPayloadAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const resolvedConfig = typeof config.then === 'function' ? await config : config;
    const payload = await getPayload({ config: resolvedConfig });
    const result = await payload.find({
      collection: 'api-sources',
      limit: 100,
      sort: '-updatedAt',
      overrideAccess: true,
    });
    const sources = result.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>;
      const adapter = (d.adapter as string) ?? 'generic';
      const cfg = d.config;
      return {
        id: String(doc.id),
        name: (d.name as string) ?? '',
        adapter,
        enabled: Boolean(d.enabled),
        cronJobId: (d.cronJobId as string) ?? null,
        lastRunAt: d.lastRunAt != null ? String(d.lastRunAt) : null,
        updatedAt: d.updatedAt != null ? String(d.updatedAt) : null,
        configSummary: summarizeApiSourceConfig(adapter, cfg),
        config: cfg,
      };
    });
    return NextResponse.json({ sources });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

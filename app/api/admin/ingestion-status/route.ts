/**
 * Oil repository metrics: row counts + latest scraper logs.
 * GET /api/admin/ingestion-status — dashboard session or Payload admin.
 */
import { NextResponse } from 'next/server';
import { count, desc } from 'drizzle-orm';
import { getSessionForApi } from '@/lib/auth/session';
import { isPayloadAdmin } from '@/lib/auth/payload-admin';
import { db } from '@/lib/db';
import { fact_prices, fact_shipments, fact_production, src_scraper_logs } from '@/lib/db/schema';

function safeIso(v: unknown): string | null {
  if (v == null) return null;
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function GET(request: Request) {
  const session = await getSessionForApi();
  if (!session && !(await isPayloadAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    async function countSafe<T extends typeof fact_prices>(table: T): Promise<number> {
      try {
        const [r] = await db.select({ n: count() }).from(table);
        return Number(r?.n ?? 0);
      } catch {
        return 0;
      }
    }

    const counts = {
      fact_prices: await countSafe(fact_prices),
      fact_shipments: await countSafe(fact_shipments),
      fact_production: await countSafe(fact_production),
    };

    let logs: Array<{
      log_id: number;
      scraper_name: string | null;
      run_time: Date | string | null;
      rows_inserted: number | null;
      status: string | null;
      error_message: string | null;
    }> = [];
    try {
      logs = await db
        .select({
          log_id: src_scraper_logs.log_id,
          scraper_name: src_scraper_logs.scraper_name,
          run_time: src_scraper_logs.run_time,
          rows_inserted: src_scraper_logs.rows_inserted,
          status: src_scraper_logs.status,
          error_message: src_scraper_logs.error_message,
        })
        .from(src_scraper_logs)
        .orderBy(desc(src_scraper_logs.run_time))
        .limit(15);
    } catch {
      logs = [];
    }

    return NextResponse.json({
      counts,
      scraper_logs: logs.map((row) => ({
        ...row,
        run_time: safeIso(row.run_time),
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

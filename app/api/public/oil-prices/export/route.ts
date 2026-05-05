/**
 * Public CSV export for fact_prices (same filters as /repository query string).
 */
import { NextResponse } from 'next/server';
import {
  EXPORT_MAX,
  parseCatalogFiltersFromRecord,
  pricesToCsv,
  queryCatalogPrices,
} from '@/lib/oil/public-repository-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const record: Record<string, string | string[] | undefined> = {};
  searchParams.forEach((v, k) => {
    record[k] = v;
  });
  const parsed = parseCatalogFiltersFromRecord(record);
  const { limit: _userLimit, ...rest } = parsed;
  const rows = await queryCatalogPrices({ ...rest, limit: EXPORT_MAX }, { maxLimit: EXPORT_MAX });
  const csv = '\uFEFF' + pricesToCsv(rows);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="oilplot-fact-prices.csv"',
      'Cache-Control': 'private, max-age=60',
    },
  });
}

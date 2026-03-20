import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { fact_prices } from '@/lib/db/schema';
import { yahooPricesAdapter } from '@/lib/external-apis/adapters/yahoo-prices';

export async function GET() {
  // Local-only test endpoint (does not require CRON_SECRET or Payload admin).
  const runResult = await yahooPricesAdapter.run({
    markets: [
      {
        oilTypeCode: 'WTI',
        oilTypeName: 'WTI',
        marketLocation: 'WTI',
        yahooSymbol: 'CL=F',
      },
    ],
    lookbackDays: 15,
  });

  let latest: null | { price_date: string; price_usd_per_bbl: string | number; oil_type_id: number } = null;
  try {
    const row = await db
      .select({
        price_date: fact_prices.price_date,
        price_usd_per_bbl: fact_prices.price_usd_per_bbl,
        oil_type_id: fact_prices.oil_type_id,
      })
      .from(fact_prices)
      .where(eq(fact_prices.market_location, 'WTI'))
      .limit(1);
    latest = row[0] ?? null;
  } catch {
    // If the table/row doesn't exist yet, still return adapter output.
  }

  return NextResponse.json({ runResult, latest });
}


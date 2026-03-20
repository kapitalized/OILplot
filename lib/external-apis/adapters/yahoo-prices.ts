import YahooFinance from 'yahoo-finance2';
import { eq } from 'drizzle-orm';
import type { IExternalApiAdapter } from '../types';
import { db, sql } from '@/lib/db';
import { dim_oil_types, src_scraper_logs } from '@/lib/db/schema';

export type YahooPricesAdapterMarket = {
  /** Oil type code (stored in `dim_oil_types.code`, also used for `name` if `oilTypeName` is omitted). */
  oilTypeCode: string;
  oilTypeName?: string;
  /** Human-readable market label (stored in `fact_prices.market_location`, unique in current schema). */
  marketLocation: string;
  /** Yahoo Finance symbol, e.g. `CL=F` (WTI) or `BZ=F` (Brent). */
  yahooSymbol: string;
};

export type YahooPricesAdapterConfig = {
  markets: YahooPricesAdapterMarket[];
  /** How far back to look for the last daily close. */
  lookbackDays?: number;
};

async function getOrCreateOilTypeId(market: YahooPricesAdapterMarket): Promise<number> {
  const existing = await db
    .select({ id: dim_oil_types.id })
    .from(dim_oil_types)
    .where(eq(dim_oil_types.code, market.oilTypeCode))
    .limit(1);

  const existingId = existing[0]?.id;
  if (existingId != null) return existingId;

  const name = market.oilTypeName ?? market.oilTypeCode;
  try {
    // `dim_oil_types.id` is `serial` in SQL. Drizzle typing for this table requires `id` on insert,
    // so we insert via raw SQL and fetch `id` with RETURNING.
    const inserted = (await sql`
      INSERT INTO dim_oil_types (code, name)
      VALUES (${market.oilTypeCode}, ${name})
      ON CONFLICT (code)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `) as Array<{ id: number }>;

    const insertedId = inserted[0]?.id;
    if (insertedId != null) return insertedId;
  } catch {
    // If the insert races or the constraints behave differently, fall back to re-read.
  }

  const reloaded = await db
    .select({ id: dim_oil_types.id })
    .from(dim_oil_types)
    .where(eq(dim_oil_types.code, market.oilTypeCode))
    .limit(1);

  const reloadedId = reloaded[0]?.id;
  if (reloadedId == null) throw new Error(`Failed to resolve dim_oil_types for code=${market.oilTypeCode}`);
  return reloadedId;
}

function toISODate(dateLike: unknown): string {
  if (dateLike instanceof Date) return dateLike.toISOString().slice(0, 10);
  const s = String(dateLike);
  // yahoo-finance2 returns ISO strings like `2026-03-19T04:00:00.000Z`
  return s.slice(0, 10);
}

function getRegularMarketPrice(q: unknown): number | null {
  if (q == null || typeof q !== 'object') return null;
  const v = (q as { regularMarketPrice?: unknown }).regularMarketPrice;
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function getRegularMarketTime(q: unknown): Date | null {
  if (q == null || typeof q !== 'object') return null;
  const v = (q as { regularMarketTime?: unknown }).regularMarketTime;
  if (v instanceof Date) return v;
  // In case yahoo-finance2 returns timestamps as numbers, interpret small values as seconds.
  if (typeof v === 'number' && Number.isFinite(v)) {
    const ms = v < 1e12 ? v * 1000 : v;
    return new Date(ms);
  }
  return null;
}

export const yahooPricesAdapter: IExternalApiAdapter = {
  key: 'yahoo-prices',
  async run(config: unknown) {
    const c = config as YahooPricesAdapterConfig;
    if (!c?.markets || !Array.isArray(c.markets) || c.markets.length === 0) {
      return { status: 'error', errorMessage: 'config.markets[] is required' };
    }

    const markets = c.markets;
    const lookbackDays = typeof c.lookbackDays === 'number' && Number.isFinite(c.lookbackDays) ? c.lookbackDays : 10;

    const end = new Date();
    const start = new Date(end.getTime() - lookbackDays * 86400000);
    // Include an extra day at the end to capture the latest daily close.
    const period1 = start.toISOString().slice(0, 10);
    const period2 = new Date(end.getTime() + 86400000).toISOString().slice(0, 10);

    const yf = new YahooFinance({ suppressNotices: ['ripHistorical', 'yahooSurvey'] });
    const scraperName = 'yahoo-prices';

    try {
      const results: Array<{
        marketLocation: string;
        yahooSymbol: string;
        oilTypeCode: string;
        price_date: string;
        close: number;
      }> = [];

      // The current oil schema has uniqueness constraints that make it effectively "latest per date".
      // For a clean insert, we delete any existing `fact_prices` row for the selected price_date.
      let rowsInserted = 0;

      for (const market of markets) {
        try {
          // `historical()` can be flaky due to Yahoo response shape/nulls; `quote()` is usually more reliable for "latest".
          const q = await yf.quote(market.yahooSymbol);
          const closePrice = getRegularMarketPrice(q);
          if (closePrice == null) continue;
          const priceUsdPerBbl = closePrice.toFixed(2);
          const priceDate = toISODate(getRegularMarketTime(q) ?? end);

          if (!Number.isFinite(closePrice)) continue;

          const oilTypeId = await getOrCreateOilTypeId(market);

          // Ensure uniqueness constraints are satisfied for `price_date` / `market_location` in current schema.
          await sql`
            DELETE FROM fact_prices
            WHERE price_date = ${priceDate}
              OR oil_type_id = ${oilTypeId}
              OR market_location = ${market.marketLocation}
          `;

          await sql`
            INSERT INTO fact_prices (oil_type_id, price_usd_per_bbl, market_location, price_date)
            VALUES (${oilTypeId}, ${priceUsdPerBbl}::numeric, ${market.marketLocation}, ${priceDate})
          `;

          results.push({
            marketLocation: market.marketLocation,
            yahooSymbol: market.yahooSymbol,
            oilTypeCode: market.oilTypeCode,
            price_date: priceDate,
            close: closePrice,
          });

          rowsInserted += 1;
        } catch {
          // Keep going if one market fails; the adapter should still succeed for other markets.
          continue;
        }
      }

      await sql`
        INSERT INTO src_scraper_logs (scraper_name, rows_inserted, status, error_message, raw_response_json)
        VALUES (
          ${scraperName},
          ${rowsInserted},
          ${rowsInserted > 0 ? 'success' : 'error'},
          ${rowsInserted > 0 ? null : 'No daily close found for given markets.'},
          ${JSON.stringify({ period1, period2, markets, extracted: results })}::jsonb
        )
      `;

      if (rowsInserted === 0) {
        return { status: 'error', errorMessage: 'No daily close found for given markets.', rawResult: results };
      }

      return {
        status: 'success',
        recordsFetched: rowsInserted,
        rawResult: {
          period1,
          period2,
          extracted: results,
        },
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await sql`
        INSERT INTO src_scraper_logs (scraper_name, rows_inserted, status, error_message, raw_response_json)
        VALUES (
          ${scraperName},
          0,
          'error',
          ${msg},
          ${JSON.stringify({ markets, period1, period2 })}::jsonb
        )
      `;
      return { status: 'error', errorMessage: msg };
    }
  },
};


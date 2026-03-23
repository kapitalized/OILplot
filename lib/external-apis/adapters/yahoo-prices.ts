import YahooFinance from 'yahoo-finance2';
import type { IExternalApiAdapter } from '../types';
import { getOrCreateOilTypeId } from '../oil-dim';
import { sql } from '@/lib/db';

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
  /** How far back to look for daily closes. */
  lookbackDays?: number;
};

function toISODate(dateLike: unknown): string {
  if (dateLike instanceof Date) return dateLike.toISOString().slice(0, 10);
  const s = String(dateLike);
  // yahoo-finance2 returns ISO strings like `2026-03-19T04:00:00.000Z`
  return s.slice(0, 10);
}

function getClosePrice(row: unknown): number | null {
  if (row == null || typeof row !== 'object') return null;
  const anyRow = row as { close?: unknown; adjClose?: unknown };
  const v = typeof anyRow.close === 'number' ? anyRow.close : anyRow.adjClose;
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
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

      let rowsInserted = 0;

      for (const market of markets) {
        try {
          const oilTypeId = await getOrCreateOilTypeId(market);
          const candles = (await yf.historical(market.yahooSymbol, {
            period1,
            period2,
            interval: '1d',
          })) as unknown[];

          for (const row of candles) {
            const closePrice = getClosePrice(row);
            if (closePrice == null) continue;
            const anyRow = row as { date?: unknown };
            const priceDate = toISODate(anyRow.date ?? end);
            const priceUsdPerBbl = closePrice.toFixed(2);

            // Keep historical rows; only replace exact same market/type/date row.
            await sql`
              DELETE FROM fact_prices
              WHERE oil_type_id = ${oilTypeId}
                AND market_location = ${market.marketLocation}
                AND price_date = ${priceDate}
            `;

            await sql`
              INSERT INTO fact_prices (oil_type_id, price_usd_per_bbl, source, market_location, price_date)
              VALUES (${oilTypeId}, ${priceUsdPerBbl}::numeric, 'yahoo', ${market.marketLocation}, ${priceDate})
            `;

            results.push({
              marketLocation: market.marketLocation,
              yahooSymbol: market.yahooSymbol,
              oilTypeCode: market.oilTypeCode,
              price_date: priceDate,
              close: closePrice,
            });

            rowsInserted += 1;
          }
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


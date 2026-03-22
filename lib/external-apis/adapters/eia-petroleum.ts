/**
 * EIA Open Data v2 — petroleum spot prices → `fact_prices` + `src_scraper_logs`.
 * Requires `EIA_API_KEY` (free at https://www.eia.gov/opendata/).
 *
 * Default series: **RWTC** (WTI Cushing, OK spot) via `facets[series][]`.
 * Browse facets: https://www.eia.gov/opendata/browser/petroleum/pri/spt
 */
import type { IExternalApiAdapter } from '../types';
import { getOrCreateOilTypeId } from '../oil-dim';
import { sql } from '@/lib/db';

export type EiaPetroleumAdapterConfig = {
  /** Stored in `fact_prices.market_location` (must stay unique per current schema patterns). */
  marketLocation: string;
  oilTypeCode: string;
  oilTypeName?: string;
  /**
   * EIA `facets[series][]` id (e.g. **RWTC** = WTI Cushing spot). Prefer this over product/duoarea.
   * @see https://www.eia.gov/opendata/browser/petroleum/pri/spt
   */
  series?: string;
  /** Alternative to `series`: EIA `facets[product][]` + `facets[duoarea][]`. */
  product?: string;
  duoarea?: string;
  frequency?: 'daily' | 'weekly';
};

const EIA_V2_BASE = 'https://api.eia.gov/v2/petroleum/pri/spt/data/';

function buildUrl(apiKey: string, c: EiaPetroleumAdapterConfig): string {
  const u = new URL(EIA_V2_BASE);
  u.searchParams.set('api_key', apiKey);
  u.searchParams.set('frequency', c.frequency ?? 'daily');
  u.searchParams.append('data[0]', 'value');
  if (c.series || (!c.product && !c.duoarea)) {
    u.searchParams.append('facets[series][]', c.series ?? 'RWTC');
  } else {
    u.searchParams.append('facets[product][]', c.product ?? 'EPCWTI');
    u.searchParams.append('facets[duoarea][]', c.duoarea ?? 'RGC');
  }
  u.searchParams.append('sort[0][column]', 'period');
  u.searchParams.append('sort[0][direction]', 'desc');
  u.searchParams.set('length', '10');
  return u.toString();
}

function parsePeriod(row: Record<string, unknown>): string | null {
  const p = row.period ?? row['Period'];
  if (typeof p !== 'string') return null;
  const m = p.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1]! : null;
}

function parseValue(row: Record<string, unknown>): number | null {
  const v = row.value ?? row['Value'];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export const eiaPetroleumAdapter: IExternalApiAdapter = {
  key: 'eia-petroleum',
  async run(config: unknown) {
    const c = config as EiaPetroleumAdapterConfig;
    const apiKey = process.env.EIA_API_KEY?.trim();
    const scraperName = 'eia-petroleum';

    if (!c?.marketLocation || !c?.oilTypeCode) {
      return { status: 'error', errorMessage: 'config.marketLocation and config.oilTypeCode are required' };
    }
    if (!apiKey) {
      return {
        status: 'error',
        errorMessage: 'EIA_API_KEY is not set. Add it to .env.local / Vercel (https://www.eia.gov/opendata/).',
      };
    }

    const url = buildUrl(apiKey, c);

    try {
      const res = await fetch(url);
      const text = await res.text();
      let json: unknown;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        await sql`
          INSERT INTO src_scraper_logs (scraper_name, rows_inserted, status, error_message, raw_response_json)
          VALUES (${scraperName}, 0, 'error', ${`Invalid JSON from EIA (${res.status})`}, ${JSON.stringify({ sample: text.slice(0, 500) })}::jsonb)
        `;
        return { status: 'error', errorMessage: `EIA returned non-JSON (HTTP ${res.status})` };
      }

      const root = json as {
        response?: { data?: Record<string, unknown>[] };
        data?: Record<string, unknown>[];
        error?: string;
        errors?: unknown;
      };

      if (!res.ok) {
        const msg =
          (typeof root.error === 'string' && root.error) ||
          (root.errors != null ? JSON.stringify(root.errors).slice(0, 500) : '') ||
          `HTTP ${res.status}`;
        await sql`
          INSERT INTO src_scraper_logs (scraper_name, rows_inserted, status, error_message, raw_response_json)
          VALUES (${scraperName}, 0, 'error', ${`HTTP ${res.status}: ${msg}`}, ${JSON.stringify({ url: EIA_V2_BASE, body: root })}::jsonb)
        `;
        return { status: 'error', errorMessage: `EIA HTTP ${res.status}: ${msg}` };
      }

      const rows =
        root?.response?.data ??
        (Array.isArray(root.data) ? root.data : []) ??
        [];
      const first = rows.find((r) => parsePeriod(r) && parseValue(r) != null);
      if (!first) {
        const err = 'EIA returned no usable rows; check product/duoarea facets in config.';
        await sql`
          INSERT INTO src_scraper_logs (scraper_name, rows_inserted, status, error_message, raw_response_json)
          VALUES (${scraperName}, 0, 'error', ${err}, ${JSON.stringify({ sample: rows.slice(0, 3) })}::jsonb)
        `;
        return { status: 'error', errorMessage: err, rawResult: root };
      }

      const priceDate = parsePeriod(first)!;
      const close = parseValue(first)!;
      const priceUsdPerBbl = close.toFixed(2);

      const oilTypeId = await getOrCreateOilTypeId({
        oilTypeCode: c.oilTypeCode,
        oilTypeName: c.oilTypeName,
      });

      await sql`
        DELETE FROM fact_prices
        WHERE price_date = ${priceDate}
          OR oil_type_id = ${oilTypeId}
          OR market_location = ${c.marketLocation}
      `;

      await sql`
        INSERT INTO fact_prices (oil_type_id, price_usd_per_bbl, market_location, price_date)
        VALUES (${oilTypeId}, ${priceUsdPerBbl}::numeric, ${c.marketLocation}, ${priceDate})
      `;

      const extracted = {
        marketLocation: c.marketLocation,
        oilTypeCode: c.oilTypeCode,
        price_date: priceDate,
        close,
        source: 'EIA',
        series: c.series ?? (c.product && c.duoarea ? undefined : 'RWTC'),
        product: c.product,
        duoarea: c.duoarea,
      };

      await sql`
        INSERT INTO src_scraper_logs (scraper_name, rows_inserted, status, error_message, raw_response_json)
        VALUES (
          ${scraperName},
          1,
          'success',
          null,
          ${JSON.stringify({ url: EIA_V2_BASE, extracted })}::jsonb
        )
      `;

      return {
        status: 'success',
        recordsFetched: 1,
        rawResult: extracted,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await sql`
        INSERT INTO src_scraper_logs (scraper_name, rows_inserted, status, error_message, raw_response_json)
        VALUES (${scraperName}, 0, 'error', ${msg}, '{}'::jsonb)
      `;
      return { status: 'error', errorMessage: msg };
    }
  },
};

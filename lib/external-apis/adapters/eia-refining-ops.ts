/**
 * EIA Open Data v2 — regional refinery **inputs and outputs** (PADD / U.S. / refining districts),
 * not plant-level Form EIA-810.
 *
 * Routes:
 * - **wiup** — Weekly Inputs & Utilization: gross inputs (product EPXXX2), net crude (EPC0 + Refinery Net Input).
 * - **refp2** — Refinery Net Production (monthly): e.g. finished motor gasoline, distillate, jet kerosene.
 * - **inpt2** (optional) — Refinery Net Input monthly by area (crude EPC0), finer than PADD when enabled.
 *
 * @see https://www.eia.gov/opendata/browser/petroleum/pnp
 * Env: **EIA_API_KEY**
 */
import type { IExternalApiAdapter } from '../types';
import { sql } from '@/lib/db';

export type EiaRefiningOpsConfig = {
  /** Weekly wiup lookback. Default 26. */
  weeksBack?: number;
  /** Monthly refp2 / inpt2 lookback. Default 24. */
  monthsBack?: number;
  /** Gross inputs into refineries (wiup, product Gross Inputs). Default true. */
  grossInputWeekly?: boolean;
  /** Refinery net input of crude oil (wiup). Default true. */
  netCrudeWeekly?: boolean;
  /** Finished motor gasoline, distillate fuel oil, kerosene-type jet (refp2 monthly). Default true. */
  netProductionMonthly?: boolean;
  /** Refinery net input monthly (inpt2, crude) — more granular areas. Default false (large pull). */
  netInputMonthly?: boolean;
  /** refp2 product facet ids. Default EPM0F, EPD0, EPJK. */
  productionProducts?: string[];
};

const SCRAPER = 'eia-refining-ops';
const BASE = 'https://api.eia.gov/v2/petroleum/pnp';

type Frequency = 'weekly' | 'monthly';

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi);
}

function weeklyRange(weeksBack: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - clamp(weeksBack, 1, 520) * 7);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function monthlyRange(monthsBack: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - clamp(monthsBack, 1, 120), 1));
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  return { start: fmt(start), end: fmt(end) };
}

function stripApiKey(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete('api_key');
    return u.toString();
  } catch {
    return url;
  }
}

type FacetPair = [string, string];

async function fetchAllData(
  apiKey: string,
  route: string,
  frequency: Frequency,
  start: string,
  end: string,
  facets: FacetPair[],
): Promise<Record<string, unknown>[]> {
  const path = `${BASE}/${route}/data/`;
  const all: Record<string, unknown>[] = [];
  let offset = 0;
  const page = 5000;

  while (true) {
    const u = new URL(path);
    u.searchParams.set('api_key', apiKey);
    u.searchParams.set('frequency', frequency);
    u.searchParams.set('start', start);
    u.searchParams.set('end', end);
    u.searchParams.append('data[0]', 'value');
    u.searchParams.append('sort[0][column]', 'series');
    u.searchParams.append('sort[0][direction]', 'asc');
    u.searchParams.set('length', String(page));
    u.searchParams.set('offset', String(offset));
    for (const [k, v] of facets) {
      u.searchParams.append(`facets[${k}][]`, v);
    }

    const url = u.toString();
    const res = await fetch(url);
    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Invalid JSON (${res.status})`);
    }
    const root = json as { response?: { data?: Record<string, unknown>[] }; error?: string };
    if (!res.ok) {
      throw new Error(root.error ?? `HTTP ${res.status}`);
    }
    const batch = root.response?.data ?? [];
    all.push(...batch);
    if (batch.length < page) break;
    offset += page;
    if (offset > 25000) throw new Error('Pagination cap exceeded; narrow date range.');
  }
  return all;
}

function parseRow(
  route: string,
  frequency: Frequency,
  r: Record<string, unknown>,
): {
  eia_series_id: string;
  period: string;
  duoarea: string | null;
  area_name: string | null;
  product: string | null;
  product_name: string | null;
  process: string | null;
  process_name: string | null;
  value: string | null;
  units: string | null;
  series_description: string | null;
} | null {
  const series = typeof r.series === 'string' ? r.series : null;
  const period = typeof r.period === 'string' ? r.period : null;
  if (!series || !period) return null;
  return {
    eia_series_id: series,
    period,
    duoarea: typeof r.duoarea === 'string' ? r.duoarea : null,
    area_name: typeof r['area-name'] === 'string' ? r['area-name'] : null,
    product: typeof r.product === 'string' ? r.product : null,
    product_name: typeof r['product-name'] === 'string' ? r['product-name'] : null,
    process: typeof r.process === 'string' ? r.process : null,
    process_name: typeof r['process-name'] === 'string' ? r['process-name'] : null,
    value: r.value != null ? String(r.value) : null,
    units: typeof r.units === 'string' ? r.units : null,
    series_description: typeof r['series-description'] === 'string' ? r['series-description'] : null,
  };
}

export const eiaRefiningOpsAdapter: IExternalApiAdapter = {
  key: 'eia-refining-ops',
  async run(config: unknown) {
    const c = (config ?? {}) as EiaRefiningOpsConfig;
    const apiKey = process.env.EIA_API_KEY?.trim();
    const weeksBack =
      typeof c.weeksBack === 'number' && Number.isFinite(c.weeksBack) ? Math.floor(c.weeksBack) : 26;
    const monthsBack =
      typeof c.monthsBack === 'number' && Number.isFinite(c.monthsBack) ? Math.floor(c.monthsBack) : 24;

    const gross = c.grossInputWeekly !== false;
    const netCrudeW = c.netCrudeWeekly !== false;
    const netProd = c.netProductionMonthly !== false;
    const netInM = c.netInputMonthly === true;

    const prodList =
      Array.isArray(c.productionProducts) && c.productionProducts.length > 0
        ? c.productionProducts
        : ['EPM0F', 'EPD0', 'EPJK'];

    if (!apiKey) {
      return {
        status: 'error',
        errorMessage: 'EIA_API_KEY is not set. Add it to .env.local / Vercel (https://www.eia.gov/opendata/).',
      };
    }

    const jobs: Array<{ route: string; frequency: Frequency; range: { start: string; end: string }; facets: FacetPair[] }> =
      [];

    const wr = weeklyRange(weeksBack);
    const mr = monthlyRange(monthsBack);

    if (gross) {
      jobs.push({
        route: 'wiup',
        frequency: 'weekly',
        range: wr,
        facets: [
          ['product', 'EPXXX2'],
          ['process', 'YIY'],
        ],
      });
    }
    if (netCrudeW) {
      jobs.push({
        route: 'wiup',
        frequency: 'weekly',
        range: wr,
        facets: [
          ['product', 'EPC0'],
          ['process', 'YIY'],
        ],
      });
    }
    if (netProd) {
      for (const p of prodList) {
        jobs.push({
          route: 'refp2',
          frequency: 'monthly',
          range: mr,
          facets: [['product', p]],
        });
      }
    }
    if (netInM) {
      jobs.push({
        route: 'inpt2',
        frequency: 'monthly',
        range: mr,
        facets: [
          ['product', 'EPC0'],
          ['process', 'YIY'],
        ],
      });
    }

    if (jobs.length === 0) {
      return { status: 'error', errorMessage: 'All dataset flags are disabled; enable at least one in config.' };
    }

    let upserted = 0;
    const errors: string[] = [];

    for (const job of jobs) {
      try {
        const raw = await fetchAllData(
          apiKey,
          job.route,
          job.frequency,
          job.range.start,
          job.range.end,
          job.facets,
        );
        for (const row of raw) {
          const p = parseRow(job.route, job.frequency, row);
          if (!p) continue;

          await sql`
            INSERT INTO fact_eia_refining_ops (
              eia_series_id,
              period,
              route_id,
              frequency,
              duoarea,
              area_name,
              product,
              product_name,
              process,
              process_name,
              value,
              units,
              series_description
            )
            VALUES (
              ${p.eia_series_id},
              ${p.period},
              ${job.route},
              ${job.frequency},
              ${p.duoarea},
              ${p.area_name},
              ${p.product},
              ${p.product_name},
              ${p.process},
              ${p.process_name},
              ${p.value},
              ${p.units},
              ${p.series_description}
            )
            ON CONFLICT (eia_series_id, period) DO UPDATE SET
              route_id = EXCLUDED.route_id,
              frequency = EXCLUDED.frequency,
              duoarea = EXCLUDED.duoarea,
              area_name = EXCLUDED.area_name,
              product = EXCLUDED.product,
              product_name = EXCLUDED.product_name,
              process = EXCLUDED.process,
              process_name = EXCLUDED.process_name,
              value = EXCLUDED.value,
              units = EXCLUDED.units,
              series_description = EXCLUDED.series_description
          `;
          upserted += 1;
        }
      } catch (e) {
        errors.push(`${job.route}/${job.frequency}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    const summary = {
      jobs: jobs.length,
      rowsUpserted: upserted,
      errors,
    };

    await sql`
      INSERT INTO src_scraper_logs (scraper_name, rows_inserted, status, error_message, raw_response_json)
      VALUES (
        ${SCRAPER},
        ${upserted},
        ${upserted === 0 ? 'error' : 'success'},
        ${errors.length > 0 ? errors.join('; ').slice(0, 2000) : null},
        ${JSON.stringify(summary)}::jsonb
      )
    `;

    if (errors.length > 0 && upserted === 0) {
      return {
        status: 'error',
        errorMessage: errors.join('; '),
        rawResult: summary,
      };
    }

    return {
      status: 'success',
      recordsFetched: upserted,
      rawResult: summary,
    };
  },
};

/**
 * EIA Open Data v2 — `petroleum/pnp/cap1` (Number and Capacity of Petroleum Refineries).
 * Ingests **regional** operable atmospheric crude distillation capacity (annual, B/CD or B/SD),
 * not per-refinery Table 3 (city/owner/plant) — those are not exposed on this JSON route.
 *
 * @see https://www.eia.gov/opendata/browser/petroleum/pnp/cap1
 * Env: **EIA_API_KEY**
 */
import type { IExternalApiAdapter } from '../types';
import { sql } from '@/lib/db';

export type EiaRefineryCapacityAdapterConfig = {
  /** Annual period (EIA reports Jan 1 capacity). Default: current calendar year. */
  year?: number;
  /** If true, use barrels per **stream** day (B/SD); default false = calendar day (B/CD). */
  streamDay?: boolean;
};

const EIA_CAP1_DATA = 'https://api.eia.gov/v2/petroleum/pnp/cap1/data/';
const SCRAPER = 'eia-refinery-capacity';
const US_ISO = 'USA';

function parseNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
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

export const eiaRefineryCapacityAdapter: IExternalApiAdapter = {
  key: 'eia-refinery-capacity',
  async run(config: unknown) {
    const c = (config ?? {}) as EiaRefineryCapacityAdapterConfig;
    const apiKey = process.env.EIA_API_KEY?.trim();
    const year =
      typeof c.year === 'number' && Number.isFinite(c.year) && c.year > 1900
        ? Math.floor(c.year)
        : new Date().getFullYear();
    const streamDay = Boolean(c.streamDay);
    const unitsWanted = streamDay ? 'B/SD' : 'B/CD';

    if (!apiKey) {
      return {
        status: 'error',
        errorMessage: 'EIA_API_KEY is not set. Add it to .env.local / Vercel (https://www.eia.gov/opendata/).',
      };
    }

    await sql`
      INSERT INTO dim_countries (iso_code, country_name, region)
      VALUES (${US_ISO}, ${'United States'}, ${'North America'})
      ON CONFLICT (iso_code) DO NOTHING
    `;

    const allRows: Record<string, unknown>[] = [];
    let offset = 0;
    const page = 5000;

    while (true) {
      const u = new URL(EIA_CAP1_DATA);
      u.searchParams.set('api_key', apiKey);
      u.searchParams.set('frequency', 'annual');
      u.searchParams.set('start', String(year));
      u.searchParams.set('end', String(year));
      u.searchParams.append('data[0]', 'value');
      u.searchParams.append('facets[process][]', '8D0');
      u.searchParams.append('sort[0][column]', 'series');
      u.searchParams.append('sort[0][direction]', 'asc');
      u.searchParams.set('length', String(page));
      u.searchParams.set('offset', String(offset));

      const url = u.toString();
      const res = await fetch(url);
      const text = await res.text();
      let json: unknown;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        await sql`
          INSERT INTO src_scraper_logs (scraper_name, rows_inserted, status, error_message, raw_response_json)
          VALUES (${SCRAPER}, 0, 'error', ${`Invalid JSON from EIA (${res.status})`}, ${JSON.stringify({ sample: text.slice(0, 500) })}::jsonb)
        `;
        return { status: 'error', errorMessage: `EIA returned non-JSON (HTTP ${res.status})` };
      }

      const root = json as {
        response?: { data?: Record<string, unknown>[]; total?: string };
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
          VALUES (${SCRAPER}, 0, 'error', ${`HTTP ${res.status}: ${msg}`}, ${JSON.stringify({ url: stripApiKey(url), body: root })}::jsonb)
        `;
        return { status: 'error', errorMessage: `EIA HTTP ${res.status}: ${msg}` };
      }

      const batch = root.response?.data ?? [];
      allRows.push(...batch);
      if (batch.length < page) break;
      offset += page;
      if (offset > 20000) {
        await sql`
          INSERT INTO src_scraper_logs (scraper_name, rows_inserted, status, error_message, raw_response_json)
          VALUES (${SCRAPER}, 0, 'error', ${'EIA pagination cap exceeded'}, ${JSON.stringify({ offset })}::jsonb)
        `;
        return { status: 'error', errorMessage: 'EIA pagination cap exceeded; narrow year/facets.' };
      }
    }

    const usable = allRows
      .map((r) => {
        const series = typeof r.series === 'string' ? r.series : null;
        const duoarea = typeof r.duoarea === 'string' ? r.duoarea : null;
        const areaName = typeof r['area-name'] === 'string' ? r['area-name'] : '';
        const units = typeof r.units === 'string' ? r.units : '';
        const val = parseNum(r.value);
        if (!series || !duoarea || val == null) return null;
        if (units !== unitsWanted) return null;
        const name =
          areaName && areaName.trim()
            ? `${areaName.trim()} (${duoarea}) — EIA atmospheric distillation (${unitsWanted})`
            : `${duoarea} — EIA 8D0`;
        const capacityKbd = Math.round(val / 1000);
        return { series, duoarea, name, capacityKbd };
      })
      .filter((r): r is NonNullable<typeof r> => r != null);

    if (usable.length === 0) {
      const err = `EIA returned no rows for year=${year} process=8D0 units=${unitsWanted}; check data availability.`;
      await sql`
        INSERT INTO src_scraper_logs (scraper_name, rows_inserted, status, error_message, raw_response_json)
        VALUES (${SCRAPER}, 0, 'error', ${err}, ${JSON.stringify({ totalRaw: allRows.length, sample: allRows.slice(0, 2) })}::jsonb)
      `;
      return { status: 'error', errorMessage: err };
    }

    let upserted = 0;
    for (const row of usable) {
      await sql`
        INSERT INTO dim_refineries (
          name,
          country_code,
          capacity_kbd,
          operator,
          type,
          eia_series_id,
          eia_duoarea,
          eia_report_year
        )
        VALUES (
          ${row.name},
          ${US_ISO},
          ${row.capacityKbd},
          ${null},
          ${'Refinery'},
          ${row.series},
          ${row.duoarea},
          ${year}
        )
        ON CONFLICT (eia_series_id) DO UPDATE SET
          name = EXCLUDED.name,
          capacity_kbd = EXCLUDED.capacity_kbd,
          eia_duoarea = EXCLUDED.eia_duoarea,
          eia_report_year = EXCLUDED.eia_report_year,
          country_code = EXCLUDED.country_code,
          type = EXCLUDED.type
      `;
      upserted += 1;
    }

    const extracted = usable.map((r) => ({
      eia_series_id: r.series,
      eia_duoarea: r.duoarea,
      eia_report_year: year,
      capacity_kbd: r.capacityKbd,
      process: '8D0',
      units: unitsWanted,
    }));

    await sql`
      INSERT INTO src_scraper_logs (scraper_name, rows_inserted, status, error_message, raw_response_json)
      VALUES (
        ${SCRAPER},
        ${upserted},
        'success',
        null,
        ${JSON.stringify({
          route: 'petroleum/pnp/cap1',
          year,
          process: '8D0',
          units: unitsWanted,
          rowsFetched: allRows.length,
          upserted,
          extracted: extracted.slice(0, 30),
        })}::jsonb
      )
    `;

    return {
      status: 'success',
      recordsFetched: upserted,
      rawResult: extracted,
    };
  },
};

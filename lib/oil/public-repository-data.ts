/**
 * Read-only Neon oil data for public marketing pages (catalog + filters + CSV export).
 */
import { and, asc, count, desc, eq, gte, isNull, lte, type SQL } from 'drizzle-orm';
import type { AnyPgTable } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  dim_oil_types,
  fact_prices,
  fact_production,
  fact_shipments,
  src_scraper_logs,
} from '@/lib/db/schema';

export type PublicPriceRow = {
  price_id: number;
  price_date: string;
  price_usd_per_bbl: string | null;
  source: string | null;
  market_location: string | null;
  oil_type_code: string | null;
  oil_type_name: string | null;
};

export type PublicScraperLogRow = {
  log_id: number;
  scraper_name: string;
  run_time: string | null;
  rows_inserted: number | null;
  status: string | null;
  error_message: string | null;
};

export type PublicRepositoryData = {
  counts: {
    fact_prices: number;
    fact_shipments: number;
    fact_production: number;
  };
  prices: PublicPriceRow[];
  scraper_logs: PublicScraperLogRow[];
};

/** URL param `source=_none_` means rows where `source` IS NULL (legacy ingests). */
export const SOURCE_PARAM_NONE = '_none_';

export type CatalogFilters = {
  source?: string;
  oilTypeCode?: string;
  market?: string;
  from?: string;
  to?: string;
  limit?: number;
};

export type CatalogFacets = {
  sources: string[];
  hasUnknownSource: boolean;
  oilTypes: Array<{ code: string; name: string }>;
  markets: string[];
};

export type PriceSummary = {
  rowCount: number;
  minDate: string | null;
  maxDate: string | null;
};

export type PublicCatalogPageData = {
  counts: PublicRepositoryData['counts'];
  summary: PriceSummary;
  facets: CatalogFacets;
  prices: PublicPriceRow[];
  scraper_logs: PublicScraperLogRow[];
  appliedFilters: CatalogFilters;
  effectiveLimit: number;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 1000;
/** Max rows returned by CSV export endpoint. */
export const EXPORT_MAX = 5000;

async function countSafe(table: AnyPgTable): Promise<number> {
  try {
    const [r] = await db.select({ n: count() }).from(table);
    return Number(r?.n ?? 0);
  } catch {
    return 0;
  }
}

function isoDate(d: unknown): string {
  if (d == null) return '';
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}

function safeIsoTime(v: unknown): string | null {
  if (v == null) return null;
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function clampLimit(n: number | undefined, cap: number): number {
  if (n == null || !Number.isFinite(n)) return DEFAULT_LIMIT;
  const x = Math.floor(n);
  return Math.min(Math.max(x, 1), cap);
}

function validIsoDate(s: string | undefined): string | undefined {
  if (!s || !ISO_DATE.test(s)) return undefined;
  return s;
}

export function parseCatalogFiltersFromRecord(sp: {
  [key: string]: string | string[] | undefined;
}): CatalogFilters {
  const val = (k: string): string => {
    const v = sp[k];
    if (typeof v === 'string') return v;
    if (Array.isArray(v) && v[0] != null) return String(v[0]);
    return '';
  };
  const limitRaw = val('limit');
  const limitParsed = limitRaw ? parseInt(limitRaw, 10) : NaN;
  return {
    source: val('source') || undefined,
    oilTypeCode: val('oil') || undefined,
    market: val('market') || undefined,
    from: validIsoDate(val('from') || undefined),
    to: validIsoDate(val('to') || undefined),
    limit: Number.isFinite(limitParsed) ? limitParsed : undefined,
  };
}

export function catalogFiltersToSearchParams(f: CatalogFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.source) p.set('source', f.source);
  if (f.oilTypeCode) p.set('oil', f.oilTypeCode);
  if (f.market) p.set('market', f.market);
  if (f.from) p.set('from', f.from);
  if (f.to) p.set('to', f.to);
  if (f.limit != null && f.limit !== DEFAULT_LIMIT) p.set('limit', String(f.limit));
  return p;
}

async function getPriceSummary(): Promise<PriceSummary> {
  try {
    const [row] = await db
      .select({
        n: count(),
        minD: sql<string | null>`min(${fact_prices.price_date})`,
        maxD: sql<string | null>`max(${fact_prices.price_date})`,
      })
      .from(fact_prices);
    return {
      rowCount: Number(row?.n ?? 0),
      minDate: row?.minD ?? null,
      maxDate: row?.maxD ?? null,
    };
  } catch {
    return { rowCount: 0, minDate: null, maxDate: null };
  }
}

async function getCatalogFacets(): Promise<CatalogFacets> {
  const empty: CatalogFacets = {
    sources: [],
    hasUnknownSource: false,
    oilTypes: [],
    markets: [],
  };
  try {
    const srcRows = await db
      .select({ source: fact_prices.source })
      .from(fact_prices)
      .groupBy(fact_prices.source);

    const sources: string[] = [];
    let hasUnknownSource = false;
    for (const r of srcRows) {
      if (r.source == null || r.source === '') hasUnknownSource = true;
      else sources.push(r.source);
    }
    sources.sort((a, b) => a.localeCompare(b));

    const oilRows = await db
      .select({
        code: dim_oil_types.code,
        name: dim_oil_types.name,
      })
      .from(fact_prices)
      .innerJoin(dim_oil_types, eq(fact_prices.oil_type_id, dim_oil_types.id))
      .groupBy(dim_oil_types.id, dim_oil_types.code, dim_oil_types.name)
      .orderBy(asc(dim_oil_types.code));

    const mRows = await db
      .select({ market: fact_prices.market_location })
      .from(fact_prices)
      .groupBy(fact_prices.market_location)
      .orderBy(asc(fact_prices.market_location));

    const markets = mRows
      .map((r) => r.market)
      .filter((m): m is string => m != null && m !== '');

    return {
      sources,
      hasUnknownSource,
      oilTypes: oilRows.map((o) => ({ code: o.code, name: o.name })),
      markets,
    };
  } catch {
    return empty;
  }
}

function buildCatalogWhere(filters: CatalogFilters): SQL | undefined {
  const parts: SQL[] = [];

  if (filters.source === SOURCE_PARAM_NONE) {
    parts.push(isNull(fact_prices.source));
  } else if (filters.source && filters.source !== 'all') {
    parts.push(eq(fact_prices.source, filters.source));
  }

  if (filters.oilTypeCode) {
    parts.push(eq(dim_oil_types.code, filters.oilTypeCode));
  }

  if (filters.market) {
    parts.push(eq(fact_prices.market_location, filters.market));
  }

  if (filters.from) {
    parts.push(gte(fact_prices.price_date, filters.from));
  }
  if (filters.to) {
    parts.push(lte(fact_prices.price_date, filters.to));
  }

  if (parts.length === 0) return undefined;
  return and(...parts);
}

export async function queryCatalogPrices(
  filters: CatalogFilters,
  options?: { maxLimit?: number }
): Promise<PublicPriceRow[]> {
  const cap = options?.maxLimit ?? MAX_LIMIT;
  const effectiveLimit = clampLimit(filters.limit, cap);

  try {
    const where = buildCatalogWhere(filters);
    const base = db
      .select({
        price_id: fact_prices.price_id,
        price_date: fact_prices.price_date,
        price_usd_per_bbl: fact_prices.price_usd_per_bbl,
        source: fact_prices.source,
        market_location: fact_prices.market_location,
        oil_type_code: dim_oil_types.code,
        oil_type_name: dim_oil_types.name,
      })
      .from(fact_prices)
      .leftJoin(dim_oil_types, eq(fact_prices.oil_type_id, dim_oil_types.id));

    const rows = where
      ? await base.where(where).orderBy(desc(fact_prices.price_date)).limit(effectiveLimit)
      : await base.orderBy(desc(fact_prices.price_date)).limit(effectiveLimit);

    return rows.map((r) => ({
      price_id: r.price_id,
      price_date: isoDate(r.price_date),
      price_usd_per_bbl: r.price_usd_per_bbl != null ? String(r.price_usd_per_bbl) : null,
      source: r.source,
      market_location: r.market_location,
      oil_type_code: r.oil_type_code,
      oil_type_name: r.oil_type_name,
    }));
  } catch {
    return [];
  }
}

export function pricesToCsv(rows: PublicPriceRow[]): string {
  const header = ['price_date', 'source', 'oil_type_code', 'oil_type_name', 'market_location', 'price_usd_per_bbl'];
  const lines = [header.join(',')];
  for (const r of rows) {
    const esc = (s: string | null) => {
      if (s == null) return '';
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    lines.push(
      [
        esc(r.price_date),
        esc(r.source),
        esc(r.oil_type_code),
        esc(r.oil_type_name),
        esc(r.market_location),
        esc(r.price_usd_per_bbl),
      ].join(',')
    );
  }
  return lines.join('\n');
}

async function getScraperLogs(limit: number): Promise<PublicScraperLogRow[]> {
  try {
    const logs = await db
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
      .limit(limit);

    return logs.map((row) => ({
      log_id: row.log_id,
      scraper_name: row.scraper_name,
      run_time: safeIsoTime(row.run_time),
      rows_inserted: row.rows_inserted,
      status: row.status,
      error_message: row.error_message,
    }));
  } catch {
    return [];
  }
}

/** Full public catalog page: summary, facets, filtered prices, ingestion logs. */
export async function getPublicCatalogPageData(filters: CatalogFilters): Promise<PublicCatalogPageData> {
  const effectiveLimit = clampLimit(filters.limit, MAX_LIMIT);

  const [counts, summary, facets, prices, scraper_logs] = await Promise.all([
    (async () => ({
      fact_prices: await countSafe(fact_prices),
      fact_shipments: await countSafe(fact_shipments),
      fact_production: await countSafe(fact_production),
    }))(),
    getPriceSummary(),
    getCatalogFacets(),
    queryCatalogPrices({ ...filters, limit: effectiveLimit }),
    getScraperLogs(20),
  ]);

  return {
    counts,
    summary,
    facets,
    prices,
    scraper_logs,
    appliedFilters: filters,
    effectiveLimit,
  };
}

/** @deprecated Prefer getPublicCatalogPageData — kept for older call sites. */
export async function getPublicRepositoryData(): Promise<PublicRepositoryData> {
  const counts = {
    fact_prices: await countSafe(fact_prices),
    fact_shipments: await countSafe(fact_shipments),
    fact_production: await countSafe(fact_production),
  };

  const prices = await queryCatalogPrices({ limit: 100 });
  const scraper_logs = await getScraperLogs(20);

  return { counts, prices, scraper_logs };
}

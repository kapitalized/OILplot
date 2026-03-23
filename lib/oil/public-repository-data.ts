/**
 * Read-only snapshot of Neon oil tables for public marketing pages.
 */
import { count, desc, eq } from 'drizzle-orm';
import type { AnyPgTable } from 'drizzle-orm/pg-core';
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

export async function getPublicRepositoryData(): Promise<PublicRepositoryData> {
  const counts = {
    fact_prices: await countSafe(fact_prices),
    fact_shipments: await countSafe(fact_shipments),
    fact_production: await countSafe(fact_production),
  };

  let prices: PublicPriceRow[] = [];
  try {
    const rows = await db
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
      .leftJoin(dim_oil_types, eq(fact_prices.oil_type_id, dim_oil_types.id))
      .orderBy(desc(fact_prices.price_date))
      .limit(100);

    prices = rows.map((r) => ({
      price_id: r.price_id,
      price_date: isoDate(r.price_date),
      price_usd_per_bbl: r.price_usd_per_bbl != null ? String(r.price_usd_per_bbl) : null,
      source: r.source,
      market_location: r.market_location,
      oil_type_code: r.oil_type_code,
      oil_type_name: r.oil_type_name,
    }));
  } catch {
    prices = [];
  }

  let scraper_logs: PublicScraperLogRow[] = [];
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
      .limit(20);

    scraper_logs = logs.map((row) => ({
      log_id: row.log_id,
      scraper_name: row.scraper_name,
      run_time: safeIsoTime(row.run_time),
      rows_inserted: row.rows_inserted,
      status: row.status,
      error_message: row.error_message,
    }));
  } catch {
    scraper_logs = [];
  }

  return { counts, prices, scraper_logs };
}

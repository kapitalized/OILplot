/**
 * Read-only data for public /visualise/* marketing pages.
 */
import { asc, desc, eq, isNotNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { dim_oil_types, dim_refineries, fact_eia_refining_ops, fact_prices } from '@/lib/db/schema';

export type SpotChartPoint = { date: string; price: number };

export type SpotPriceChartData = {
  title: string;
  subtitle: string;
  points: SpotChartPoint[];
};

export type RefineryRegionRow = {
  ref_id: number;
  name: string;
  capacity_kbd: number | null;
  eia_series_id: string | null;
  eia_duoarea: string | null;
  eia_report_year: number | null;
  country_code: string | null;
};

function isoDate(d: unknown): string {
  if (d == null) return '';
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}

function parsePrice(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

/** Line chart: prefer WTI; otherwise most recent window of any ingested prices. */
export async function getSpotPriceChartData(maxPoints = 400): Promise<SpotPriceChartData> {
  try {
    const wti = await db
      .select({
        price_date: fact_prices.price_date,
        price_usd_per_bbl: fact_prices.price_usd_per_bbl,
        market_location: fact_prices.market_location,
        oil_code: dim_oil_types.code,
      })
      .from(fact_prices)
      .innerJoin(dim_oil_types, eq(fact_prices.oil_type_id, dim_oil_types.id))
      .where(eq(dim_oil_types.code, 'WTI'))
      .orderBy(desc(fact_prices.price_date))
      .limit(maxPoints);

    const wtiAsc = [...wti].reverse();
    const wtiPoints: SpotChartPoint[] = wtiAsc
      .map((r) => {
        const p = parsePrice(r.price_usd_per_bbl);
        const d = isoDate(r.price_date);
        if (p == null || !d) return null;
        return { date: d, price: p };
      })
      .filter((x): x is SpotChartPoint => x != null);

    if (wtiPoints.length > 0) {
      const mk = wti[0]?.market_location ?? 'WTI';
      return {
        title: 'WTI spot (close)',
        subtitle: `Market: ${mk} · ${wtiPoints.length} observations (newest window)`,
        points: wtiPoints,
      };
    }

    const anyRows = await db
      .select({
        price_date: fact_prices.price_date,
        price_usd_per_bbl: fact_prices.price_usd_per_bbl,
        market_location: fact_prices.market_location,
        oil_code: dim_oil_types.code,
      })
      .from(fact_prices)
      .leftJoin(dim_oil_types, eq(fact_prices.oil_type_id, dim_oil_types.id))
      .orderBy(desc(fact_prices.price_date))
      .limit(maxPoints);

    const ascRows = [...anyRows].reverse();
    const points: SpotChartPoint[] = ascRows
      .map((r) => {
        const p = parsePrice(r.price_usd_per_bbl);
        const d = isoDate(r.price_date);
        if (p == null || !d) return null;
        return { date: d, price: p };
      })
      .filter((x): x is SpotChartPoint => x != null);

    const sample = anyRows[0];
    const label = sample?.oil_code ?? sample?.market_location ?? 'Spot prices';

    return {
      title: `${label} (close)`,
      subtitle:
        points.length > 0
          ? `${points.length} observations — ingest WTI (Yahoo/EIA) for a dedicated WTI series`
          : 'No rows in fact_prices yet — run External API sources from admin.',
      points,
    };
  } catch {
    return {
      title: 'Spot prices',
      subtitle: 'Repository unavailable.',
      points: [],
    };
  }
}

/** EIA regional capacity rows (dim_refineries with eia_series_id). */
export type RefiningOpsRow = {
  id: number;
  period: string;
  route_id: string;
  frequency: string;
  duoarea: string | null;
  area_name: string | null;
  product_name: string | null;
  process_name: string | null;
  value: string | null;
  units: string | null;
  series_description: string | null;
};

/** Latest rows from fact_eia_refining_ops (EIA regional I/O). */
export async function getRefiningOpsPreview(limit = 150): Promise<RefiningOpsRow[]> {
  try {
    const rows = await db
      .select({
        id: fact_eia_refining_ops.id,
        period: fact_eia_refining_ops.period,
        route_id: fact_eia_refining_ops.route_id,
        frequency: fact_eia_refining_ops.frequency,
        duoarea: fact_eia_refining_ops.duoarea,
        area_name: fact_eia_refining_ops.area_name,
        product_name: fact_eia_refining_ops.product_name,
        process_name: fact_eia_refining_ops.process_name,
        value: fact_eia_refining_ops.value,
        units: fact_eia_refining_ops.units,
        series_description: fact_eia_refining_ops.series_description,
      })
      .from(fact_eia_refining_ops)
      .orderBy(desc(fact_eia_refining_ops.period), desc(fact_eia_refining_ops.id))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      period: r.period,
      route_id: r.route_id,
      frequency: r.frequency,
      duoarea: r.duoarea,
      area_name: r.area_name,
      product_name: r.product_name,
      process_name: r.process_name,
      value: r.value != null ? String(r.value) : null,
      units: r.units,
      series_description: r.series_description,
    }));
  } catch {
    return [];
  }
}

export async function getRefineryRegionRows(): Promise<RefineryRegionRow[]> {
  try {
    const rows = await db
      .select({
        ref_id: dim_refineries.ref_id,
        name: dim_refineries.name,
        capacity_kbd: dim_refineries.capacity_kbd,
        eia_series_id: dim_refineries.eia_series_id,
        eia_duoarea: dim_refineries.eia_duoarea,
        eia_report_year: dim_refineries.eia_report_year,
        country_code: dim_refineries.country_code,
      })
      .from(dim_refineries)
      .where(isNotNull(dim_refineries.eia_series_id))
      .orderBy(desc(dim_refineries.capacity_kbd));

    return rows.map((r) => ({
      ref_id: r.ref_id,
      name: r.name,
      capacity_kbd: r.capacity_kbd ?? null,
      eia_series_id: r.eia_series_id,
      eia_duoarea: r.eia_duoarea,
      eia_report_year: r.eia_report_year,
      country_code: r.country_code,
    }));
  } catch {
    return [];
  }
}

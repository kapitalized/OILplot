/**
 * Seed default Payload `api-sources` for oil ingestion (Yahoo WTI + optional EIA WTI).
 * Idempotent: skips if a source with the same `name` already exists.
 */

import { getPayload } from 'payload';
import config from '@payload-config';

export type SeedOilSourcesResult = { created: string[]; skipped: string[] };

const DEFAULT_SOURCES: Array<{
  name: string;
  adapter: string;
  enabled: boolean;
  config: Record<string, unknown>;
}> = [
  {
    name: 'WTI spot (Yahoo)',
    adapter: 'yahoo-prices',
    enabled: true,
    config: {
      markets: [
        {
          oilTypeCode: 'WTI',
          oilTypeName: 'WTI',
          yahooSymbol: 'CL=F',
          marketLocation: 'WTI',
        },
      ],
      lookbackDays: 16,
    },
  },
  {
    name: 'WTI spot (EIA)',
    adapter: 'eia-petroleum',
    enabled: false,
    config: {
      marketLocation: 'WTI EIA',
      oilTypeCode: 'WTI',
      oilTypeName: 'WTI',
      series: 'RWTC',
      frequency: 'daily',
    },
  },
  {
    name: 'EIA regional refinery capacity (cap1)',
    adapter: 'eia-refinery-capacity',
    enabled: false,
    config: {
      year: new Date().getFullYear(),
      streamDay: false,
    },
  },
  {
    name: 'EIA refinery inputs & outputs (wiup/refp2)',
    adapter: 'eia-refining-ops',
    enabled: false,
    config: {
      weeksBack: 26,
      monthsBack: 24,
      grossInputWeekly: true,
      netCrudeWeekly: true,
      netProductionMonthly: true,
      netInputMonthly: false,
    },
  },
];

export async function seedOilApiSources(): Promise<SeedOilSourcesResult> {
  const resolvedConfig = typeof config.then === 'function' ? await config : config;
  const payload = await getPayload({ config: resolvedConfig });
  const created: string[] = [];
  const skipped: string[] = [];

  for (const src of DEFAULT_SOURCES) {
    const existing = await payload.find({
      collection: 'api-sources',
      where: { name: { equals: src.name } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      skipped.push(src.name);
      continue;
    }
    await payload.create({
      collection: 'api-sources',
      data: {
        name: src.name,
        adapter: src.adapter,
        config: src.config,
        enabled: src.enabled,
      },
    });
    created.push(src.name);
  }

  return { created, skipped };
}

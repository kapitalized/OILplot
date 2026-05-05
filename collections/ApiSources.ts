import type { CollectionConfig } from 'payload';

/**
 * External API sources — one record per configured API (modular: add adapters in lib/external-apis).
 * Use with cron-job.org: create a job that calls POST /api/cron/sync-external with CRON_SECRET and ?sourceId=<id>.
 */
export const ApiSources: CollectionConfig = {
  slug: 'api-sources',
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
    defaultColumns: ['name', 'adapter', 'enabled', 'updatedAt'],
    description:
      'One row per data feed. Put secrets (EIA key, etc.) in server env — not here. EIA: set EIA_API_KEY in .env.local / Vercel. Yahoo Finance needs no API key. Edit **config** JSON for length / lookbackDays / symbols.',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    create: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'admin'),
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { placeholder: 'e.g. CRM API' } },
    {
      name: 'adapter',
      type: 'text',
      required: true,
      defaultValue: 'generic',
      admin: {
        description:
          'Exact key: yahoo-prices | eia-petroleum | eia-refinery-capacity | eia-refining-ops | generic. Oil: prices use yahoo-prices/eia-petroleum; capacity uses eia-refinery-capacity; regional refinery I/O (gross input, net crude, net production) uses eia-refining-ops.',
      },
    },
    {
      name: 'config',
      type: 'json',
      required: true,
      admin: {
        description:
          'Run settings (no API keys). EIA: add `"length": 500` for more daily rows per run. Yahoo: `"lookbackDays": 365` for history. Examples: Yahoo WTI `{"markets":[{"oilTypeCode":"WTI","oilTypeName":"WTI","yahooSymbol":"CL=F","marketLocation":"WTI"}],"lookbackDays":30}`. EIA WTI `{"marketLocation":"WTI EIA","oilTypeCode":"WTI","series":"RWTC","frequency":"daily","length":365}`. EIA regional refinery capacity → dim_refineries: `{}` or `{"year":2025,"streamDay":false}`. EIA refinery I/O → fact_eia_refining_ops: `{}` or `{"weeksBack":26,"monthsBack":24,"netInputMonthly":false}`.',
      },
    },
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    {
      name: 'cronJobId',
      type: 'text',
      admin: {
        description: 'Optional: cron-job.org job ID for reference (console.cron-job.org).',
      },
    },
    {
      name: 'lastRunAt',
      type: 'date',
      admin: { readOnly: true, description: 'Set automatically after each run.' },
    },
  ],
};

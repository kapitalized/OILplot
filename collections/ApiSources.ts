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
    description:
      'One row per data feed. Put secrets (EIA key, etc.) in server env — not here. EIA: set EIA_API_KEY in .env.local / Vercel. Yahoo Finance needs no API key.',
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
          'Exact key: yahoo-prices | eia-petroleum | generic. Oil: use yahoo-prices or eia-petroleum (see config examples below).',
      },
    },
    {
      name: 'config',
      type: 'json',
      required: true,
      admin: {
        description:
          'JSON only — no API keys here. Examples: WTI from Yahoo: {"markets":[{"oilTypeCode":"WTI","oilTypeName":"WTI","yahooSymbol":"CL=F","marketLocation":"WTI"}],"lookbackDays":16}. WTI from EIA (needs EIA_API_KEY in env): {"marketLocation":"WTI EIA","oilTypeCode":"WTI","series":"RWTC","frequency":"daily"}.',
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

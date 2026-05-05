import Link from 'next/link';
import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';
import { getAppName } from '@/lib/app-name';

export async function generateMetadata(): Promise<Metadata> {
  const appName = await getAppName();
  return {
    title: `Visualise | ${appName}`,
    description: `Charts and views over ${BRAND.name} open repository data — spot prices, refinery capacity, and more.`,
  };
}

export default async function VisualiseHubPage() {
  const appName = await getAppName();

  const cards = [
    {
      href: '/visualise/spot-prices',
      title: 'Spot prices',
      body: 'Time series from ingested WTI (or fallback) closes in fact_prices — line chart plus link to the full data catalog.',
    },
    {
      href: '/visualise/refineries',
      title: 'Refinery capacity',
      body: 'EIA regional operable distillation capacity (cap1 / 8D0) stored in dim_refineries — bar chart and sortable-style table.',
    },
    {
      href: '/visualise/refining-ops',
      title: 'Refinery inputs & outputs',
      body: 'Weekly gross input / net crude (wiup) and monthly net production (refp2) in fact_eia_refining_ops — table preview.',
    },
  ] as const;

  return (
    <>
      <h1 className="font-display text-3xl sm:text-4xl tracking-tighter text-oilplot-ink">Visualise</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-oilplot-ink/70">
        Read-only charts built from the same Neon tables as the{' '}
        <Link href="/repository" className="font-medium text-oilplot-coral underline-offset-2 hover:underline">
          data catalog
        </Link>
        . Add routes here over time (e.g. production, shipments) using the same <code className="font-mono text-xs">/visualise/…</code>{' '}
        pattern.
      </p>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="group block h-full rounded-sm border-4 border-oilplot-ink bg-oilplot-cream/40 p-6 transition-colors hover:bg-oilplot-cream/70"
            >
              <h2 className="font-display text-xl tracking-tight text-oilplot-ink group-hover:text-oilplot-coral">
                {c.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-oilplot-ink/70">{c.body}</p>
              <span className="mt-4 inline-block text-[10px] font-black uppercase tracking-[0.25em] text-oilplot-ink/45">
                Open →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-[10px] font-bold uppercase tracking-[0.3em] text-oilplot-ink/40">
        {appName} · Open repository
      </p>
    </>
  );
}

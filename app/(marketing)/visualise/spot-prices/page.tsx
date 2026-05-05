import Link from 'next/link';
import type { Metadata } from 'next';
import { SimpleSvgLineChart } from '@/components/marketing/charts/SimpleSvgLineChart';
import { getAppName } from '@/lib/app-name';
import { BRAND } from '@/lib/brand';
import { getSpotPriceChartData } from '@/lib/oil/visualise-data';

export async function generateMetadata(): Promise<Metadata> {
  const appName = await getAppName();
  return {
    title: `Spot prices | Visualise | ${appName}`,
    description: `WTI and spot price time series from ${BRAND.name} fact_prices.`,
  };
}

export default async function VisualiseSpotPricesPage() {
  const chart = await getSpotPriceChartData(450);

  const th =
    'text-left text-[10px] font-black uppercase tracking-[0.2em] text-oilplot-ink/60 pb-3 border-b border-oilplot-ink/15';
  const td = 'py-2 text-sm border-b border-oilplot-ink/10 font-mono text-xs';

  const tail = chart.points.slice(-12);

  return (
    <>
      <h1 className="font-display text-3xl sm:text-4xl tracking-tighter text-oilplot-ink">Spot prices</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-oilplot-ink/70">
        {chart.subtitle}
      </p>
      <aside className="mt-6 rounded-sm border-4 border-oilplot-ink/15 bg-oilplot-cream/30 px-4 py-3 text-sm text-oilplot-ink/85">
        Filters, CSV export, and full history live in the{' '}
        <Link href="/repository" className="font-medium text-oilplot-coral underline-offset-2 hover:underline">
          data catalog
        </Link>
        .
      </aside>

      <section className="mt-10 rounded-sm border-4 border-oilplot-ink bg-white p-4 sm:p-6">
        <h2 className="font-display text-lg tracking-tight text-oilplot-ink">{chart.title}</h2>
        <p className="mt-1 text-xs text-oilplot-ink/55">USD/bbl · newest observations on the right</p>
        <div className="mt-6">
          <SimpleSvgLineChart
            points={chart.points}
            ariaLabel={`${chart.title}: ${chart.points.length} points from ${chart.points[0]?.date ?? ''} to ${chart.points[chart.points.length - 1]?.date ?? ''}`}
          />
        </div>
      </section>

      {tail.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl tracking-tight text-oilplot-ink">Latest dates (sample)</h2>
          <p className="mt-2 text-xs text-oilplot-ink/60">Last 12 rows in the chart window.</p>
          <div className="mt-4 overflow-x-auto rounded-sm border-4 border-oilplot-ink bg-white">
            <table className="w-full min-w-[320px] border-collapse">
              <thead>
                <tr>
                  <th className={`${th} pl-4`}>Date</th>
                  <th className={th}>USD/bbl</th>
                </tr>
              </thead>
              <tbody>
                {tail.map((p) => (
                  <tr key={p.date}>
                    <td className={`${td} pl-4`}>{p.date}</td>
                    <td className={td}>{p.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

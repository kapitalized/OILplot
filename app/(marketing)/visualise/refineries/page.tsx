import Link from 'next/link';
import type { Metadata } from 'next';
import { SimpleSvgBarChart } from '@/components/marketing/charts/SimpleSvgBarChart';
import { getAppName } from '@/lib/app-name';
import { BRAND } from '@/lib/brand';
import { getRefineryRegionRows } from '@/lib/oil/visualise-data';

export async function generateMetadata(): Promise<Metadata> {
  const appName = await getAppName();
  return {
    title: `Refinery capacity | Visualise | ${appName}`,
    description: `EIA regional refinery distillation capacity from ${BRAND.name} dim_refineries.`,
  };
}

function shortLabel(fullName: string, duoarea: string | null): string {
  const head = fullName.split('—')[0]?.trim();
  if (head && head.length <= 36) return head;
  if (duoarea) return duoarea;
  return fullName.slice(0, 36);
}

export default async function VisualiseRefineriesPage() {
  const rows = await getRefineryRegionRows();
  const chartData = rows
    .filter((r) => r.capacity_kbd != null && r.capacity_kbd > 0)
    .slice(0, 24)
    .map((r) => ({
      label: shortLabel(r.name, r.eia_duoarea),
      value: r.capacity_kbd!,
    }));

  const th =
    'text-left text-[10px] font-black uppercase tracking-[0.2em] text-oilplot-ink/60 pb-3 border-b border-oilplot-ink/15';
  const td = 'py-3 text-sm border-b border-oilplot-ink/10 align-top';

  return (
    <>
      <h1 className="font-display text-3xl sm:text-4xl tracking-tighter text-oilplot-ink">Refinery capacity</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-oilplot-ink/70">
        Regional operable <strong className="text-oilplot-ink">atmospheric crude distillation</strong> capacity from
        EIA Open Data (<code className="font-mono text-xs">petroleum/pnp/cap1</code>, process 8D0, B/CD), aggregated by
        state / PADD / U.S. — not individual plants. Rows are upserted into{' '}
        <code className="font-mono text-xs">dim_refineries</code> when you run the{' '}
        <strong className="text-oilplot-ink">eia-refinery-capacity</strong> API source.
      </p>
      <aside className="mt-6 rounded-sm border-4 border-oilplot-ink/15 bg-oilplot-cream/30 px-4 py-3 text-sm text-oilplot-ink/85">
        Load or refresh data:{' '}
        <Link href="/admin/external-apis" className="font-medium text-oilplot-coral underline-offset-2 hover:underline">
          Admin → External APIs
        </Link>{' '}
        → run <strong className="text-oilplot-ink">EIA regional refinery capacity (cap1)</strong>.
      </aside>

      <section className="mt-10 rounded-sm border-4 border-oilplot-ink bg-white p-4 sm:p-6">
        <h2 className="font-display text-lg tracking-tight text-oilplot-ink">Capacity by region (top 24, kbd)</h2>
        <p className="mt-1 text-xs text-oilplot-ink/55">
          Thousands of barrels per calendar day · excludes zero-capacity rows from the chart
        </p>
        <div className="mt-6">
          <SimpleSvgBarChart
            data={chartData}
            valueSuffix=" kbd"
            ariaLabel="Horizontal bars of refinery distillation capacity by EIA region"
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl tracking-tight text-oilplot-ink">All ingested regions</h2>
        <p className="mt-2 text-xs text-oilplot-ink/60">
          {rows.length} row{rows.length === 1 ? '' : 's'} with <code className="font-mono">eia_series_id</code> set.
        </p>
        <div className="mt-4 overflow-x-auto rounded-sm border-4 border-oilplot-ink bg-white">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                <th className={`${th} pl-4`}>Region label</th>
                <th className={th}>duoarea</th>
                <th className={th}>kbd</th>
                <th className={th}>Year</th>
                <th className={th}>EIA series</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ref_id}>
                  <td className={`${td} pl-4 max-w-[280px]`}>{r.name}</td>
                  <td className={`${td} font-mono text-xs`}>{r.eia_duoarea ?? '—'}</td>
                  <td className={`${td} font-mono text-xs`}>{r.capacity_kbd ?? '—'}</td>
                  <td className={`${td} font-mono text-xs`}>{r.eia_report_year ?? '—'}</td>
                  <td className={`${td} font-mono text-[10px] text-oilplot-ink/70`}>{r.eia_series_id ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

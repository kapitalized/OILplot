import Link from 'next/link';
import type { Metadata } from 'next';
import { getAppName } from '@/lib/app-name';
import { BRAND } from '@/lib/brand';
import { getRefiningOpsPreview } from '@/lib/oil/visualise-data';

export async function generateMetadata(): Promise<Metadata> {
  const appName = await getAppName();
  return {
    title: `Refinery inputs & outputs | Visualise | ${appName}`,
    description: `EIA regional refinery gross input, net crude, and net production from ${BRAND.name} fact_eia_refining_ops.`,
  };
}

export default async function VisualiseRefiningOpsPage() {
  const rows = await getRefiningOpsPreview(200);

  const th =
    'text-left text-[10px] font-black uppercase tracking-[0.2em] text-oilplot-ink/60 pb-3 border-b border-oilplot-ink/15';
  const td = 'py-2.5 text-xs border-b border-oilplot-ink/10 align-top';

  return (
    <>
      <h1 className="font-display text-3xl sm:text-4xl tracking-tighter text-oilplot-ink">
        Refinery inputs &amp; outputs
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-oilplot-ink/70">
        <strong className="text-oilplot-ink">Regional</strong> series from EIA Open Data — weekly{' '}
        <code className="font-mono text-[11px]">wiup</code> (gross inputs, crude net input) and monthly{' '}
        <code className="font-mono text-[11px]">refp2</code> (e.g. finished motor gasoline, distillate, jet). Plant-level
        Form EIA-810 detail is not in this public API; optional{' '}
        <code className="font-mono text-[11px]">inpt2</code> monthly net crude adds refining-district granularity when
        enabled on the source.
      </p>
      <aside className="mt-6 rounded-sm border-4 border-oilplot-ink/15 bg-oilplot-cream/30 px-4 py-3 text-sm text-oilplot-ink/85">
        Ingest with adapter <code className="font-mono text-xs">eia-refining-ops</code> →{' '}
        <code className="font-mono text-xs">fact_eia_refining_ops</code>.{' '}
        <Link href="/admin/external-apis" className="font-medium text-oilplot-coral underline-offset-2 hover:underline">
          Admin → External APIs
        </Link>
      </aside>

      <section className="mt-10">
        <h2 className="font-display text-xl tracking-tight text-oilplot-ink">Latest observations</h2>
        <p className="mt-2 text-xs text-oilplot-ink/60">
          Showing up to {rows.length} rows, sorted by period (newest first). Units vary (MBBL/D, MBBL, etc.) — see EIA
          series text.
        </p>
        <div className="mt-4 overflow-x-auto rounded-sm border-4 border-oilplot-ink bg-white">
          <table className="w-full min-w-[960px] border-collapse">
            <thead>
              <tr>
                <th className={`${th} pl-4`}>Period</th>
                <th className={th}>Route</th>
                <th className={th}>Area</th>
                <th className={th}>Product</th>
                <th className={th}>Process</th>
                <th className={th}>Value</th>
                <th className={th}>Series</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`${td} pl-4 text-oilplot-ink/55`}>
                    No rows yet — run the &quot;EIA refinery inputs &amp; outputs&quot; source (or migrate{' '}
                    <code className="font-mono">fact_eia_refining_ops</code> first).
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={`${r.id}-${r.period}`}>
                    <td className={`${td} pl-4 whitespace-nowrap font-mono`}>{r.period}</td>
                    <td className={`${td} font-mono text-[11px]`}>{r.route_id}</td>
                    <td className={td}>
                      <span className="font-mono text-[11px]">{r.duoarea ?? '—'}</span>
                      {r.area_name && r.area_name !== 'NA' ? (
                        <span className="block text-[10px] text-oilplot-ink/55">{r.area_name}</span>
                      ) : null}
                    </td>
                    <td className={td}>{r.product_name ?? '—'}</td>
                    <td className={`${td} max-w-[140px]`}>{r.process_name ?? '—'}</td>
                    <td className={`${td} whitespace-nowrap font-mono text-[11px]`}>
                      {r.value ?? '—'} {r.units ? <span className="text-oilplot-ink/60">{r.units}</span> : null}
                    </td>
                    <td className={`${td} max-w-md text-[10px] text-oilplot-ink/65`}>
                      {r.series_description ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

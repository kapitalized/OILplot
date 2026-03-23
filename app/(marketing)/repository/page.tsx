import Link from 'next/link';
import { getAppName } from '@/lib/app-name';
import { getPageMetadata } from '@/lib/seo';
import { getPublicRepositoryData } from '@/lib/oil/public-repository-data';

export async function generateMetadata() {
  return getPageMetadata('repository');
}

export default async function RepositoryDataPage() {
  const appName = await getAppName();
  const { counts, prices, scraper_logs: logs } = await getPublicRepositoryData();

  const th =
    'text-left text-[10px] font-black uppercase tracking-[0.2em] text-oilplot-ink/60 pb-3 border-b border-oilplot-ink/15';
  const td = 'py-3 text-sm border-b border-oilplot-ink/10';

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl sm:text-4xl tracking-tighter text-oilplot-ink">
        Collected oil data
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-oilplot-ink/70">
        Latest rows stored in the {appName} repository (Neon). Ingestion runs are logged; spot prices come from
        configured adapters such as Yahoo Finance and optionally the U.S. Energy Information Administration
        (EIA).
      </p>

      <section className="mt-10 rounded-sm border-4 border-oilplot-ink bg-oilplot-cream/40 p-6 sm:p-8">
        <h2 className="font-display text-xl tracking-tight text-oilplot-ink">Table row counts</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.25em] text-oilplot-ink/50">
              fact_prices
            </dt>
            <dd className="mt-1 font-mono text-2xl text-oilplot-ink">{counts.fact_prices}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.25em] text-oilplot-ink/50">
              fact_shipments
            </dt>
            <dd className="mt-1 font-mono text-2xl text-oilplot-ink">{counts.fact_shipments}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.25em] text-oilplot-ink/50">
              fact_production
            </dt>
            <dd className="mt-1 font-mono text-2xl text-oilplot-ink">{counts.fact_production}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl tracking-tight text-oilplot-ink">Recent spot prices</h2>
        <p className="mt-2 text-xs text-oilplot-ink/60">Up to 100 most recent rows by date.</p>
        <div className="mt-4 overflow-x-auto rounded-sm border-4 border-oilplot-ink bg-white">
          <table className="w-full min-w-[640px] border-collapse px-4">
            <thead>
              <tr>
                <th className={`${th} pl-4`}>Date</th>
                <th className={th}>Source</th>
                <th className={th}>Market</th>
                <th className={th}>Oil type</th>
                <th className={`${th} pr-4 text-right`}>USD/bbl</th>
              </tr>
            </thead>
            <tbody>
              {prices.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${td} pl-4 pr-4 text-oilplot-ink/50`}>
                    No price rows yet. Run ingestion from the admin external APIs screen or cron.
                  </td>
                </tr>
              ) : (
                prices.map((p) => (
                  <tr key={p.price_id}>
                    <td className={`${td} pl-4 font-mono text-xs`}>{p.price_date}</td>
                    <td className={td}>{p.source ?? '—'}</td>
                    <td className={td}>{p.market_location ?? '—'}</td>
                    <td className={td}>
                      {p.oil_type_name ?? p.oil_type_code ?? '—'}
                      {p.oil_type_code && p.oil_type_name ? (
                        <span className="ml-1 text-xs text-oilplot-ink/45">({p.oil_type_code})</span>
                      ) : null}
                    </td>
                    <td className={`${td} pr-4 text-right font-mono`}>
                      {p.price_usd_per_bbl ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl tracking-tight text-oilplot-ink">Ingestion runs</h2>
        <p className="mt-2 text-xs text-oilplot-ink/60">Latest 20 entries from src_scraper_logs.</p>
        <div className="mt-4 overflow-x-auto rounded-sm border-4 border-oilplot-ink bg-white">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                <th className={`${th} pl-4`}>Run time (UTC)</th>
                <th className={th}>Source</th>
                <th className={th}>Status</th>
                <th className={th}>Rows</th>
                <th className={`${th} pr-4`}>Note</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${td} pl-4 pr-4 text-oilplot-ink/50`}>
                    No ingestion logs yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id}>
                    <td className={`${td} pl-4 font-mono text-xs whitespace-nowrap`}>
                      {log.run_time ?? '—'}
                    </td>
                    <td className={`${td} text-xs`}>{log.scraper_name}</td>
                    <td className={td}>
                      <span
                        className={
                          log.status === 'success'
                            ? 'text-emerald-800'
                            : log.status === 'error'
                              ? 'text-red-800'
                              : ''
                        }
                      >
                        {log.status ?? '—'}
                      </span>
                    </td>
                    <td className={`${td} font-mono text-xs`}>{log.rows_inserted ?? '—'}</td>
                    <td className={`${td} pr-4 max-w-xs truncate text-xs text-oilplot-ink/70`}>
                      {log.error_message ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14 border-t-4 border-oilplot-ink/20 pt-10">
        <h2 className="font-display text-lg tracking-tight text-oilplot-ink">Add another API source</h2>
        <ul className="mt-4 list-decimal pl-5 space-y-2 text-sm text-oilplot-ink/80">
          <li>
            <strong className="text-oilplot-ink">EIA (U.S. government spot series)</strong> — Register at{' '}
            <a
              href="https://www.eia.gov/opendata/"
              className="font-medium text-oilplot-coral underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              EIA Open Data
            </a>
            , copy your API key into <code className="rounded bg-oilplot-ink/10 px-1 font-mono text-xs">EIA_API_KEY</code>{' '}
            in env, then enable the <code className="rounded bg-oilplot-ink/10 px-1 font-mono text-xs">eia-petroleum</code>{' '}
            source in Payload.
          </li>
          <li>
            <strong className="text-oilplot-ink">Yahoo Finance (adapter: yahoo-prices)</strong> — No signup; symbols
            like <code className="rounded bg-oilplot-ink/10 px-1 font-mono text-xs">CL=F</code> are configured in Payload
            API sources.
          </li>
        </ul>
        <p className="mt-6 text-sm text-oilplot-ink/70">
          See <Link href="/setup" className="font-medium text-oilplot-coral hover:underline">Setup</Link> and the repo
          doc <code className="text-xs">docs/OIL_DATA_INGESTION_ACTION_PLAN.md</code> for cron and adapters.
        </p>
      </section>
    </div>
  );
}

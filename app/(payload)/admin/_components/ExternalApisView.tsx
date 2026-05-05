'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface ApiSource {
  id: string;
  name: string;
  adapter: string;
  enabled: boolean;
  cronJobId: string | null;
  lastRunAt: string | null;
  updatedAt: string | null;
  /** One-line summary from server (length, lookbackDays, etc.) */
  configSummary?: string;
  /** Full Payload `config` JSON (edit in Payload — use Edit link) */
  config?: unknown;
}

interface ApiRun {
  id: string;
  sourceId: string | null;
  sourceName: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  status: string | null;
  recordsFetched: number | null;
  errorMessage: string | null;
}

interface IngestionStatus {
  counts: {
    fact_prices: number;
    fact_shipments: number;
    fact_production: number;
    fact_eia_refining_ops: number;
  };
  scraper_logs: Array<{
    log_id: number;
    scraper_name: string | null;
    run_time: string | null;
    rows_inserted: number | null;
    status: string | null;
    error_message: string | null;
  }>;
}

function formatDate(s: string | null): string {
  if (!s) return '—';
  try {
    const d = new Date(s);
    return d.toLocaleString();
  } catch {
    return s;
  }
}

/** Readable on Payload dark shell: cream surface + ink text */
const apiTableWrap =
  'overflow-x-auto rounded border border-oilplot-ink/20 bg-oilplot-cream text-oilplot-ink';
const apiTableHead = 'border-b border-oilplot-ink/15 bg-oilplot-cream';
const apiTh = 'p-2 text-left font-medium text-oilplot-ink';
const apiTd = 'p-2 text-oilplot-ink';
const apiTdMuted = 'p-2 text-oilplot-ink/70';

async function fetchJson<T>(url: string, label: string): Promise<T> {
  const r = await fetch(url, { credentials: 'include' });
  if (r.ok) return r.json() as Promise<T>;
  let detail = r.statusText;
  try {
    const j = (await r.json()) as { error?: string; message?: string; detail?: string };
    detail = j.error ?? j.message ?? j.detail ?? JSON.stringify(j);
  } catch {
    try {
      detail = await r.text();
    } catch {
      /* keep statusText */
    }
  }
  throw new Error(`${label} (${r.status}): ${detail}`);
}

export function ExternalApisView() {
  const [sources, setSources] = useState<ApiSource[]>([]);
  const [runs, setRuns] = useState<ApiRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [healthResult, setHealthResult] = useState<Record<string, { ok: boolean; message: string }>>({});
  const [ingestion, setIngestion] = useState<IngestionStatus | null>(null);
  const [ingestionError, setIngestionError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setIngestionError(null);
    Promise.all([
      fetchJson<{ sources: ApiSource[] }>('/api/admin/external-apis/sources', 'Failed to load sources'),
      fetchJson<{ runs: ApiRun[] }>('/api/admin/external-apis/runs?limit=30', 'Failed to load runs'),
    ])
      .then(([sRes, rRes]) => {
        setSources((sRes as { sources: ApiSource[] }).sources);
        setRuns((rRes as { runs: ApiRun[] }).runs);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    void fetch('/api/admin/ingestion-status', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((iRes) => setIngestion(iRes as IngestionStatus))
      .catch(() => {
        setIngestion(null);
        setIngestionError('Neon oil tables unavailable (run migrations / check DATABASE_URL).');
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runNow = async (sourceId: string) => {
    setRunningId(sourceId);
    try {
      const res = await fetch(`/api/admin/external-apis/sources/${sourceId}/run`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error((data as { error?: string }).error || 'Run failed');
      }
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Run failed');
    } finally {
      setRunningId(null);
    }
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const cronUrl = (sourceId: string) =>
    `${baseUrl}/api/cron/sync-external?sourceId=${encodeURIComponent(sourceId)}`;

  const copyCronUrl = (sourceId: string) => {
    const url = cronUrl(sourceId);
    void navigator.clipboard.writeText(url);
    setCopiedId(sourceId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const testHealth = async (sourceId: string) => {
    setTestingId(sourceId);
    setHealthResult((prev) => ({ ...prev, [sourceId]: { ok: false, message: '…' } }));
    try {
      const res = await fetch(`/api/admin/external-apis/sources/${sourceId}/health`, { credentials: 'include' });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      setHealthResult((prev) => ({
        ...prev,
        [sourceId]: { ok: Boolean(data.ok), message: data.message ?? (res.ok ? 'OK' : 'Failed') },
      }));
    } catch {
      setHealthResult((prev) => ({ ...prev, [sourceId]: { ok: false, message: 'Network error' } }));
    } finally {
      setTestingId(null);
    }
  };

  if (error) return <div className="text-red-600">{error}</div>;
  if (loading) return <p>Loading…</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">External API sources</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/collections/api-sources/create"
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add new
          </Link>
          <Link
            href="https://console.cron-job.org/jobs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Open cron-job.org →
          </Link>
          <Link
            href="/admin/collections/api-sources"
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Edit sources
          </Link>
        </div>
      </div>
      <div className="rounded-md border border-oilplot-ink/20 bg-oilplot-cream/90 px-4 py-3 text-sm text-oilplot-ink">
        <p className="font-medium text-oilplot-ink">Run settings (adapter + JSON config)</p>
        <p className="mt-1 text-oilplot-ink/85">
          Each row below is a Payload <strong>API source</strong> document. Use{' '}
          <strong>Edit</strong> to change <code className="rounded bg-white/80 px-1 font-mono text-xs">length</code>,{' '}
          <code className="rounded bg-white/80 px-1 font-mono text-xs">lookbackDays</code>, symbols, etc. Saving in
          Payload updates what the next run uses. Secrets stay in env (<code className="font-mono text-xs">EIA_API_KEY</code>
          ), not in this JSON.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Configure sources in the collection above. Use &quot;Run now&quot; or schedule via{' '}
        <a href="https://console.cron-job.org/jobs" target="_blank" rel="noopener noreferrer" className="underline">
          cron-job.org
        </a>
        : call the Cron URL with <code className="rounded bg-muted px-1">Authorization: Bearer CRON_SECRET</code> or{' '}
        <code className="rounded bg-muted px-1">X-Cron-Secret: CRON_SECRET</code>.
      </p>
      <p className="text-sm text-muted-foreground">
        <strong className="text-foreground">More history:</strong> edit the source in Payload and raise{' '}
        <code className="rounded bg-muted px-1">lookbackDays</code> (Yahoo) or <code className="rounded bg-muted px-1">length</code>{' '}
        (EIA, daily rows returned), then <strong>Run now</strong> again. If ingestion failed with{' '}
        <code className="rounded bg-muted px-1">fact_prices_oil_type_id_key</code>, run{' '}
        <code className="rounded bg-muted px-1">npm run migrate:fact-prices-time-series</code> once, then re-run.
      </p>

      <section className="rounded border border-gray-200 bg-muted/30 p-4">
        <h2 className="mb-2 text-lg font-semibold">Oil repository (Neon)</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Row counts and latest scraper logs from <code className="rounded bg-muted px-1">src_scraper_logs</code>.           Seed default API sources (Yahoo + EIA):{' '}
          <code className="rounded bg-muted px-1">POST /api/seed-oil-api-sources?key=INTERNAL_SERVICE_KEY</code> (see{' '}
          <code className="rounded bg-muted px-1">docs/OIL_DATA_INGESTION_ACTION_PLAN.md</code>).
        </p>
        {ingestionError && <p className="mb-2 text-sm text-amber-800">{ingestionError}</p>}
        {!ingestion && !ingestionError && <p className="mb-2 text-sm text-muted-foreground">Loading DB metrics…</p>}
        {ingestion && (
          <>
            <div className="mb-4 flex flex-wrap gap-4 text-sm">
              <span>
                <strong>fact_prices:</strong> {ingestion.counts.fact_prices}
              </span>
              <span>
                <strong>fact_shipments:</strong> {ingestion.counts.fact_shipments}
              </span>
              <span>
                <strong>fact_production:</strong> {ingestion.counts.fact_production}
              </span>
              <span>
                <strong>fact_eia_refining_ops:</strong> {ingestion.counts.fact_eia_refining_ops}
              </span>
            </div>
            <div className={apiTableWrap}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={apiTableHead}>
                    <th className={apiTh}>Scraper</th>
                    <th className={apiTh}>Run time</th>
                    <th className={apiTh}>Status</th>
                    <th className={apiTh}>Rows</th>
                    <th className={apiTh}>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {ingestion.scraper_logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={`${apiTdMuted} p-3`}>
                        No scraper logs yet. Run a source or cron job.
                      </td>
                    </tr>
                  ) : (
                    ingestion.scraper_logs.map((log) => (
                      <tr key={log.log_id} className="border-b border-oilplot-ink/10 last:border-0">
                        <td className={`${apiTd} font-mono text-xs`}>{log.scraper_name ?? '—'}</td>
                        <td className={`${apiTdMuted}`}>{formatDate(log.run_time)}</td>
                        <td className={apiTd}>
                          <span
                            className={
                              log.status === 'success'
                                ? 'text-green-700'
                                : log.status === 'error'
                                  ? 'text-red-700'
                                  : ''
                            }
                          >
                            {log.status ?? '—'}
                          </span>
                        </td>
                        <td className={apiTd}>{log.rows_inserted ?? '—'}</td>
                        <td className={`max-w-[240px] truncate ${apiTdMuted}`} title={log.error_message ?? ''}>
                          {log.error_message ?? '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Sources</h2>
        <div className={apiTableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={apiTableHead}>
                <th className={apiTh}>Name</th>
                <th className={apiTh}>Adapter</th>
                <th className={apiTh}>Run settings</th>
                <th className={apiTh}>Enabled</th>
                <th className={apiTh}>Health</th>
                <th className={apiTh}>Last run</th>
                <th className={apiTh}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`${apiTdMuted} p-4 text-center`}>
                    No API sources.{' '}
                    <Link href="/admin/collections/api-sources/create" className="font-medium text-blue-700 underline">
                      Add new
                    </Link>{' '}
                    to pull data from an external API.
                  </td>
                </tr>
              ) : (
                sources.map((s) => (
                  <tr key={s.id} className="border-b border-oilplot-ink/10 last:border-0">
                    <td className={`${apiTd} font-medium`}>{s.name}</td>
                    <td className={`${apiTd} font-mono text-xs`}>{s.adapter}</td>
                    <td className={`${apiTd} max-w-[280px]`}>
                      <p
                        className="font-mono text-[11px] leading-snug text-oilplot-ink/90"
                        title={(() => {
                          try {
                            return JSON.stringify(s.config ?? {}, null, 2);
                          } catch {
                            return '';
                          }
                        })()}
                      >
                        {s.configSummary ?? '—'}
                      </p>
                      <Link
                        href={`/admin/collections/api-sources/${s.id}`}
                        className="mt-1 inline-block font-medium text-blue-700 underline text-xs"
                      >
                        Edit in Payload →
                      </Link>
                    </td>
                    <td className={apiTd}>{s.enabled ? 'Yes' : 'No'}</td>
                    <td className={apiTd}>
                      <button
                        type="button"
                        disabled={testingId !== null}
                        onClick={() => testHealth(s.id)}
                        className="rounded border border-oilplot-ink/25 bg-white px-2 py-1 text-xs text-oilplot-ink hover:bg-oilplot-cream disabled:opacity-50"
                        title="Test connection and response"
                      >
                        {testingId === s.id ? 'Testing…' : 'Test'}
                      </button>
                      {healthResult[s.id] && (
                        <span
                          className={healthResult[s.id].ok ? 'ml-1 text-green-700' : 'ml-1 text-red-700'}
                          title={healthResult[s.id].message}
                        >
                          {healthResult[s.id].ok ? '✓' : '✗'}
                        </span>
                      )}
                    </td>
                    <td className={apiTdMuted}>{formatDate(s.lastRunAt)}</td>
                    <td className={apiTd}>
                      <div className="flex flex-wrap gap-1">
                        <Link
                          href={`/admin/collections/api-sources/${s.id}`}
                          className="rounded border border-oilplot-ink/40 bg-white px-2 py-1 text-xs text-oilplot-ink hover:bg-oilplot-cream"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={!s.enabled || runningId !== null}
                          onClick={() => runNow(s.id)}
                          className="rounded border border-oilplot-ink/25 bg-white px-2 py-1 text-xs text-oilplot-ink hover:bg-oilplot-cream disabled:opacity-50"
                        >
                          {runningId === s.id ? 'Running…' : 'Run now'}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyCronUrl(s.id)}
                          className="rounded border border-oilplot-ink/25 bg-white px-2 py-1 text-xs text-oilplot-ink hover:bg-oilplot-cream"
                          title="Copy cron URL"
                        >
                          {copiedId === s.id ? 'Copied' : 'Cron URL'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Recent runs</h2>
        <div className={apiTableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={apiTableHead}>
                <th className={apiTh}>Source</th>
                <th className={apiTh}>Started</th>
                <th className={apiTh}>Status</th>
                <th className={apiTh}>Records</th>
                <th className={apiTh}>Error</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${apiTdMuted} p-4 text-center`}>
                    No runs yet.
                  </td>
                </tr>
              ) : (
                runs.map((r) => (
                  <tr key={r.id} className="border-b border-oilplot-ink/10 last:border-0">
                    <td className={apiTd}>{r.sourceName ?? r.sourceId ?? '—'}</td>
                    <td className={apiTdMuted}>{formatDate(r.startedAt)}</td>
                    <td className={apiTd}>
                      <span
                        className={
                          r.status === 'success'
                            ? 'text-green-700'
                            : r.status === 'error'
                              ? 'text-red-700'
                              : 'text-amber-700'
                        }
                      >
                        {r.status ?? '—'}
                      </span>
                    </td>
                    <td className={apiTd}>{r.recordsFetched != null ? r.recordsFetched : '—'}</td>
                    <td className={`max-w-[200px] truncate ${apiTdMuted}`} title={r.errorMessage ?? ''}>
                      {r.errorMessage ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

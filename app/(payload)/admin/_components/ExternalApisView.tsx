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
  counts: { fact_prices: number; fact_shipments: number; fact_production: number };
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
      fetch('/api/admin/external-apis/sources', { credentials: 'include' }).then((r) =>
        r.ok ? r.json() : Promise.reject(new Error('Failed to load sources'))
      ),
      fetch('/api/admin/external-apis/runs?limit=30', { credentials: 'include' }).then((r) =>
        r.ok ? r.json() : Promise.reject(new Error('Failed to load runs'))
      ),
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
      <p className="text-sm text-muted-foreground">
        Configure sources in the collection above. Use &quot;Run now&quot; or schedule via{' '}
        <a href="https://console.cron-job.org/jobs" target="_blank" rel="noopener noreferrer" className="underline">
          cron-job.org
        </a>
        : call the Cron URL with <code className="rounded bg-muted px-1">Authorization: Bearer CRON_SECRET</code> or{' '}
        <code className="rounded bg-muted px-1">X-Cron-Secret: CRON_SECRET</code>.
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
            </div>
            <div className="overflow-x-auto rounded border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium">Scraper</th>
                    <th className="p-2 text-left font-medium">Run time</th>
                    <th className="p-2 text-left font-medium">Status</th>
                    <th className="p-2 text-left font-medium">Rows</th>
                    <th className="p-2 text-left font-medium">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {ingestion.scraper_logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-3 text-muted-foreground">
                        No scraper logs yet. Run a source or cron job.
                      </td>
                    </tr>
                  ) : (
                    ingestion.scraper_logs.map((log) => (
                      <tr key={log.log_id} className="border-b last:border-0">
                        <td className="p-2 font-mono text-xs">{log.scraper_name ?? '—'}</td>
                        <td className="p-2 text-muted-foreground">{formatDate(log.run_time)}</td>
                        <td className="p-2">
                          <span
                            className={
                              log.status === 'success'
                                ? 'text-green-600'
                                : log.status === 'error'
                                  ? 'text-red-600'
                                  : ''
                            }
                          >
                            {log.status ?? '—'}
                          </span>
                        </td>
                        <td className="p-2">{log.rows_inserted ?? '—'}</td>
                        <td className="max-w-[240px] truncate p-2 text-muted-foreground" title={log.error_message ?? ''}>
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
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium">Name</th>
                <th className="p-2 text-left font-medium">Adapter</th>
                <th className="p-2 text-left font-medium">Enabled</th>
                <th className="p-2 text-left font-medium">Health</th>
                <th className="p-2 text-left font-medium">Last run</th>
                <th className="p-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    No API sources. <Link href="/admin/collections/api-sources/create" className="font-medium text-blue-600 underline">Add new</Link> to pull data from an external API.
                  </td>
                </tr>
              ) : (
                sources.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="p-2 font-medium">{s.name}</td>
                    <td className="p-2 font-mono text-xs">{s.adapter}</td>
                    <td className="p-2">{s.enabled ? 'Yes' : 'No'}</td>
                    <td className="p-2">
                      <button
                        type="button"
                        disabled={testingId !== null}
                        onClick={() => testHealth(s.id)}
                        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
                        title="Test connection and response"
                      >
                        {testingId === s.id ? 'Testing…' : 'Test'}
                      </button>
                      {healthResult[s.id] && (
                        <span className={healthResult[s.id].ok ? 'ml-1 text-green-600' : 'ml-1 text-red-600'} title={healthResult[s.id].message}>
                          {healthResult[s.id].ok ? '✓' : '✗'}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-muted-foreground">{formatDate(s.lastRunAt)}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          disabled={!s.enabled || runningId !== null}
                          onClick={() => runNow(s.id)}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
                        >
                          {runningId === s.id ? 'Running…' : 'Run now'}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyCronUrl(s.id)}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50"
                          title="Copy cron URL"
                        >
                          {copiedId === s.id ? 'Copied' : 'Copy cron URL'}
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
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium">Source</th>
                <th className="p-2 text-left font-medium">Started</th>
                <th className="p-2 text-left font-medium">Status</th>
                <th className="p-2 text-left font-medium">Records</th>
                <th className="p-2 text-left font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No runs yet.
                  </td>
                </tr>
              ) : (
                runs.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="p-2">{r.sourceName ?? r.sourceId ?? '—'}</td>
                    <td className="p-2 text-muted-foreground">{formatDate(r.startedAt)}</td>
                    <td className="p-2">
                      <span
                        className={
                          r.status === 'success'
                            ? 'text-green-600'
                            : r.status === 'error'
                              ? 'text-red-600'
                              : 'text-amber-600'
                        }
                      >
                        {r.status ?? '—'}
                      </span>
                    </td>
                    <td className="p-2">{r.recordsFetched != null ? r.recordsFetched : '—'}</td>
                    <td className="max-w-[200px] truncate p-2 text-muted-foreground" title={r.errorMessage ?? ''}>
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

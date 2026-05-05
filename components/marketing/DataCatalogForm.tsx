import Link from 'next/link';
import {
  SOURCE_PARAM_NONE,
  type CatalogFacets,
  type CatalogFilters,
} from '@/lib/oil/public-repository-data';

type Props = {
  facets: CatalogFacets;
  applied: CatalogFilters;
  effectiveLimit: number;
  exportSearchParams: string;
};

export function DataCatalogForm({ facets, applied, effectiveLimit, exportSearchParams }: Props) {
  const exportHref =
    exportSearchParams.length > 0
      ? `/api/public/oil-prices/export?${exportSearchParams}`
      : '/api/public/oil-prices/export';

  return (
    <form
      method="get"
      action="/repository"
      className="rounded-sm border-4 border-oilplot-ink bg-oilplot-cream/50 p-4 sm:p-6 space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-[0.15em] text-oilplot-ink/60">
          Data source
          <select
            name="source"
            defaultValue={applied.source ?? ''}
            className="rounded border-2 border-oilplot-ink/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-oilplot-ink"
          >
            <option value="">All sources</option>
            {facets.sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            {facets.hasUnknownSource ? (
              <option value={SOURCE_PARAM_NONE}>Unknown / not set</option>
            ) : null}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-[0.15em] text-oilplot-ink/60">
          Oil type
          <select
            name="oil"
            defaultValue={applied.oilTypeCode ?? ''}
            className="rounded border-2 border-oilplot-ink/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-oilplot-ink"
          >
            <option value="">All types</option>
            {facets.oilTypes.map((o) => (
              <option key={o.code} value={o.code}>
                {o.name} ({o.code})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-[0.15em] text-oilplot-ink/60">
          Market label
          <select
            name="market"
            defaultValue={applied.market ?? ''}
            className="rounded border-2 border-oilplot-ink/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-oilplot-ink"
          >
            <option value="">All markets</option>
            {facets.markets.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-[0.15em] text-oilplot-ink/60">
          From date
          <input
            type="date"
            name="from"
            defaultValue={applied.from ?? ''}
            className="rounded border-2 border-oilplot-ink/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-oilplot-ink"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-[0.15em] text-oilplot-ink/60">
          To date
          <input
            type="date"
            name="to"
            defaultValue={applied.to ?? ''}
            className="rounded border-2 border-oilplot-ink/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-oilplot-ink"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-[0.15em] text-oilplot-ink/60">
          Rows (max 1000)
          <input
            type="number"
            name="limit"
            min={1}
            max={1000}
            defaultValue={effectiveLimit}
            className="rounded border-2 border-oilplot-ink/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-oilplot-ink"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded border-4 border-oilplot-ink bg-oilplot-yellow px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-oilplot-ink hover:opacity-90"
        >
          Apply filters
        </button>
        <Link
          href="/repository"
          className="text-sm font-medium text-oilplot-coral underline-offset-2 hover:underline"
        >
          Clear
        </Link>
        <a
          href={exportHref}
          className="text-sm font-medium text-oilplot-ink/80 underline-offset-2 hover:underline"
        >
          Download CSV (same filters, up to 5000 rows)
        </a>
      </div>
    </form>
  );
}

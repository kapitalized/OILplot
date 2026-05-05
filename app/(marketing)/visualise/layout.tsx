import Link from 'next/link';

const link =
  'text-xs font-bold uppercase tracking-[0.18em] text-oilplot-ink/55 hover:text-oilplot-coral transition-colors';

export default function VisualiseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl">
      <nav
        className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-b-4 border-oilplot-ink/15 pb-6"
        aria-label="Visualisations"
      >
        <Link href="/visualise" className={link}>
          Overview
        </Link>
        <Link href="/visualise/spot-prices" className={link}>
          Spot prices
        </Link>
        <Link href="/visualise/refineries" className={link}>
          Refineries
        </Link>
        <Link href="/visualise/refining-ops" className={link}>
          Refining I/O
        </Link>
      </nav>
      {children}
    </div>
  );
}

import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { getAppName } from '@/lib/app-name';

function ChartLineDemo() {
  return (
    <svg viewBox="0 0 320 140" width="100%" height="140" role="img" aria-label="Demo line chart">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={BRAND.colors.primary} stopOpacity="0.9" />
          <stop offset="1" stopColor={BRAND.colors.primary} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="320" height="140" rx="14" fill="rgba(148,163,184,0.12)" />
      {[20, 50, 80, 110].map((y) => (
        <line key={y} x1="18" y1={y} x2="302" y2={y} stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
      ))}
      <path
        d="M 18 105 L 62 92 L 98 75 L 142 82 L 186 55 L 230 60 L 266 32 L 302 40"
        fill="none"
        stroke={BRAND.colors.primary}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 18 105 L 62 92 L 98 75 L 142 82 L 186 55 L 230 60 L 266 32 L 302 40 L 302 140 L 18 140 Z"
        fill="url(#g1)"
      />
      {[
        [18, 105],
        [62, 92],
        [98, 75],
        [142, 82],
        [186, 55],
        [230, 60],
        [266, 32],
        [302, 40],
      ].map(([x, y], idx) => (
        <circle key={idx} cx={x} cy={y} r="5" fill={BRAND.colors.primary} opacity="0.9" />
      ))}
    </svg>
  );
}

function ChartBarsDemo() {
  return (
    <svg viewBox="0 0 320 140" width="100%" height="140" role="img" aria-label="Demo bar chart">
      <rect x="0" y="0" width="320" height="140" rx="14" fill="rgba(148,163,184,0.12)" />
      {Array.from({ length: 5 }).map((_, i) => {
        const y = 24 + i * 23;
        return <line key={i} x1="22" y1={y} x2="302" y2={y} stroke="rgba(148,163,184,0.35)" strokeWidth="1" />;
      })}
      <g fill={BRAND.colors.primary} opacity="0.9">
        {[70, 52, 78, 40, 92, 62].map((h, i) => {
          const x = 30 + i * 44;
          const y = 120 - h;
          return <rect key={i} x={x} y={y} width="26" height={h} rx="6" />;
        })}
      </g>
    </svg>
  );
}

function ChartDonutDemo() {
  return (
    <svg viewBox="0 0 320 140" width="100%" height="140" role="img" aria-label="Demo donut chart">
      <rect x="0" y="0" width="320" height="140" rx="14" fill="rgba(148,163,184,0.12)" />
      <g transform="translate(160 70)">
        <circle r="44" fill="none" stroke={BRAND.colors.primary} strokeWidth="18" strokeDasharray="140 80" strokeLinecap="round" />
        <circle r="44" fill="none" stroke="#22c55e" strokeWidth="18" strokeDasharray="90 130" strokeLinecap="round" transform="rotate(70)" />
        <circle r="44" fill="none" stroke="#3b82f6" strokeWidth="18" strokeDasharray="70 150" strokeLinecap="round" transform="rotate(170)" />
        <circle r="28" fill="rgba(2,6,23,0.8)" />
        <text x="0" y="7" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">
          Mix
        </text>
      </g>
      <g fill="rgba(148,163,184,0.7)" fontSize="12" fontWeight="600">
        <text x="18" y="32">Light</text>
        <text x="18" y="54">Sweet</text>
        <text x="18" y="76">Heavy</text>
      </g>
      <g transform="translate(90 24)">
        <rect x="0" y="8" width="10" height="10" rx="3" fill={BRAND.colors.primary} opacity="0.9" />
        <rect x="0" y="30" width="10" height="10" rx="3" fill="#3b82f6" opacity="0.9" />
        <rect x="0" y="52" width="10" height="10" rx="3" fill="#22c55e" opacity="0.9" />
      </g>
    </svg>
  );
}

function ChartFlowDemo() {
  return (
    <svg viewBox="0 0 320 140" width="100%" height="140" role="img" aria-label="Demo flow diagram">
      <rect x="0" y="0" width="320" height="140" rx="14" fill="rgba(148,163,184,0.12)" />
      <rect x="26" y="30" width="78" height="28" rx="10" fill="rgba(37,99,235,0.18)" stroke={BRAND.colors.primary} strokeWidth="1.5" />
      <rect x="26" y="68" width="78" height="28" rx="10" fill="rgba(37,99,235,0.18)" stroke={BRAND.colors.primary} strokeWidth="1.5" />
      <rect x="216" y="40" width="78" height="28" rx="10" fill="rgba(37,99,235,0.18)" stroke={BRAND.colors.primary} strokeWidth="1.5" />
      <rect x="216" y="80" width="78" height="28" rx="10" fill="rgba(37,99,235,0.18)" stroke={BRAND.colors.primary} strokeWidth="1.5" />
      <path d="M 104 44 C 140 44, 160 44, 216 54" stroke={BRAND.colors.primary} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M 104 82 C 140 80, 170 82, 216 94" stroke={BRAND.colors.primary} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M 104 58 C 140 62, 170 62, 216 70" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75" />
      <g fill="rgba(148,163,184,0.8)" fontSize="12" fontWeight="600">
        <text x="65" y="48" textAnchor="middle">Source</text>
        <text x="65" y="86" textAnchor="middle">Source</text>
        <text x="255" y="58" textAnchor="middle">Output</text>
        <text x="255" y="98" textAnchor="middle">Output</text>
      </g>
    </svg>
  );
}

export default async function MarketingPage() {
  const appName = await getAppName();
  return (
    <div className="min-h-[80vh]">
      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Oil data visualisations & analysis, powered by large datasets
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Search open oil data sources, explore interactive charts, and run your own analysis—without enterprise terminals.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: BRAND.colors.primary }}
          >
            Open the app
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center px-6 py-3 rounded-lg font-semibold border border-border hover:bg-muted transition-colors"
          >
            See features
          </Link>
        </div>
      </section>

      {/* Value props */}
      <section className="border-t bg-muted/40 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold text-center mb-10">Why {appName}</h2>
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            <div>
              <h3 className="font-semibold" style={{ color: BRAND.colors.primary }}>Oil dataset discovery</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Browse sources and ingest curated data into a transparent, queryable repository.
              </p>
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND.colors.primary }}>Visualise oil signals</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Generate interactive visuals from facts (prices, shipments, production) in one place.
              </p>
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND.colors.primary }}>Run your own analysis</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Chat with the data, retrieve evidence, and iterate on your findings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example visual cards */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight text-center">Example visual cards</h2>
          <p className="mt-3 text-muted-foreground text-center max-w-2xl mx-auto">
            4 dummy visuals to illustrate the future Oilplot story-card layout.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Spot price terminal</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Explore spreads and time ranges (placeholder).</p>
                </div>
                <span className="text-xs rounded-full border px-3 py-1 text-muted-foreground">Demo</span>
              </div>
              <div className="mt-4">
                <ChartLineDemo />
              </div>
              <div className="mt-4">
                <Link href="/dashboard/ai/visualise" className="text-sm font-medium text-primary hover:underline">
                  Open Visualise
                </Link>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Shipment volumes</h3>
                  <p className="mt-1 text-sm text-muted-foreground">See flow patterns between origins and refineries (placeholder).</p>
                </div>
                <span className="text-xs rounded-full border px-3 py-1 text-muted-foreground">Demo</span>
              </div>
              <div className="mt-4">
                <ChartBarsDemo />
              </div>
              <div className="mt-4">
                <Link href="/dashboard/ai/visualise" className="text-sm font-medium text-primary hover:underline">
                  Open Visualise
                </Link>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Oil type mix</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Visualise category mix (placeholder).</p>
                </div>
                <span className="text-xs rounded-full border px-3 py-1 text-muted-foreground">Demo</span>
              </div>
              <div className="mt-4">
                <ChartDonutDemo />
              </div>
              <div className="mt-4">
                <Link href="/dashboard/ai/visualise" className="text-sm font-medium text-primary hover:underline">
                  Open Visualise
                </Link>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Flow story (Sankey-style)</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Track input-to-output mapping (placeholder).</p>
                </div>
                <span className="text-xs rounded-full border px-3 py-1 text-muted-foreground">Demo</span>
              </div>
              <div className="mt-4">
                <ChartFlowDemo />
              </div>
              <div className="mt-4">
                <Link href="/dashboard/ai/visualise" className="text-sm font-medium text-primary hover:underline">
                  Open Visualise
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA + nav */}
      <section className="px-6 py-16 text-center">
        <p className="text-muted-foreground mb-6">
          Ready to explore oil data? Go to the app, or browse the visuals and features.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/dashboard" className="font-medium hover:underline" style={{ color: BRAND.colors.primary }}>
            App (Dashboard)
          </Link>
          <Link href="/features" className="text-muted-foreground hover:text-foreground">Features</Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
          <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
        </div>
      </section>
    </div>
  );
}

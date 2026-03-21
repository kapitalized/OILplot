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
      <rect x="0" y="0" width="320" height="140" rx="4" fill="rgba(62,50,45,0.06)" stroke={BRAND.colors.ink} strokeWidth="2" />
      {[20, 50, 80, 110].map((y) => (
        <line key={y} x1="18" y1={y} x2="302" y2={y} stroke="rgba(62,50,45,0.12)" strokeWidth="1" />
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
      <rect x="0" y="0" width="320" height="140" rx="4" fill="rgba(62,50,45,0.06)" stroke={BRAND.colors.ink} strokeWidth="2" />
      {Array.from({ length: 5 }).map((_, i) => {
        const y = 24 + i * 23;
        return <line key={i} x1="22" y1={y} x2="302" y2={y} stroke="rgba(62,50,45,0.12)" strokeWidth="1" />;
      })}
      <g fill={BRAND.colors.primary} opacity="0.9">
        {[70, 52, 78, 40, 92, 62].map((h, i) => {
          const x = 30 + i * 44;
          const y = 120 - h;
          return <rect key={i} x={x} y={y} width="26" height={h} rx="2" />;
        })}
      </g>
    </svg>
  );
}

function ChartDonutDemo() {
  return (
    <svg viewBox="0 0 320 140" width="100%" height="140" role="img" aria-label="Demo donut chart">
      <rect x="0" y="0" width="320" height="140" rx="4" fill="rgba(62,50,45,0.06)" stroke={BRAND.colors.ink} strokeWidth="2" />
      <g transform="translate(160 70)">
        <circle r="44" fill="none" stroke={BRAND.colors.coral} strokeWidth="18" strokeDasharray="140 80" strokeLinecap="round" />
        <circle r="44" fill="none" stroke={BRAND.colors.amber} strokeWidth="18" strokeDasharray="90 130" strokeLinecap="round" transform="rotate(70)" />
        <circle r="44" fill="none" stroke={BRAND.colors.yellow} strokeWidth="18" strokeDasharray="70 150" strokeLinecap="round" transform="rotate(170)" />
        <circle r="28" fill={BRAND.colors.ink} />
        <text x="0" y="7" textAnchor="middle" fill={BRAND.colors.cream} fontSize="14" fontWeight="700">
          Mix
        </text>
      </g>
      <g fill={BRAND.colors.ink} opacity="0.55" fontSize="12" fontWeight="600">
        <text x="18" y="32">Light</text>
        <text x="18" y="54">Sweet</text>
        <text x="18" y="76">Heavy</text>
      </g>
      <g transform="translate(90 24)">
        <rect x="0" y="8" width="10" height="10" rx="3" fill={BRAND.colors.primary} opacity="0.9" />
        <rect x="0" y="30" width="10" height="10" rx="3" fill={BRAND.colors.amber} opacity="0.9" />
        <rect x="0" y="52" width="10" height="10" rx="3" fill={BRAND.colors.yellow} opacity="0.9" />
      </g>
    </svg>
  );
}

function ChartFlowDemo() {
  return (
    <svg viewBox="0 0 320 140" width="100%" height="140" role="img" aria-label="Demo flow diagram">
      <rect x="0" y="0" width="320" height="140" rx="4" fill="rgba(62,50,45,0.06)" stroke={BRAND.colors.ink} strokeWidth="2" />
      <rect x="26" y="30" width="78" height="28" rx="4" fill="rgba(242,168,58,0.25)" stroke={BRAND.colors.ink} strokeWidth="2" />
      <rect x="26" y="68" width="78" height="28" rx="4" fill="rgba(242,168,58,0.25)" stroke={BRAND.colors.ink} strokeWidth="2" />
      <rect x="216" y="40" width="78" height="28" rx="4" fill="rgba(242,168,58,0.25)" stroke={BRAND.colors.ink} strokeWidth="2" />
      <rect x="216" y="80" width="78" height="28" rx="4" fill="rgba(242,168,58,0.25)" stroke={BRAND.colors.ink} strokeWidth="2" />
      <path d="M 104 44 C 140 44, 160 44, 216 54" stroke={BRAND.colors.primary} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M 104 82 C 140 80, 170 82, 216 94" stroke={BRAND.colors.primary} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M 104 58 C 140 62, 170 62, 216 70" stroke={BRAND.colors.burnt} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
      <g fill={BRAND.colors.ink} opacity="0.65" fontSize="12" fontWeight="600">
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
    <div className="min-h-[70vh]">
      {/* Hero — demo: ink kicker + huge italic headline on pale blue field */}
      <section className="text-center">
        <div className="inline-block px-3 py-1 bg-oilplot-ink text-oilplot-cream text-[10px] font-bold uppercase tracking-[0.25em] mb-6 border-2 border-oilplot-ink">
          Daily Intelligence Report · Open data
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[0.85] max-w-5xl mx-auto">
          Oil data visualisations & analysis, powered by large datasets
        </h1>
        <p className="mt-8 text-base sm:text-lg text-oilplot-ink/75 max-w-2xl mx-auto font-medium leading-relaxed">
          Search open oil data sources, explore interactive charts, and run your own analysis—without enterprise terminals.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground border-2 border-oilplot-ink bg-primary shadow-retro-sm hover:opacity-95 transition-opacity"
          >
            Open the app
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-wide border-4 border-oilplot-ink bg-oilplot-cream text-oilplot-ink shadow-retro-sm hover:-translate-y-0.5 transition-transform"
          >
            See features
          </Link>
        </div>
      </section>

      {/* Value props — cream cards on pale blue (demo story-card style) */}
      <section className="mt-16 sm:mt-20">
        <h2 className="text-3xl sm:text-4xl text-center mb-10 sm:mb-12">Why {appName}</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="border-4 border-oilplot-ink bg-oilplot-cream p-6 sm:p-8 shadow-retro text-left min-h-[200px] flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
            <h3 className="text-lg sm:text-xl border-2 border-oilplot-ink inline-block px-2 py-0.5 bg-oilplot-coral text-white w-fit">Discovery</h3>
            <p className="mt-4 text-sm font-medium text-oilplot-ink/80 leading-relaxed">
              Browse sources and ingest curated data into a transparent, queryable repository.
            </p>
          </div>
          <div className="border-4 border-oilplot-ink bg-oilplot-cream p-6 sm:p-8 shadow-retro text-left min-h-[200px] flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
            <h3 className="text-lg sm:text-xl border-2 border-oilplot-ink inline-block px-2 py-0.5 bg-oilplot-amber text-oilplot-ink w-fit">Visuals</h3>
            <p className="mt-4 text-sm font-medium text-oilplot-ink/80 leading-relaxed">
              Generate interactive visuals from facts (prices, shipments, production) in one place.
            </p>
          </div>
          <div className="border-4 border-oilplot-ink bg-oilplot-cream p-6 sm:p-8 shadow-retro text-left min-h-[200px] flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
            <h3 className="text-lg sm:text-xl border-2 border-oilplot-ink inline-block px-2 py-0.5 bg-oilplot-burnt text-oilplot-cream w-fit">Analysis</h3>
            <p className="mt-4 text-sm font-medium text-oilplot-ink/80 leading-relaxed">
              Chat with the data, retrieve evidence, and iterate on your findings.
            </p>
          </div>
        </div>
      </section>

      {/* Example visual cards */}
      <section className="mt-16 sm:mt-24 pt-12 border-t-4 border-oilplot-ink/30">
        <div>
          <h2 className="text-3xl sm:text-5xl text-center mb-3">Example visual cards</h2>
          <p className="text-sm font-medium text-oilplot-ink/65 text-center max-w-2xl mx-auto">
            Dummy visuals — thick borders & cream panels like the story engine demo.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="relative border-4 border-oilplot-ink bg-oilplot-cream p-6 shadow-retro">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tight">Spot price terminal</h3>
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

            <div className="relative border-4 border-oilplot-ink bg-oilplot-cream p-6 shadow-retro">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tight">Shipment volumes</h3>
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

            <div className="relative border-4 border-oilplot-ink bg-oilplot-cream p-6 shadow-retro">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tight">Oil type mix</h3>
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

            <div className="relative border-4 border-oilplot-ink bg-oilplot-cream p-6 shadow-retro">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tight">Flow story (Sankey-style)</h3>
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
      <section className="px-6 py-16 text-center border-t-4 border-oilplot-ink bg-oilplot-cream">
        <p className="text-muted-foreground mb-6 font-medium max-w-xl mx-auto">
          Ready to explore oil data? Go to the app, or browse the visuals and features.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm font-bold uppercase tracking-wide">
          <Link href="/dashboard" className="text-oilplot-coral hover:underline">
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

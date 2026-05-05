import { BRAND } from '@/lib/brand';

type Point = { date: string; price: number };

/**
 * Server-rendered SVG line chart (no client JS).
 */
export function SimpleSvgLineChart({
  points,
  ariaLabel,
}: {
  points: Point[];
  ariaLabel: string;
}) {
  if (points.length === 0) {
    return (
      <div className="rounded-sm border-4 border-dashed border-oilplot-ink/20 bg-oilplot-cream/20 px-6 py-16 text-center text-sm text-oilplot-ink/60">
        No data to plot yet.
      </div>
    );
  }

  const w = 720;
  const h = 280;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 40;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const prices = points.map((p) => p.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const span = Math.max(maxP - minP, 1e-6);

  const n = points.length;
  const toX = (i: number) => padL + (innerW * i) / Math.max(n - 1, 1);
  const toY = (p: number) => padT + innerH * (1 - (p - minP) / span);

  const d = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(2)} ${toY(pt.price).toFixed(2)}`)
    .join(' ');

  const first = points[0]!;
  const last = points[points.length - 1]!;

  return (
    <figure className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="min-h-[240px] w-full max-w-full text-oilplot-ink"
        role="img"
        aria-label={ariaLabel}
      >
        <title>{ariaLabel}</title>
        <rect x={0} y={0} width={w} height={h} fill={BRAND.colors.cream} fillOpacity={0.35} />
        <text x={padL} y={padT + 10} className="fill-oilplot-ink/50" style={{ fontSize: 10 }}>
          {maxP.toFixed(2)}
        </text>
        <text x={padL} y={padT + innerH} className="fill-oilplot-ink/50" style={{ fontSize: 10 }}>
          {minP.toFixed(2)}
        </text>
        <path
          d={d}
          fill="none"
          stroke={BRAND.colors.coral}
          strokeWidth={2.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <text
          x={padL}
          y={h - 8}
          className="fill-oilplot-ink/70"
          style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace' }}
        >
          {first.date} → {last.date}
        </text>
      </svg>
    </figure>
  );
}

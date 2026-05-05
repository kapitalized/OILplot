import { BRAND } from '@/lib/brand';

export type BarDatum = { label: string; value: number };

/**
 * Horizontal bar chart — server-rendered SVG.
 */
export function SimpleSvgBarChart({
  data,
  valueSuffix,
  ariaLabel,
}: {
  data: BarDatum[];
  valueSuffix: string;
  ariaLabel: string;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-sm border-4 border-dashed border-oilplot-ink/20 bg-oilplot-cream/20 px-6 py-16 text-center text-sm text-oilplot-ink/60">
        No regional capacity rows yet. Run the EIA refinery capacity source from admin.
      </div>
    );
  }

  const w = 720;
  const rowH = 28;
  const padL = 200;
  const padR = 72;
  const padT = 12;
  const padB = 12;
  const chartW = w - padL - padR;
  const h = padT + data.length * rowH + padB;
  const maxV = Math.max(...data.map((d) => d.value), 1);

  return (
    <figure className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="min-h-[200px] w-full max-w-full"
        role="img"
        aria-label={ariaLabel}
      >
        <title>{ariaLabel}</title>
        <rect x={0} y={0} width={w} height={h} fill={BRAND.colors.cream} fillOpacity={0.35} />
        {data.map((row, i) => {
          const y = padT + i * rowH;
          const bw = (chartW * row.value) / maxV;
          const label = row.label.length > 32 ? `${row.label.slice(0, 30)}…` : row.label;
          return (
            <g key={`${row.label}-${i}`}>
              <text
                x={padL - 8}
                y={y + rowH / 2 + 4}
                textAnchor="end"
                className="fill-oilplot-ink/85"
                style={{ fontSize: 10 }}
              >
                {label}
              </text>
              <rect
                x={padL}
                y={y + 4}
                width={bw}
                height={rowH - 8}
                fill={BRAND.colors.amber}
                stroke={BRAND.colors.ink}
                strokeWidth={1}
              />
              <text
                x={padL + bw + 8}
                y={y + rowH / 2 + 4}
                className="fill-oilplot-ink/80"
                style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace' }}
              >
                {row.value}
                {valueSuffix}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

import { BRAND } from '@/lib/brand';
import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return getPageMetadata('features');
}

const features = [
  {
    title: 'Search data sources',
    description: 'Discover where the data comes from (APIs + later scrapers) and track ingestion runs for transparency.',
  },
  {
    title: 'Oil visualisations',
    description: 'Interactive charts for prices, shipments, and production—so you can see patterns, spreads, and flows quickly.',
  },
  {
    title: 'Run your own analysis',
    description: 'Use AI to query the repository and summarize results with evidence, then iterate with your own assumptions.',
  },
  {
    title: 'Visual story cards',
    description: 'Turn dataset queries into shareable cards that combine a narrative with the underlying chart configuration.',
  },
  {
    title: 'Secure & organized workspaces',
    description: 'Keep chats, visualisations, and evidence scoped to your workspace—so your analysis stays auditable.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Features</h1>
      <p className="mt-2 text-muted-foreground">
        Everything you need to explore large oil datasets with transparent ingestion, evidence-driven analysis, and interactive visuals.
      </p>
      <ul className="mt-12 space-y-10">
        {features.map((f) => (
          <li key={f.title}>
            <h2 className="text-xl font-semibold" style={{ color: BRAND.colors.primary }}>
              {f.title}
            </h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">{f.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

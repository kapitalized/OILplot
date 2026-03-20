import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { getAppName } from '@/lib/app-name';
import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return getPageMetadata('about');
}

export default async function AboutPage() {
  const appName = await getAppName();
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">About {appName}</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Oilplot.com is an open energy repository: we turn fragmented oil data into actionable, AI-analyzed insights.
        Every output is designed for human review and auditable evidence.
      </p>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Our platform focuses on large datasets and transparent ingestion, so you can explore oil visualisations and run your own analysis.
      </p>
      <Link
        href="/contact"
        className="mt-8 inline-block font-medium text-primary hover:underline"
      >
        Get in touch →
      </Link>
    </div>
  );
}

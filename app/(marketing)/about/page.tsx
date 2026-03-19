import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: 'About',
  description: `Learn about ${BRAND.name} — ${BRAND.slogan}.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">About {BRAND.name}</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        We build precision AI tools for technical industries: construction takeoffs, financial analysis,
        and document intelligence. Every output is designed for human review and audit trails.
      </p>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Our stack combines vision models for extraction, reasoning models for calculation, and
        synthesis for professional reporting — so your team stays in control.
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

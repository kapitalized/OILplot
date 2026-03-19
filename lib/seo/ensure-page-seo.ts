import { BRAND } from '@/lib/brand';

export interface EnsurePageSeoArgs {
  title?: unknown;
  slug?: unknown;
  metaTitle?: unknown;
  metaDescription?: unknown;
  metaKeywords?: unknown;
  canonicalUrl?: unknown;
}

function asNonEmptyString(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length ? s : null;
}

function clamp(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

function titleToKeywords(title: string): string {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => w.length >= 3)
    .slice(0, 8);
  const uniq = Array.from(new Set([BRAND.name.toLowerCase(), ...words]));
  return uniq.join(', ');
}

function buildCanonical(slug: string): string | null {
  const base = asNonEmptyString(process.env.NEXT_PUBLIC_APP_URL);
  if (!base) return null;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedSlug = slug.startsWith('/') ? slug.slice(1) : slug;
  return `${normalizedBase}/${normalizedSlug}`;
}

/**
 * Ensures Pages SEO fields are present. Only fills missing/blank fields — never overwrites.
 */
export function ensurePageSeoFields(input: EnsurePageSeoArgs): EnsurePageSeoArgs {
  const title = asNonEmptyString(input.title) ?? undefined;
  const slug = asNonEmptyString(input.slug) ?? undefined;

  const out: EnsurePageSeoArgs = { ...input };

  if (!asNonEmptyString(out.metaTitle) && title) {
    out.metaTitle = clamp(title, 60);
  }

  if (!asNonEmptyString(out.metaDescription) && title) {
    // Keep it generic and safe (no hallucinated claims) while still being useful.
    out.metaDescription = clamp(`${title} — ${BRAND.slogan}.`, 160);
  }

  if (!asNonEmptyString(out.metaKeywords) && title) {
    out.metaKeywords = titleToKeywords(title);
  }

  if (!asNonEmptyString(out.canonicalUrl) && slug) {
    const canonical = buildCanonical(slug);
    if (canonical) out.canonicalUrl = canonical;
  }

  return out;
}


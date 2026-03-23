import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { getB2BSoftwareJsonLd } from '@/lib/seo';
import { getAppName } from '@/lib/app-name';
import { OilplotBrandMark } from '@/components/branding/OilplotBrandMark';
import { RetroCtaButton } from '@/components/marketing/RetroCtaButton';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appName = await getAppName();
  const jsonLd = getB2BSoftwareJsonLd(appName);

  const navLink =
    'text-xs font-bold uppercase tracking-[0.2em] text-oilplot-cream/70 hover:text-oilplot-cream hover:opacity-100 transition-opacity';

  return (
    <div className="oilplot-theme min-h-screen flex flex-col text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Demo: border-b-4 ink bar, cream type, py-6, px-8 */}
      <header className="sticky top-0 z-50 border-b-4 border-oilplot-ink bg-oilplot-ink text-oilplot-cream px-6 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-4 shrink-0 min-w-0">
          <OilplotBrandMark />
          <span className="font-display text-2xl sm:text-3xl tracking-tighter truncate">{appName}</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-6 md:gap-x-10 gap-y-2">
          <Link href="/" className={navLink}>
            Home
          </Link>
          <Link href="/repository" className={navLink}>
            Data
          </Link>
          <Link href="/features" className={navLink}>
            Features
          </Link>
          <Link href="/pricing" className={navLink}>
            Pricing
          </Link>
          <Link href="/about" className={navLink}>
            About
          </Link>
          <Link href="/contact" className={navLink}>
            Contact
          </Link>
          <Link href="/setup" className={navLink}>
            Setup
          </Link>
          <Link href="/admin" className={navLink}>
            Admin
          </Link>
          <Link href="/login" className={`${navLink} border-b-4 border-transparent hover:border-oilplot-yellow pb-1`}>
            Log in
          </Link>
          <RetroCtaButton href="/dashboard">Get started</RetroCtaButton>
        </nav>
      </header>
      {/* Demo: max-w-7xl mx-auto px-8 py-12 on main */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-12">{children}</main>
      <footer className="border-t-4 border-oilplot-ink bg-oilplot-cream px-6 sm:px-8 py-16 sm:py-20 text-center relative overflow-hidden">
        <p
          className="font-display text-[clamp(3rem,14vw,8rem)] leading-none opacity-[0.08] select-none pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2"
          aria-hidden
        >
          {appName.toUpperCase()}
        </p>
        <div className="relative z-10 mx-auto max-w-4xl flex flex-col sm:flex-row flex-wrap items-center justify-between gap-8">
          <div className="text-left max-w-md">
            <p className="font-display text-xl sm:text-2xl tracking-tighter">{appName}</p>
            <span className="mt-2 block text-xs font-bold uppercase tracking-[0.2em] text-oilplot-ink/50">
              © {new Date().getFullYear()} · {BRAND.slogan}
            </span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-[0.25em] text-oilplot-ink/60">
            <Link href="/about" className="hover:text-oilplot-coral transition-colors">
              About
            </Link>
            <Link href="/repository" className="hover:text-oilplot-coral transition-colors">
              Data
            </Link>
            <Link href="/features" className="hover:text-oilplot-coral transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-oilplot-coral transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="hover:text-oilplot-coral transition-colors">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-oilplot-coral transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-oilplot-coral transition-colors">
              Terms
            </Link>
            <Link href="/setup" className="hover:text-oilplot-coral transition-colors">
              Setup
            </Link>
            <Link href="/admin" className="hover:text-oilplot-coral transition-colors">
              Admin
            </Link>
          </nav>
        </div>
        <p className="relative z-10 mt-10 text-[10px] font-bold uppercase tracking-[0.4em] text-oilplot-ink/40">
          Energy transparency · Open data repository
        </p>
      </footer>
    </div>
  );
}

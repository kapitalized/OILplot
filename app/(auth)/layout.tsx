import { BRAND } from '@/lib/brand';
import { OilplotBrandMark } from '@/components/branding/OilplotBrandMark';
import { getAppName } from '@/lib/app-name';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appName = await getAppName();
  return (
    <div className="oilplot-theme min-h-screen flex flex-col items-center justify-center bg-oilplot-pale p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-block border-4 border-oilplot-ink bg-oilplot-cream px-6 py-5 shadow-retro">
            <div className="flex items-center justify-center gap-3">
              <OilplotBrandMark className="h-11 w-11" />
              <span className="font-display text-2xl tracking-tighter text-oilplot-ink">{appName}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mt-4">{BRAND.tagline}</p>
            <p className="text-sm text-muted-foreground mt-2 normal-case tracking-normal">{BRAND.slogan}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

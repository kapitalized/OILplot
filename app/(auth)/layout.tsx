import { BRAND } from '@/lib/brand';
import { getAppName } from '@/lib/app-name';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appName = await getAppName();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={BRAND.logo} alt={appName} className="h-10 w-auto mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">{BRAND.slogan}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

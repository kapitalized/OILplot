import Link from 'next/link';
import { headers } from 'next/headers';
import { OilplotBrandMark } from '@/components/branding/OilplotBrandMark';
import { getAppName } from '@/lib/app-name';
import { isNeonAuthConfigured } from '@/lib/auth/server';
import { getSessionForLayout } from '@/lib/auth/get-session-for-layout';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/lib/supabase/actions';
import { UserMenu } from '@/components/dashboard/UserMenu';
import { HealthMonitor } from '@/components/dashboard/HealthMonitor';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appName = await getAppName();
  let user: { email?: string | null } | null = null;

  if (isNeonAuthConfigured()) {
    try {
      const session = await getSessionForLayout(await headers());
      user = session?.user ? { email: session.user.email } : null;
    } catch {
      user = null;
    }
  }

  if (!user) {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      user = data.user ? { email: data.user.email } : null;
    }
  }

  const navLink =
    'text-[11px] font-bold uppercase tracking-[0.18em] text-oilplot-cream/80 hover:text-oilplot-cream';

  return (
    <div className="oilplot-theme min-h-screen flex flex-col bg-oilplot-pale text-foreground">
      <header className="border-b-4 border-oilplot-ink bg-oilplot-ink text-oilplot-cream px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0 min-w-0">
          <OilplotBrandMark className="h-9 w-9" />
          <span className="font-display text-xl sm:text-2xl tracking-tighter truncate">{appName}</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-5">
          <HealthMonitor tone="onInk" />
          <Link href="/dashboard" className={navLink}>
            Dashboard
          </Link>
          <Link href="/dashboard/organisation" className={navLink}>
            Organisation
          </Link>
          <Link href="/dashboard/team" className={navLink}>
            Team
          </Link>
          <Link href="/dashboard/billing" className={navLink}>
            Billing
          </Link>
          {user ? (
            <UserMenu
              userEmail={user.email}
              useNeonAuth={isNeonAuthConfigured()}
              signOutAction={isNeonAuthConfigured() ? undefined : signOut}
              triggerClassName="!text-oilplot-cream hover:!bg-white/10 hover:!text-oilplot-cream"
            />
          ) : (
            <Link href="/login" className={navLink}>
              Log in
            </Link>
          )}
        </nav>
      </header>
      <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      <footer className="border-t-4 border-oilplot-ink bg-oilplot-cream px-6 py-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-oilplot-ink/60">
        <span>System status · {appName}</span>
        <Link href="/privacy" className="hover:text-foreground">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-foreground">
          Terms
        </Link>
      </footer>
    </div>
  );
}

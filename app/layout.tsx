import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { BRAND } from '@/lib/brand';
import { getAppName } from '@/lib/app-name';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const pathname = (await headers()).get('x-pathname') ?? '';
  if (pathname.startsWith('/admin')) {
    return {} as Metadata;
  }

  const appName = await getAppName();

  return {
    title: {
      default: appName,
      template: `%s | ${appName}`,
    },
    description: BRAND.slogan,
    icons: { icon: '/favicon.ico', shortcut: '/favicon.ico', apple: BRAND.logo },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get('x-pathname') ?? '';
  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

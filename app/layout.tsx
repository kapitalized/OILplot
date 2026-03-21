import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Archivo_Black, Space_Grotesk } from 'next/font/google';
import { BRAND } from '@/lib/brand';
import { getAppName } from '@/lib/app-name';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

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
      <body className={`${spaceGrotesk.variable} ${archivoBlack.variable} font-sans`}>{children}</body>
    </html>
  );
}

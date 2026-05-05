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
    manifest: '/site.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
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

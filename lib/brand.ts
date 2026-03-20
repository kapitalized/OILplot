/**
 * Brand identity — single source of truth for app name, assets, and theme.
 */

export const BRAND = {
  // Fallback name when Payload Site Settings isn't available yet.
  name: process.env.NEXT_PUBLIC_APP_NAME ?? 'Oilplot',
  logo: '/logo.png',
  colors: { primary: '#2563eb', secondary: '#64748b' },
  slogan: 'Large oil datasets for visual analysis. Run your own insights.',
} as const;

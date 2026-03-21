/**
 * Brand identity — single source of truth for app name, assets, and theme.
 * Palette aligns with Branding/Oilplot_theme_blue.jsx + Oilplot_Visual_Guide_Retro.md
 * (mid-century terminal: pale blue field, cream cards, ink text, sunset accents).
 */

export const BRAND = {
  // Fallback name when Payload Site Settings isn't available yet.
  name: process.env.NEXT_PUBLIC_APP_NAME ?? 'Oilplot',
  logo: '/logo.png',
  /** Reference image from Branding/RetroTheme.webp (also at /branding-retro-reference.webp). */
  retroReferenceImage: '/branding-retro-reference.webp',
  colors: {
    /** Page background (pale blue) */
    paleBlue: '#A5C2D0',
    /** Cards / panels (cream) */
    cream: '#F2EBD4',
    /** Primary text / borders (dark brown ink) */
    ink: '#3E322D',
    /** Sunset ladder — highlights & charts */
    yellow: '#F8C43F',
    amber: '#F2A83A',
    burnt: '#F27D3B',
    coral: '#F14A42',
    /** Primary actions (CTA) — coral */
    primary: '#F14A42',
    secondary: '#3E322D',
  },
  slogan: 'Large oil datasets for visual analysis. Run your own insights.',
  /** Tagline from logo mock (Open Energy Intelligence) — optional marketing copy */
  tagline: 'Open Energy Intelligence',
} as const;

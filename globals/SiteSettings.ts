import type { GlobalConfig } from 'payload';

/**
 * Site-wide SEO defaults. Merged with per-page overrides in getPageMetadata.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  fields: [
    {
      name: 'siteTitle',
      type: 'text',
      required: true,
      defaultValue: process.env.NEXT_PUBLIC_APP_NAME ?? 'Oilplot',
    },
    {
      name: 'titleTemplate',
      type: 'text',
      defaultValue: `%s | ${process.env.NEXT_PUBLIC_APP_NAME ?? 'Oilplot'}`,
      admin: { description: 'e.g. %s | Oilplot' },
    },
    { name: 'defaultDescription', type: 'textarea', admin: { description: 'Fallback meta description' } },
    { name: 'defaultOGImage', type: 'text', admin: { description: 'Fallback OG image URL' } },
  ],
};

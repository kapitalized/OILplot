import type { GlobalConfig } from 'payload';

/**
 * Site-wide SEO defaults. Merged with per-page overrides in getPageMetadata.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  fields: [
    { name: 'siteTitle', type: 'text', required: true, defaultValue: 'ConstructAI' },
    { name: 'titleTemplate', type: 'text', defaultValue: '%s | ConstructAI', admin: { description: 'e.g. %s | ConstructAI' } },
    { name: 'defaultDescription', type: 'textarea', admin: { description: 'Fallback meta description' } },
    { name: 'defaultOGImage', type: 'text', admin: { description: 'Fallback OG image URL' } },
  ],
};

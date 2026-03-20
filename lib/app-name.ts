import { getSiteSettings } from '@/lib/payload-content';
import { BRAND } from '@/lib/brand';

/**
 * App name derived from Payload "Site Settings".
 * Falls back to NEXT_PUBLIC_APP_NAME (if set) or BRAND.name when Payload/DB isn't available.
 */
export async function getAppName(): Promise<string> {
  const settings = await getSiteSettings();
  if (settings?.siteTitle && settings.siteTitle.trim().length > 0) return settings.siteTitle.trim();

  const envName = process.env.NEXT_PUBLIC_APP_NAME;
  if (envName && envName.trim().length > 0) return envName.trim();

  return BRAND.name;
}


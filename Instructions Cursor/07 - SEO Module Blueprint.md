# **07 \- SEO & Metadata Module: Marketing Optimization**

This module provides a simple, CMS-driven way to manage SEO for the marketing site using the Next.js 15 Metadata API.

## **1\. Technical Strategy**

* **Management:** Payload CMS (Global settings \+ Per-page overrides).  
* **Social:** Automatic Open Graph (OG) and Twitter card generation.  
* **Performance:** Metadata is fetched server-side and cached.

## **2\. Payload CMS Collections**

### **A. Global: SiteSettings**

* **Site Title:** Base name of the application.  
* **Title Template:** (e.g., "%s | ConstructAI")  
* **Default Description:** Fallback description.  
* **Default OG Image:** Fallback image for social sharing.

### **B. Collection: Pages (Marketing Pages)**

Every marketing page has an "SEO Tab":

* **Meta Title:** Overrides the default title.  
* **Meta Description:** High-impact summary (150-160 chars).  
* **Canonical URL:** Prevents duplicate content issues.  
* **Index Page:** Toggle to allow/disallow search engine crawlers.

## **3\. Implementation Logic (/lib/seo.ts)**

A utility function getPageMetadata(slug) that:

1. Fetches data from the Pages collection for the given slug.  
2. Merges with SiteSettings for missing fields.  
3. Falls back to /lib/brand.ts constants if CMS is entirely empty.  
4. Returns a standard Next.js Metadata object.

## **4\. Cursor Prompt: SEO Setup**

"Implement the SEO Module using the 07\_seo\_module\_blueprint.md.

1. Create a 'Pages' collection in Payload CMS with an 'SEO' tab containing: Title, Description, Canonical URL, and OG Image fields.  
2. Create a 'SiteSettings' Global in Payload for site-wide defaults.  
3. Implement generateMetadata in app/(marketing)/\[slug\]/page.tsx that fetches these values.  
4. Ensure the AppHeader and MarketingHeader use the BRAND name from /lib/brand.ts if CMS titles are missing."

## **5\. Structured Data (JSON-LD)**

The module also supports **B2B Software Schema**. This tells Google specifically that your site is a B2B application, which helps with ranking for "SaaS" or "CAD Software" keywords. This should be injected into the root layout for public pages.
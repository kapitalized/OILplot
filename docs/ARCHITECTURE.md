## Architecture overview

This repo is a **Next.js 15 (App Router)** app with:
- **App UI + APIs** in `app/`
- **Database** via **Neon Postgres + Drizzle** in `lib/db/`
- **Payload CMS** for admin/CMS at `/admin` (collections in `collections/`, globals in `globals/`)
- **AI pipeline + chat** in `lib/ai/` and `app/api/ai/*`, `app/api/chat/*`
- **File storage** via Vercel Blob (`@vercel/blob`)

---

## Directory map (modules)

- **`app/(marketing)`**: Public marketing/SEO pages (e.g. `/about`, `/pricing`)
- **`app/(auth)`**: Authentication pages (Neon Auth or Supabase fallback)
- **`app/(dashboard)`**: Signed-in app UI (projects, documents, analyse, chat, billing)
- **`app/(payload)`**: Payload Admin integration + custom admin views
- **`app/api/*`**: Next.js Route Handlers (server APIs)
- **`collections/`**: Payload collections (CMS/admin data)
- **`globals/`**: Payload globals (site-wide settings)
- **`lib/`**: Core services (auth, db, AI, SEO, blob, URL helpers)
- **`components/`**: Shared UI components (incl. AI report viewer)
- **`docs/`**: Product + engineering docs

---

## Key runtime “systems”

### Auth
- **Primary**: Neon Auth (cookie/session)
- **Fallback**: Supabase auth client (server-side)
- **Where**:
  - Session helpers: `lib/auth/*`
  - Auth UI: `app/(auth)/*`
  - APIs use `getSessionForApi()` to authorize.

### Database (Drizzle)
- Tables live in `lib/db/schema.ts`
- DB client in `lib/db/*`
- Used for “app data” (projects, documents, AI runs, chat threads/messages, audit logs).
  - See also `docs/SCHEMA_SETUP.md`

### Payload CMS / Admin
- Admin UI: **`/admin`**
- Config: `payload.config.ts`
- Collections:
  - `collections/Pages.ts` — marketing pages + SEO fields
  - `collections/Users.ts` — Payload admin auth users
  - `collections/ApiSources.ts`, `collections/ExternalApiRuns.ts` — External APIs module
  - `collections/ExternalIntegrations.ts` — encrypted credentials store (admin only)
- Globals:
  - `globals/SiteSettings` — site title template, default OG image, etc.
- Admin custom views are configured in `payload.config.ts` and implemented in `app/(payload)/admin/_components/*`.
  - See `docs/PAYLOAD_ADMIN.md`

### SEO (marketing pages)
- Runtime metadata builder: `lib/seo.ts` (`getPageMetadata(slug)`)
- Payload “Pages” SEO fields:
  - `metaTitle`, `metaDescription`, `metaKeywords`, `canonicalUrl`, `indexPage`
- Auto-generation on save:
  - `lib/seo/ensure-page-seo.ts` + `collections/Pages.ts` `beforeChange` hook

---

## Core user flows (data + routes)

### 1) Projects
- **UI**: `app/(dashboard)/project/[shortId]/[slug]/*`
- **Helpers**: `lib/project-url.ts`
- **APIs**: `app/api/projects/*`

### 2) Documents (file uploads)
- **Dashboard Documents (global)**: `app/(dashboard)/dashboard/ai/documents/*`
- **Project Documents**: `app/(dashboard)/project/[shortId]/[slug]/documents/*`
- **API**:
  - `GET/POST /api/projects/[projectId]/files`
  - `GET /api/projects/[projectId]/files/[fileId]/image` (if used for previews)
- **Storage**: Vercel Blob (URLs stored in DB)

### 3) Analyse (reports)
- **Dashboard Analyse (global)**: `app/(dashboard)/dashboard/ai/analyse/*`
- **Project Analyse**:
  - `/project/[shortId]/[slug]/analyse`
  - `/project/[shortId]/[slug]/analyse/[reportShortId]`
- **API**:
  - `POST /api/ai/run` — run analysis (creates a report/run)
  - `GET /api/projects/[projectId]/reports` — report list
  - `GET /api/reports/[reportId]` — report viewer payload

### 4) Chat (with document/report references)
- **Project chat**: `/project/[shortId]/[slug]/chat`
  - Shows document + report lists; user can select/drag references into chat.
- **APIs**:
  - `GET /api/projects/[projectId]/chat-context` — returns files + recent reports to reference
  - `POST /api/chat/threads/[threadId]/messages` — sends message, optionally with `fileIds` + `reportIds`

---

## External APIs module

Purpose: configure and run external API sources; log each run.

- **Payload collections**:
  - `api-sources`
  - `external-api-runs`
- **Admin view**: `/admin/external-apis`
  - UI component: `app/(payload)/admin/_components/ExternalApisView.tsx`
  - Backend routes:
    - `GET /api/admin/external-apis/sources`
    - `GET /api/admin/external-apis/runs`
    - `POST /api/admin/external-apis/sources/:id/run`
    - `GET /api/admin/external-apis/sources/:id/health`
- **Adapter layer**: `lib/external-apis/*`
  - `registry.ts`, `types.ts`, `run.ts`, `adapters/*`
- See `lib/external-apis/README.md`

---

## “Where do I change…” cheat sheet

- **Marketing page content/SEO**: `collections/Pages.ts`, `lib/seo.ts`, `app/(marketing)/*`
- **Dashboard Analyse layout**: `app/(dashboard)/dashboard/ai/analyse/*`
- **Project chat references UI**: `app/(dashboard)/project/[shortId]/[slug]/chat/page.tsx`
- **Chat send/reference behavior**: `app/(dashboard)/dashboard/ai/chat/AIChatContent.tsx` + `app/api/chat/threads/[threadId]/messages/route.ts`
- **External APIs adapters**: `lib/external-apis/adapters/*`
- **Admin-only APIs**: `app/api/admin/*` (guarded by session / Payload admin cookie)

---

## Related docs

- **Setup + env**: `README.md`, `docs/NEON_SETUP.md`, `docs/VERCEL_DEPLOY_STEPS.md`
- **Dev workflow**: `docs/DEV_WORKFLOW.md`
- **Env vars**: `docs/ENV_VARS.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **AI pipeline + data**: `docs/AI_PIPELINE_AND_DATA.md`
- **DB schema**: `docs/SCHEMA_SETUP.md`
- **Payload admin**: `docs/PAYLOAD_ADMIN.md`
- **AI workflow**: `docs/AI_Floorplan_Extraction_Files_And_Workflow.md`, `docs/REPORT_FORMAT.md`
- **External APIs**: `lib/external-apis/README.md`


## Environment variables

This app uses **Next.js + Neon Postgres + Drizzle + Payload**. Some modules are optional (AI providers, Vercel Blob, Python engine).

### Required (local dev)

- **`DATABASE_URL`**: Postgres connection string (Neon recommended).
  - Used by Drizzle and also by Payload’s Postgres adapter.
- **`NEON_AUTH_BASE_URL`**: Neon Auth base URL.
- **`NEON_AUTH_COOKIE_SECRET`**: Cookie signing secret for Neon Auth sessions.

### Required for Payload Admin (`/admin`)

- **`PAYLOAD_SECRET`**: Payload secret (set a strong value in prod).
- **`DATABASE_URL`** or **`DATABASE_URI`**: Postgres connection string.
  - Prefer the Neon “pooler” connection string in production.

### File uploads (Documents)

- **`BLOB_READ_WRITE_TOKEN`**: Vercel Blob token used by upload routes.

### AI (chat + analysis)

- **`OPENROUTER_API_KEY`**: Enables OpenRouter calls for pipeline/chat.

Optional (depending on features you turn on):
- **`PYTHON_ENGINE_URL`**: If set, `/api/analyze` calls the external Python FastAPI service.
  - If not set, the app uses an in-process calculation engine where available.

### External APIs module (cron)

- **`CRON_SECRET`**: Secret required by `POST /api/cron/sync-external` endpoints.

### Optional (only if using encrypted credentials)

- **`ENCRYPTION_KEY`**: 32 chars; used to encrypt secrets in `collections/ExternalIntegrations.ts`.

### Public URL (SEO canonical)

- **`NEXT_PUBLIC_APP_URL`**: Used to build canonical URLs for Pages SEO when saving.

---

## Where these are used

- **DB**: `lib/db/*`, `payload.config.ts`, Drizzle migrations
- **Auth**: `lib/auth/*`, middleware
- **Payload**: `payload.config.ts`, `collections/*`, `globals/*`
- **Blob**: `lib/blob.ts`, `/api/projects/[projectId]/files`
- **AI**: `lib/ai/*`, `/api/ai/*`, `/api/chat/*`


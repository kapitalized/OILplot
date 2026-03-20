# Sign-up / create account troubleshooting (Neon Auth)

The app uses **Neon Auth** (Better Auth) via `POST /api/auth/*` when `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` are set on the **server** (`.env.local` / Vercel).

## 1. Read the real error

1. On `/sign-up`, submit the form and note the **red message** under the button (we surface the API message + status/code when available).
2. In the browser **DevTools → Network**, find the failing request (often `sign-up` or `sign-up/email` under `/api/auth/...`).
3. Open **Response** — copy the JSON `message` / `code` (do not share passwords).

## 2. Check server env (local)

In `.env.local`:

| Variable | Notes |
|----------|--------|
| `NEON_AUTH_BASE_URL` | Exact **Auth URL** from Neon (same project as `DATABASE_URL`). No trailing slash issues are usually OK; avoid typos. |
| `NEON_AUTH_COOKIE_SECRET` | **32+ random characters**, only in your app — not pasted into Neon Console. |

Restart `npm run dev` after changing env.

## 3. Neon Console (Auth)

1. **Neon project** → Auth / Integrations → confirm **Neon Auth is enabled** for this database.
2. Confirm **email + password** sign-up is allowed (not disabled by project settings).
3. If **email verification** is required, finish the flow from the email Neon sends (or adjust verification settings per [Neon email docs](https://neon.com/docs/neon-auth/email-configuration)).

## 4. Same origin / port

Sessions are per **origin** (`http://localhost:3010` ≠ `http://localhost:3000`). Always open the app at **one** URL (including port) for sign-up and later login.

## 5. Common API errors

| Symptom | Likely cause |
|---------|----------------|
| User already exists / duplicate | Email already registered — use **Log in** or another email. |
| 401 / 403 / invalid origin | App URL vs Neon Auth allowed origins / proxy mismatch — use the URL you configured for dev. |
| 503 from `/api/auth` | Server missing `NEON_AUTH_BASE_URL` or `NEON_AUTH_COOKIE_SECRET` (see `app/api/auth/[...all]/route.ts`). |
| Generic network error | Ad blocker, VPN, or corporate proxy blocking `*.neon.tech` / auth host. |

## 6. Optional: Supabase instead

If you use Supabase for auth, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` and ensure Neon email path is not the one in use for your flow (see `app/(auth)/sign-up/page.tsx`).

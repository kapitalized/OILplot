# Manual steps: Deploy B2B Blueprint to Vercel

Do these in order. The app runs from the **repo root** (no subfolder).

---

## 1. GitHub

1. Push your repo to GitHub (e.g. `B2B_Blueprint`).
2. Ensure the branch you want to deploy (e.g. `main`) is up to date.

---

## 2. Vercel: Import project

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New…** → **Project**.
3. Under **Import Git Repository**, select your GitHub account/org and choose the **B2B_Blueprint** repo.
4. Click **Import**.
5. **Configure Project** (before first deploy):
   - **Root Directory:** Leave as **.** (repo root). Do **not** set `template`.
   - **Framework Preset:** Next.js (auto-detected).
   - **Build Command:** `npm run build` (default).
   - **Install Command:** `npm install` or `npm install --legacy-peer-deps` if you hit peer dependency errors.
   - **Output Directory:** leave default.
6. Do **not** deploy yet if you want to add env vars first (see step 5). You can add env vars now or after the first deploy.

---

## 3. Neon (database)

1. Go to [neon.tech](https://neon.tech) and sign in (or sign up).
2. Create a **new project** (or use an existing one). Pick region and Postgres version.
3. Open the project → **Connection details** (or Dashboard).
4. Copy the **connection string** (with `?sslmode=require`). You’ll use this as `DATABASE_URL`.
5. **Enable Neon Auth** for this project:
   - In the project, go to **Integrations** or **Auth** (Neon Auth).
   - Enable Neon Auth. Neon creates the `neon_auth` schema.
   - Copy the **Auth URL** → this is `NEON_AUTH_BASE_URL`.
   - You’ll need a **cookie secret** (min 32 chars). Generate one, e.g.:
     - `openssl rand -base64 32`
     - Or use a password generator. Save it as `NEON_AUTH_COOKIE_SECRET`.

---

## 4. Vercel Blob (storage, optional but recommended)

1. In **Vercel Dashboard** → your project (create it in step 2 if needed).
2. Go to **Storage**.
3. Click **Create Database** or **Create Store** → choose **Blob**.
4. Create the Blob store and link it to this project.
5. Open the store → **Settings** or **.env** and copy **BLOB_READ_WRITE_TOKEN**.

---

## 5. Vercel: Environment variables

1. In **Vercel Dashboard** → your project → **Settings** → **Environment Variables**.
2. Add these for **Production** (and optionally **Preview**):

   | Name | Where to get it |
   |------|------------------|
   | `DATABASE_URL` | Neon project → connection string (with `?sslmode=require`) |
   | `NEON_AUTH_BASE_URL` | Neon Console → Auth / Integrations → Auth URL |
   | `NEON_AUTH_COOKIE_SECRET` | You generated it in step 3 (min 32 chars) |
   | `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → Blob store |
   | `PAYLOAD_SECRET` | Any long random string (for Payload CMS at `/admin`) |

3. Optional (add when you use them):

   - `OPENROUTER_API_KEY` — for AI features  
   - `BREVO_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `CONTACT_FROM_NAME` — for contact form  
   - `NEXT_PUBLIC_APP_URL` — e.g. `https://your-app.vercel.app` (for OAuth/callbacks if needed)

4. Save. Redeploy so the new vars are applied (Deployments → … → Redeploy).

---

## 6. Link Neon to Vercel (recommended)

1. In **Vercel** → your project → **Storage** (or **Integrations**).
2. If Neon isn’t linked yet: **Connect** or **Link** a database → **Neon**.
3. Authorize and select the same Neon project you use for `DATABASE_URL`.
4. Vercel can inject `DATABASE_URL` for you; if you already set it manually, you’re fine.

---

## 7. Deploy

1. In Vercel, go to **Deployments**.
2. If you haven’t deployed yet, trigger a deploy (e.g. **Deploy** from the import screen).
3. If you added env vars after the first deploy, use **Redeploy** on the latest deployment.
4. Wait for the build. Open the **Visit** URL (e.g. `https://b2b-blueprint-xxx.vercel.app`).

---

## 8. After first deploy (optional)

- **Database schema:** If you use Drizzle and custom tables, run migrations against your Neon DB (from your machine or CI):  
  `npx drizzle-kit generate` then `npx drizzle-kit migrate` (or run the SQL in Neon SQL Editor). See `docs/SCHEMA_SETUP.md`.
- **Payload admin:** Visit `https://your-app.vercel.app/admin` and create the first user (requires `DATABASE_URL` and `PAYLOAD_SECRET`).
- **Contact form:** Configure Brevo and the env vars above; see `docs/CONTACT_FORM_SETUP.md`.

---

## Checklist

- [ ] Repo pushed to GitHub  
- [ ] Vercel project created and imported (root = repo root)  
- [ ] Neon project created; connection string copied  
- [ ] Neon Auth enabled; `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` set  
- [ ] Vercel Blob store created; `BLOB_READ_WRITE_TOKEN` set in Vercel  
- [ ] Env vars added in Vercel (at least `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `PAYLOAD_SECRET`)  
- [ ] Deploy (or redeploy) successful  
- [ ] Site loads; login works if Neon Auth is configured  

For more detail on each service, see the **/setup** page in the app and `docs/DATABASE_OPTIONS.md`.

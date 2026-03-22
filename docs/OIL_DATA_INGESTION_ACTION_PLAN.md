# Action plan: Get oil data from external providers

**Goal:** Pull data from public/commercial providers into Neon (`dim_*`, `fact_*`, `src_scraper_logs`) on a schedule and verify it in the DB.

**How this repo does it today:**  
**Payload** stores **API sources** (adapter key + JSON config). **`lib/external-apis`** runs an adapter, which fetches from the provider and writes rows. **Cron** calls **`POST /api/cron/sync-external`** to run one or all enabled sources.

---

## Phase 0 — Prerequisites (one-time)

1. **Neon**
   - Project created; **`DATABASE_URL`** in `.env.local` (and Vercel) with `sslmode=verify-full` where possible.
   - Oil tables applied: run migrations per **`drizzle/README.md`** (includes `fact_prices`, `src_scraper_logs`, etc.).

2. **App env (minimum for ingestion)**
   - **`DATABASE_URL`**
   - **`PAYLOAD_SECRET`**, **`CRON_SECRET`** (generate a long random string for cron auth).
   - Optional but typical: **`BLOB_*`**, Neon Auth vars if you use login.

3. **Payload & admin**
   - App boots; **`/admin`** loads (Payload).
   - Collections **`api-sources`** and **`external-api-runs`** exist (seed/migrate if your project uses Payload migrations — see Payload docs in repo).

4. **Know your adapters**
   - **`yahoo-prices`** — writes **spot / latest close** into **`fact_prices`** and logs to **`src_scraper_logs`**.
   - **`eia-petroleum`** — EIA v2 **spot prices** (`petroleum/pri/spt`) → **`fact_prices`** + **`src_scraper_logs`**; needs **`EIA_API_KEY`**.
   - **`generic`** — HTTP GET/POST for testing; **does not** map oil fields into `fact_*` by itself.

### Seed default sources (Phase 1 shortcut)

With **`npm run dev`** running:

```bash
npm run seed:oil-sources
```

Or: `POST /api/seed-oil-api-sources?key=<INTERNAL_SERVICE_KEY>`  
Creates **`WTI spot (Yahoo)`** (enabled) and **`WTI spot (EIA)`** (disabled until **`EIA_API_KEY`** is set). Then open Payload → **API sources** to confirm.

---

## Phase 1 — Prices from Yahoo Finance (recommended first win)

This uses the **`yahoo-prices`** adapter (`lib/external-apis/adapters/yahoo-prices.ts`).

### Step 1 — Create an API source in Payload (or use seed above)

1. Open **`/admin`** → **API sources** (or equivalent collection for `api-sources`).
2. **New** document:
   - **Name:** e.g. `WTI spot (Yahoo)`.
   - **Adapter:** `yahoo-prices`.
   - **Enabled:** on.
   - **Config (JSON),** example:

```json
{
  "markets": [
    {
      "oilTypeCode": "WTI",
      "oilTypeName": "WTI",
      "yahooSymbol": "CL=F",
      "marketLocation": "WTI"
    }
  ],
  "lookbackDays": 16
}
```

   - Optional: add Brent with `"yahooSymbol": "BZ=F"`, `"oilTypeCode": "BRENT"`, etc.

3. **Save.** Note the **numeric source `id`** from the URL or list (needed for cron query).

### Step 2 — Run manually (local or production)

- **Admin UI:** External APIs / “Run” for that source, **or**
- **API (session or Payload admin cookie):**  
  `POST /api/admin/external-apis/sources/<id>/run`  
  See **`lib/external-apis/README.md`**.

### Step 3 — Automate with cron

1. Set **`CRON_SECRET`** in Vercel (same value you’ll put in the cron job).
2. On [cron-job.org](https://console.cron-job.org/) (or Vercel Cron), create a job:
   - **URL:**  
     `https://<your-domain>/api/cron/sync-external?sourceId=<PAYLOAD_SOURCE_ID>`
   - **Method:** `POST`
   - **Header:**  
     `Authorization: Bearer <CRON_SECRET>`  
     **or** `X-Cron-Secret: <CRON_SECRET>`
3. Schedule (e.g. daily after US market close).

### Step 4 — Verify data

| Check | How |
|--------|-----|
| **Admin UI** | **`/admin/external-apis`** — **Oil repository (Neon)** shows counts + latest **`src_scraper_logs`**. |
| SQL | `SELECT * FROM src_scraper_logs ORDER BY run_time DESC LIMIT 10;` |
| Prices | `SELECT * FROM fact_prices ORDER BY price_date DESC LIMIT 20;` |
| API | **`GET /api/admin/ingestion-status`** (logged-in / Payload admin) — JSON counts + logs. |
| Docs | **`docs/src_scraper_logs.md`**, **`npm run db:studio`** |

If **`status = error`**, see **`src_scraper_logs.error_message`** and **`docs/src_scraper_logs.md`**.

---

## Phase 2 — EIA spot prices (implemented)

Adapter: **`eia-petroleum`** (`lib/external-apis/adapters/eia-petroleum.ts`).

1. Register at [EIA Open Data](https://www.eia.gov/opendata/) and set **`EIA_API_KEY`** in `.env.local` / Vercel.
2. In Payload → **API sources**, enable **`WTI spot (EIA)`** (from seed) or create one with adapter **`eia-petroleum`** and config, e.g.:

```json
{
  "marketLocation": "WTI EIA",
  "oilTypeCode": "WTI",
  "series": "RWTC",
  "frequency": "daily"
}
```

3. **Run now** or cron. Default **`series`** **`RWTC`** = WTI Cushing spot; adjust using the [EIA browser](https://www.eia.gov/opendata/browser/petroleum/pri/spt).

**Still to add (future):** OilPriceAPI, Alpha Vantage, JODI CSVs — same adapter pattern.

---

## Phase 3 — Product visibility (implemented in admin)

- **`/admin/external-apis`** — **Oil repository (Neon)** section: **`fact_prices` / `fact_shipments` / `fact_production`** counts and last **15** **`src_scraper_logs`** rows.
- **`GET /api/admin/ingestion-status`** — same data for programmatic use.

**Optional later:** charts on **`/dashboard`** reading **`fact_prices`**.

---

## Quick reference

| Item | Location |
|------|----------|
| Cron contract | `app/api/cron/sync-external/route.ts` — needs **`CRON_SECRET`**. |
| Seed sources | `npm run seed:oil-sources` · `app/api/seed-oil-api-sources/route.ts` |
| Yahoo adapter | `lib/external-apis/adapters/yahoo-prices.ts` |
| EIA adapter | `lib/external-apis/adapters/eia-petroleum.ts` |
| `dim_oil_types` helper | `lib/external-apis/oil-dim.ts` |
| Run orchestration | `lib/external-apis/run.ts` |
| Admin trigger | `POST .../api/admin/external-apis/sources/[id]/run` |
| Ingestion metrics API | `GET /api/admin/ingestion-status` |
| Scraper log semantics | `docs/src_scraper_logs.md` |
| Broader product roadmap | `docs/OILPLOT_ACTION_PLAN.md` |

---

## Success criteria (minimal)

- [ ] **`src_scraper_logs`** shows recent **`yahoo-prices`** (and optionally **`eia-petroleum`**) with **`success`** when providers respond.
- [ ] **`fact_prices`** has rows after successful runs.
- [ ] **`/admin/external-apis`** shows non-zero counts / log rows when data exists.
- [ ] Cron returns **`200`** / **`ok: true`** from **`/api/cron/sync-external`** on Vercel.

---

## Not in scope yet

- EIA **beyond** spot `pri/spt` (e.g. full **`fact_shipments`** from customs) — new adapters as needed.
- Pushing arbitrary CSV without an adapter — add **`ingest-csv`** or admin upload later.

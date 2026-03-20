# OILplot Action Plan: From Construction App to Oil Data App

**Source:** OIL Data Initial Instructions (Master Blueprint, Visual Pipeline Engine, Oil Data Ingestion via API).  
**Current codebase:** B2B Blueprint / Construction Management app (projects, PDF digest, AI analysis, chat, reports).  
**Target:** Oilplot.com – Open Energy Repository (oil & distillery data, AI insights, visualizations).

---

## 1. Brand & positioning

- Replace construction/B2B branding with Oilplot / Open Energy Repository.
- Update marketing copy (about, pricing, contact) to oil data democratization and “transparent alternative to enterprise terminals.”
- Keep: Next.js, Vercel, Neon, Tailwind. Add/align: ECharts, Mapbox GL; AI via Vercel AI SDK (Gemini 2.5 Flash / GPT-4o).

---

## 2. Database schema (Neon)

- **Introduce oil-domain schema** (alongside or phased vs construction):
  - **src_***: Raw staging / API logs (e.g. `src_scraper_logs` with `run_time`, status).
  - **dim_***: Lookups – countries, oil types (`dim_oil_types`), refineries (`dim_refineries`).
  - **fact_***: Time-series – `fact_prices`, `fact_shipments`, `fact_production`, `fact_visual_stories` (JSON config for ECharts).
- Decide: separate schema (e.g. `oil`) or same DB with clear naming; keep Neon Auth + existing auth tables.
- Add Drizzle definitions and migrations for all new tables; preserve or phase out construction tables per product decision.

---

## 3. Cron security for ingestion

- Ensure **CRON_SECRET** in env; add or extend **middleware** so any route under `/api/ingest/*` requires `Authorization: Bearer <CRON_SECRET>` and returns 401 otherwise.
- Align with “Oil Data Ingestion via API” doc (middleware check on `request.nextUrl.pathname.startsWith('/api/ingest')`).

---

## 4. API ingestion (Phase 1)

- **`/api/ingest/eia`** (GET): Call EIA API v2 (env: `EIA_API_KEY`); map to `fact_shipments` (and any staging); log to `src_scraper_logs`.
- **`/api/ingest/prices`** (or `/api/ingest/oilprice`): Yahoo Finance (e.g. yahoo-finance2) and/or OilPriceAPI.com free tier → `fact_prices`; same logging.
- **`/api/ingest/oilprice`** (if separate): OilPriceAPI integration → `fact_prices`.
- All ingest routes: validate CRON_SECRET (via middleware); use serverless-friendly DB driver (e.g. `@neondatabase/serverless` or existing Drizzle/Neon setup).

---

## 5. Cron-job.org setup

- Create cron jobs pointing at `https://<your-app>.vercel.app/api/ingest/eia` and `/api/ingest/prices` (and oilprice if used).
- Method GET; schedule (e.g. every 6 hours); Advanced → Header `Authorization: Bearer <CRON_SECRET>`.

---

## 6. Admin verification UI

- **Ingestion status dashboard** (e.g. under existing `/admin` or new `/admin/ingestion`): Last sync from `src_scraper_logs` (e.g. `MAX(run_time)`), total row counts for `fact_shipments` / `fact_prices`, and a small “latest 5 rows” preview for `fact_shipments` (and optionally `fact_prices`) to verify mapping.
- Reuse current Payload admin layout or add a simple Next.js page that queries Neon.

---

## 7. Public/dashboard UI – Phase 2 visuals

- **Refinery Explorer:** Mapbox GL map of refinery locations; click → side panel with “mini-Sankey” (inputs: crude types; outputs: gasoline, diesel, jet fuel). Data: `dim_refineries`, `fact_production`.
- **Global Reserves Map:** 3D choropleth or bubble map of proved oil reserves by country.
- **Spot Price Terminal:** Interactive line charts (ECharts) for WTI, Brent, regional blends; time ranges (1D to 30Y). Data: `fact_prices`.
- **Oil Type Breakdown:** Treemaps (ECharts) by density (Light/Heavy) and sulfur (Sweet/Sour). Data: `dim_oil_types` + production/prices.

---

## 8. Visual Story Engine (Oilplot Visual Pipeline)

- **Logic (Analyst):** Gemini 2.5 Flash agent that queries Neon, detects trends, and outputs a “narrative” + chart spec (strict JSON).
- **Config (Architect):** Map narrative + data into valid **Apache ECharts** `option` object (single JSON).
- **Presentation (Canvas):** Next.js “Smart Component” (e.g. `VisualStoryCard`): title, summary, `<ReactECharts option={story.chartOptions} />`; optional Framer Motion for scroll/transition.
- **Storage:** Persist generated story JSON in `fact_visual_stories` for instant load.
- **Daily job:** Cron-triggered API route that pulls latest data → sends to Gemini → saves story JSON to Neon (and optionally serves to UI).
- **Insight archetypes** (from doc): The Flow (Sankey), The Gap (area/range), The Pulse (candlestick/line), The Mix (radar), The Cluster (geospatial scatter), The Race (bar chart race).

---

## 9. AI chat – “The Oil Analyst” (Phase 3)

- **Feature:** Chat sidebar / page “The Oil Analyst” for natural-language queries over the oil repository.
- **Flow:** User question → AI generates **read-only SQL** for Neon → execute query → AI summarizes results from returned rows.
- Reuse or adapt existing chat infra (threads, messages, context) but with oil-specific system prompt and schema context (dim_*, fact_*); ensure SQL is read-only and scoped to oil tables.

---

## 10. Phase 4 – Extended scrapers (later)

- JODI Oil CSVs (global production), Argus Media RSS (maintenance/outages), vessel tracking (AIS) → map into `src_*` / `fact_*` and log in `src_scraper_logs`; add ingest routes and cron jobs as needed.

---

## 11. Success checks (from Master Blueprint)

- [ ] **API health:** `fact_prices` (and optionally `fact_shipments`) update on schedule via cron-job.org.
- [ ] **Visual accuracy:** Refinery map places assets and aligns with IEA/EIA capacity data.
- [ ] **User value:** User can identify primary refineries processing Venezuelan Heavy within a few clicks.

---

## 12. What to remove or phase out (construction app)

- **Optional (product decision):** Remove or hide construction-specific flows: project creation (sites, floorplans), PDF digest, construction AI analysis, defect reports, quantity takeoff, construction report generation.
- **Keep during transition:** Auth (Neon Auth), org/members, billing (Stripe), Payload admin shell; then repurpose dashboard routes for Oilplot (Refinery Explorer, Prices, Reserves, Oil Analyst, Visual Stories).
- **Docs:** “OIL Data Types and Sources.xlsx” and “Top_10_Oil_Data Sources.xlsx” are referenced in the folder; use for exact source list and field mapping when implementing ingest and dim/fact tables.

---

## Suggested implementation order

1. Schema + migrations (oil src/dim/fact).  
2. CRON_SECRET middleware + env.  
3. Ingest routes (eia, prices) + logging.  
4. Cron-job.org + Admin verification UI.  
5. Brand/copy + one flagship visual (e.g. Spot Price Terminal or Refinery Explorer).  
6. Visual Story Engine (Analyst → Architect → Canvas + fact_visual_stories + cron).  
7. Oil Analyst chat (read-only SQL + summary).  
8. Remaining maps and treemaps; then Phase 4 scrapers.

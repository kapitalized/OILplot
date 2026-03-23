# EIA and Yahoo data fields (reference)

This document lists **data fields** relevant to the **Yahoo Finance** and **EIA Open Data** integrations in OILplot, and explains two different meanings of “available.”

---

## What we mean by “available”

| Term | Meaning |
|------|--------|
| **In the app (this repo)** | Fields that the current adapters **read** and either **persist** to Neon (`fact_prices`, `dim_oil_types`, `src_scraper_logs`) or **embed in run logs**. Anything not listed here is **not** extracted or stored by the shipped code. |
| **From the provider (API / library)** | Fields that **Yahoo** (via `yahoo-finance2`) or **EIA** (HTTP JSON) **can return** for a typical request. You could add new adapters or extend existing ones to use more of these—**they are not automatically in the database** unless implemented. |

**Summary:** “From the provider” = what the outside world can give you. “In the app” = what we actually map into our schema today.

---

## Yahoo Finance (`yahoo-prices` adapter)

**Library:** `yahoo-finance2` — we call **`quote(symbol)`** for each configured market (e.g. `CL=F`, `BZ=F`).

### In the app (persisted / used)

| Field (concept) | Source in response | Where it goes |
|-----------------|-------------------|---------------|
| Latest trade / last price | `regularMarketPrice` | `fact_prices.price_usd_per_bbl` |
| As-of date for that price | `regularMarketTime` (else “today”) | `fact_prices.price_date` |
| Oil type identity | From Payload config: `oilTypeCode`, optional `oilTypeName` | `dim_oil_types` via `getOrCreateOilTypeId` |
| Market label | From Payload config: `marketLocation` | `fact_prices.market_location` |
| Run metadata | Derived: symbols, lookback window, extracted rows | `src_scraper_logs.raw_response_json` (summary JSON) |

We do **not** currently write full raw Yahoo quote objects to a dedicated column; the log stores a **small structured summary** (see `lib/external-apis/adapters/yahoo-prices.ts`).

### From the provider (typical `quote` payload — not all stored)

Yahoo quote responses often include many more properties (names vary slightly by symbol). Examples you may see in API responses but **are not used by our adapter today**:

- `regularMarketOpen`, `regularMarketDayHigh`, `regularMarketDayLow`
- `regularMarketPreviousClose`, `regularMarketChange`, `regularMarketChangePercent`
- `regularMarketVolume`, `averageDailyVolume3Month`
- `marketState`, `exchange`, `currency`, `shortName`, `longName`
- `bid`, `ask`, `fiftyTwoWeekHigh`, `fiftyTwoWeekLow`, …

The adapter could be extended to map any of these into new DB columns or JSON blobs; **none of the above are persisted** except what is in the table above.

**Note:** Config includes `lookbackDays` and the code computes `period1` / `period2`, but the implementation uses **`quote()`** (latest), not a full **historical** series fetch, for the stored price.

---

## EIA Open Data (`eia-petroleum` adapter)

**HTTP:** `GET https://api.eia.gov/v2/petroleum/pri/spt/data/` with `api_key` from **`EIA_API_KEY`**.

### In the app (persisted / used)

| Field (concept) | Source in response | Where it goes |
|-----------------|-------------------|---------------|
| Spot price (USD per barrel, as returned) | `value` on the chosen row | `fact_prices.price_usd_per_bbl` |
| Observation date | `period` (parsed to `YYYY-MM-DD`) | `fact_prices.price_date` |
| Oil type identity | From Payload config: `oilTypeCode`, optional `oilTypeName` | `dim_oil_types` |
| Market label | From Payload config: `marketLocation` | `fact_prices.market_location` |
| Run metadata | `extracted` summary (series/product/duoarea, etc.) | `src_scraper_logs.raw_response_json` |

The adapter requests up to **10** rows (`length=10`, sort by `period` desc) but **inserts only the first row** that has a valid `period` + `value`. It does **not** bulk-insert the full history in one run.

### Request / config (not “fields from EIA,” but selects which series you get)

| Config key | Role |
|------------|------|
| `series` | EIA facet `facets[series][]` (default **`RWTC`** = WTI Cushing spot if no product/duoarea path) |
| `product` + `duoarea` | Alternative to `series` for other spot definitions |
| `frequency` | `daily` or `weekly` |
| `marketLocation`, `oilTypeCode`, `oilTypeName` | App labels / `dim_oil_types`; not EIA column names |

### From the provider (EIA v2 JSON — not all stored)

For `.../petroleum/pri/spt/data/`, each **data row** can include facets and fields such as `period`, `value`, and series-specific dimensions (exact keys depend on the dataset). Our code only **requires** usable **`period`** + **`value`** for one row.

**Broader EIA catalog:** EIA exposes many other routes (stocks, imports, refinery, other petroleum series, electricity, natural gas, etc.). **This repo only calls the petroleum spot price route above.** Nothing from other EIA routes is ingested unless you add new adapters.

---

## Quick comparison

| | **In the app** | **From the provider (broader)** |
|---|----------------|----------------------------------|
| **Yahoo** | Latest **price** + **date** per symbol; config-driven labels; log summary | Full **quote** object with OHLC, volume, name, etc.; optional **historical** APIs |
| **EIA** | One **spot** observation (`value` + `period`) per run from **`pri/spt`**; config selects series | Same response can have more rows; entire EIA API has many unrelated datasets |

---

## Code references

| Piece | Location |
|-------|----------|
| Yahoo adapter | `lib/external-apis/adapters/yahoo-prices.ts` |
| EIA adapter | `lib/external-apis/adapters/eia-petroleum.ts` |
| Price table | `fact_prices` in `lib/db/schema.ts` |
| Ingestion overview | `docs/OIL_DATA_INGESTION_ACTION_PLAN.md` |

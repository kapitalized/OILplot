# `src_scraper_logs` — ingestion / scraper run audit

Append-only style log of **external API and scraper runs** that write into `fact_*` / staging tables. Use it to debug failed syncs, see **when** a source last succeeded, and inspect **what** was returned (without storing full raw HTTP bodies for every run).

---

## Columns

| Column | Type | Description |
|--------|------|-------------|
| `log_id` | `serial` | Primary key; increments per insert. |
| `scraper_name` | `text` | Stable id for the job, e.g. `yahoo-prices`. Matches adapter `key` in `lib/external-apis/adapters/`. |
| `run_time` | `timestamp` | When the row was inserted (defaults to server time). |
| `rows_inserted` | `integer` | How many rows the run wrote to target fact/staging tables (meaning depends on the adapter). |
| `status` | `text` | Coarse outcome: typically `success` or `error`. |
| `error_message` | `text` | Human-readable error when `status = error`, or `null` on success. |
| `raw_response_json` | `jsonb` | Adapter-specific context: config snapshot, periods, symbols, and often an `extracted` array of rows written. |

Schema: `lib/db/schema.ts` (`src_scraper_logs`), migration: `drizzle/0017_oil_only_schema.sql`.

---

## `status` values

| Value | Meaning |
|-------|--------|
| `success` | Run completed and at least one row was inserted (`rows_inserted > 0`), per current adapter logic. |
| `error` | Run failed entirely **or** completed with **zero** rows inserted (e.g. no price returned). Check `error_message` and `raw_response_json`. |

---

## Adapter: `yahoo-prices`

- **Code:** `lib/external-apis/adapters/yahoo-prices.ts`
- **Typical `raw_response_json`:** `markets` (symbols, oil type codes), `period1` / `period2` (lookback window), and on success `extracted` — array of `{ close, price_date, oilTypeCode, yahooSymbol, marketLocation }`.

**Common errors**

- *“No daily close found for given markets.”* — `quote()` did not yield a usable price for the symbol(s); often transient or bad Yahoo response.
- *“Historical returned a result with SOME (but not all) null values…”* — comes from **yahoo-finance2** when Yahoo returns incomplete data; a later rerun often succeeds. The adapter prefers `quote()` for the latest close to reduce flakiness vs `historical()`.

---

## Example queries (Neon SQL Editor)

```sql
-- Latest runs
SELECT log_id, scraper_name, run_time, rows_inserted, status, left(error_message, 80) AS err
FROM src_scraper_logs
ORDER BY run_time DESC
LIMIT 20;

-- Failures only
SELECT *
FROM src_scraper_logs
WHERE status = 'error'
ORDER BY run_time DESC
LIMIT 50;
```

---

## Sample export in this repo

**`docs/src_scraper_logs.json`** is a **frozen example export** for documentation (not updated by the app). Live data is always in **Neon** — query the table or use Drizzle Studio (`npm run db:studio`, see `drizzle/README.md`).

---

## Related

- Oil pipeline / dashboard ideas: `docs/OILPLOT_ACTION_PLAN.md`
- Table list: `docs/NeonDB_Tables.md`
- Neon connection: `docs/NEON_SETUP.md`

# Drizzle SQL migrations (`drizzle/`)

This folder holds **versioned SQL migrations** for Postgres (Neon). Drizzle Kit applies them in order using `drizzle/meta/_journal.json`.

## Apply migrations

```bash
# Ensure DATABASE_URL points at your Neon DB
npx drizzle-kit migrate
```

## Layout

| Path | Purpose |
|------|--------|
| `0000_*.sql` … `0018_*.sql` | One file per journal entry; **filename prefix must match** the `tag` in `_journal.json` (without `.sql`). |
| `meta/_journal.json` | Ordered list of migrations Drizzle runs. **Do not** duplicate numeric prefixes (e.g. two `0011_*` files). |
| `meta/*_snapshot.json` | Historical snapshots from `drizzle-kit generate` / introspect; not updated on every manual SQL edit. |

## Oil schema (optional script)

If you applied oil tables outside `drizzle-kit migrate`, see `scripts/apply_oil_schema_direct.js` and `docs/NeonDB_Tables.md` (`0017_oil_only_schema.sql`).

## Adding a new migration

1. Create `NNNN_short_description.sql` (next index after the last in `_journal.json`).
2. Append a matching entry to `meta/_journal.json` with the same `tag` as the filename without `.sql`.
3. Prefer idempotent patterns where helpful: `IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`, etc.

## Troubleshooting

### Build fails with missing Turbopack SSR runtime

**Symptom**
- `Cannot find module '../chunks/ssr/[turbopack]_runtime.js'` (or similar) during `next build`.

**Fix**
1. Ensure you’re using the repo scripts (they clear `.next` before build):

```bash
npm run build
```

2. If needed:

```bash
npm run clean
npm run build
```

---

### External APIs admin page: “failed to load runs”

**Symptom**
- `/admin/external-apis` shows “Failed to load runs”
- Dev log shows `GET /api/admin/external-apis/runs?... 500`

**Cause**
- DB schema mismatch for the Payload collection `external-api-runs` relationship field `source`.
- Payload expects a column named `source_id` (because the field is named `source`).

**Fix**
1. Run the standalone migration:

```bash
npm run migrate:external-apis
```

2. Reload `/admin/external-apis`

---

### Payload Admin routes return 401 unexpectedly

**Symptom**
- `/api/admin/*` returns 401 even though you’re logged into `/admin`.

**Notes**
- These routes allow either:
  - app dashboard session (`getSessionForApi()`), or
  - Payload admin cookie session (`isPayloadAdmin(request)`).

**Fix checklist**
1. Confirm `/api/users/me` and/or `/admin/api/users/me` returns a user when called from the browser (Payload session cookie present).
2. Confirm the returned JSON has a role; `isPayloadAdmin` checks for `role === 'admin'`.

---

### Payload/DB schema changes don’t show up

**Symptom**
- You changed `collections/*` or `globals/*`, but the DB tables/columns aren’t updated.

**Fix**
- For External APIs module tables: run `npm run migrate:external-apis`
- For Drizzle app tables: run `npx drizzle-kit generate` then `npx drizzle-kit migrate` (see `docs/SCHEMA_SETUP.md`)

---

### Import map / admin component module-not-found

**Symptom**
- Payload admin build fails with a missing component under `app/(payload)/admin/_components/...`.

**Fix**
1. Run:

```bash
npm run fix:importmap
```

2. Use the normal scripts (`npm run dev`, `npm run build`) which run the import map fix automatically.


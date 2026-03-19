## Development workflow

### Local dev

1. Install deps

```bash
npm install --legacy-peer-deps
```

2. Add `.env.local` (see `docs/ENV_VARS.md` for the full list)

3. Run the app

```bash
npm run dev
```

- If port 3000 is busy, Next will pick the next port (e.g. 3002).
- Payload Admin is at `/admin` (same port).

### “Fresh” dev (when `.next` gets weird)

Use this if you see stale Turbopack/SSR artifacts or strange runtime module-not-found errors.

```bash
npm run dev:fresh
```

### Build

```bash
npm run build
```

Notes:
- The build script clears `.next` before building to avoid Turbopack/Webpack artifact mismatches.
- `scripts/fix-importmap.mjs` runs automatically before dev/build.

### External APIs DB migration (Payload collections)

This repo includes a standalone migration to create the Payload-backed tables for the External APIs module.

```bash
npm run migrate:external-apis
```

### Payload admin quick setup

1. Start dev server
2. Open `/admin`
3. Create the first admin user
4. Optional: seed marketing pages

```bash
npm run seed:payload
```

More: `docs/PAYLOAD_ADMIN.md`

### Tests

```bash
npm run test
```

### Useful health endpoints

- `GET /api/health` (always 200)
- `GET /api/ready` (200 only if DB reachable; good for deployments)


## AI pipeline + data model (practical)

This doc describes the **current** AI-related flows: Documents → Analyse (reports) → Chat, and where data is fetched/persisted.

---

### 1) Documents → run analysis

**UI**
- Global: `app/(dashboard)/dashboard/ai/documents/*`
- Project: `app/(dashboard)/project/[shortId]/[slug]/documents/*`

**API**
- `POST /api/ai/run`
  - Triggered from the Documents UI (“Run analysis”).
  - Uses the AI pipeline/orchestrator in `lib/ai/*`.

**Persistence (where results end up)**
- Reports list/view endpoints read from DB via:
  - `GET /api/projects/[projectId]/reports`
  - `GET /api/reports/[reportId]`

---

### 2) Analyse (report list + viewer)

**UI**
- Global: `app/(dashboard)/dashboard/ai/analyse/*`
- Project: `/project/[shortId]/[slug]/analyse` (+ optional `/analyse/[reportShortId]`)

**APIs**
- `GET /api/projects/[projectId]/reports` (left list)
- `GET /api/reports/[reportId]` (viewer)

**What a “report” is**
- A persisted analysis output + rendered markdown/content for users.
- Report titles/types drive the UI list, and the viewer renders the content.

---

### 3) Chat (project chat with references)

**UI**
- Project chat: `app/(dashboard)/project/[shortId]/[slug]/chat/page.tsx`
  - Lets users reference:
    - **Documents** (project files)
    - **Reports** (recent analysis outputs)

**APIs**
- `GET /api/projects/[projectId]/chat-context`
  - Returns files + recent reports used by the chat sidebar.
- `POST /api/chat/threads/[threadId]/messages`
  - Accepts optional `fileIds: string[]` and `reportIds: string[]`
  - When provided, only those documents/reports are used to build context.

---

### 4) AI logging / audit / usage

There are docs that describe token/cost logging and admin views:
- `docs/AI_TOKEN_USAGE.md`
- `docs/RUN_LOGS_AND_AUDIT.md`

If you want a single “source of truth” for all logging tables and event types, create: `docs/OBSERVABILITY.md` (see `docs/TROUBLESHOOTING.md` for common failure modes).


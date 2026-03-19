# Improving AI output and analysis quality

This doc explains how to see what happens at each step of the AI pipeline and how to improve the quality of reports and chat.

## 1. See what happens at each step

### Pipeline steps (Reports)

When you run **Run analysis** on a document, the app runs a 3-step pipeline:

1. **EXTRACTION** – The model looks at the image/PDF or text and extracts structured items (e.g. rooms, areas). Output is JSON with `id`, `label`, `confidence_score`, optional `area_m2`.
2. **ANALYSIS** – The model (or the Python engine, if used) turns extracted items into quantities with units, using any library constants. Output is a JSON array of `id`, `label`, `value`, `unit`, `citation_id`.
3. **SYNTHESIS** – The model turns the analysis into a short Markdown report (summary, table, critical warnings).

**Where to see it**

- Open any **report** (Project → Reports → click a report).
- Expand **“Pipeline steps (what happened at each AI step)”**.
- For each step you’ll see:
  - **Step name** (EXTRACTION, ANALYSIS, SYNTHESIS)
  - **Model** used
  - **Tokens** (prompt in / completion out) and cost
  - **Prompt (preview)** – first ~300 chars of what was sent
  - **Response (preview)** – first ~600 chars of what the model returned
  - **Error** (if that step failed)

Use this to see where quality drops (e.g. extraction missed items, synthesis wrote a bad table) and to debug failures.

### Run log and admin

- **Report viewer** – “Run log” shows run time, duration, input size, pages, total tokens and cost.
- **Admin → Run logs** (`/dashboard/admin/run-logs`) – List of all runs with project, user, date, duration, tokens, cost, models used. Use this to spot heavy or failed runs.

### Chat

- **Project → Chat** – The “Reference used in this chat” block lists the project context, files, and last 10 reports that are sent to the model. If the model gives a wrong answer, check that the right docs/reports are there and that the reference isn’t truncated (we cap total reference length).

---

## 2. How to improve quality

### A. Change the prompts (per step)

System prompts define each step’s role and output format. They live in **`lib/ai/base-prompts.ts`**:

- **EXTRACTION** – Tells the model how to read floorplans/documents and output JSON (e.g. “identify rooms, zones, estimate areas in m²”).
- **ANALYSIS** – Tells the model how to apply constants and output quantity items.
- **SYNTHESIS** – Tells the model how to write the Markdown report.

**What to do**

- Edit the strings in `SYSTEM_PROMPTS` for the step you want to improve.
- Add more specific instructions (e.g. “Always include a scale or legend if present”, “Output areas in m² to 2 decimal places”).
- If the model often returns non-JSON, reinforce: “Output only valid JSON, no markdown code fences or extra text.”

User prompts are built in **`lib/ai/orchestrator.ts`** (e.g. “Extract from the following source…”, “Given extraction: apply constants…”). You can tune those or add **template overrides** (see `lib/ai/templates.ts` and `getPromptOverrides`) for different project types.

### B. Change the models (per step)

Different models are better at vision, reasoning, or writing. Use **Admin → AI models** (`/dashboard/admin/ai-models`):

- **Extraction** – Use a vision-capable model (e.g. GPT-4o, Claude with vision) for floorplans.
- **Analysis** – Use a model good at structured output and numbers.
- **Synthesis** – Use a model good at clear, short reports.
- **Chat** – Use a model that follows “answer only from reference” well.

Change models, run a new analysis, then check **Pipeline steps** on the new report to see if quality improved.

### C. Add examples (few-shot)

If the model often misformats output, add one or two examples in the system or user prompt in `base-prompts.ts` or in the orchestrator. For example, in EXTRACTION you could add: “Example output: {\"items\": [{\"id\": \"1\", \"label\": \"Living room\", \"confidence_score\": 0.9, \"area_m2\": 25.5}]}.”

### D. Validate and fix output (post-processing)

The pipeline already parses JSON from the model (see `parseExtraction`, `parseAnalysisItems` in `lib/ai/orchestrator.ts`). You can:

- Add checks (e.g. require `area_m2 >= 0`, clamp confidence to 0–1).
- Replace or merge items if the model duplicates or mislabels.
- If parsing fails, the code falls back to stub data; you can log the raw response there and then tighten the prompt or add retries.

### E. Library context and benchmarks

- **Library context** (constants like density, thickness) is passed into the ANALYSIS step. Ensure the right constants are sent from the run API so the model has correct numbers.
- **Citation audit** (in `lib/ai/citation-audit.ts`) compares analysis to benchmarks and adds critical warnings. Configure benchmarks so deviations are flagged and show up in the synthesis.

### F. Chat quality

- Make sure **project description and objectives** (or status) are set so the model has context.
- **Reference length** is capped (~14k chars); if you have many long reports, the last 10 may be truncated. Reduce report size or summarize in synthesis so the most important info stays in the cap.
- If the model “hallucinates”, the system prompt already says “Answer using only the following reference… If something is not in the reference, say so.” You can strengthen that in the chat route’s system message in `app/api/chat/threads/[threadId]/messages/route.ts`.

---

## 3. Quick checklist

| Goal | Where to look / what to do |
|------|----------------------------|
| See why a report is wrong | Report → “Pipeline steps” → check which step’s prompt/response looks off |
| Improve extraction from drawings | `lib/ai/base-prompts.ts` EXTRACTION; use a vision model in Admin → AI models |
| Improve quantity numbers | ANALYSIS prompt and model; library context; optional Python engine |
| Improve report wording | `lib/ai/base-prompts.ts` SYNTHESIS; synthesis model |
| Reduce cost | Admin → AI models: use smaller/cheaper models per step; Admin → Run logs to find heavy runs |
| Debug a failed run | Report → Pipeline steps (see error per step); server logs for “[Chat] OpenRouter error” or API errors |

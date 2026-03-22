/**
 * Shared Payload DB repairs (partial migrations). Used by API route and CLI.
 */
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

/** Best-effort: keep `payload_migrations` aligned so `payload migrate` does not re-apply. */
async function tryRecordPayloadMigration(
  name:
    | '20260311_090655_add_users_role'
    | '20260315_add_pages_meta_keywords'
    | '20260317_add_api_sources_and_runs'
) {
  try {
    await db.execute(sql.raw(`
INSERT INTO "payload_migrations" ("name", "batch", "updated_at", "created_at")
SELECT '${name}',
       COALESCE((SELECT MAX("batch") FROM "payload_migrations"), 0) + 1,
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM "payload_migrations" WHERE "name" = '${name}');
`));
  } catch {
    /* table missing or duplicate */
  }
}

/** Idempotent SQL for partial Payload DBs. Safe to call multiple times. */
export async function runRepairPayloadSchema(): Promise<void> {
  await db.execute(sql.raw(`
DO $do$
BEGIN
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$do$;
`));

  await db.execute(sql.raw(`
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "role" "public"."enum_users_role" DEFAULT 'user'::"public"."enum_users_role" NOT NULL;
`));

  await tryRecordPayloadMigration('20260311_090655_add_users_role');

  await db.execute(sql.raw(`ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "meta_keywords" varchar;`));
  await tryRecordPayloadMigration('20260315_add_pages_meta_keywords');

  await db.execute(sql.raw(`
CREATE TABLE IF NOT EXISTS "api_sources" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar NOT NULL,
  "adapter" varchar NOT NULL DEFAULT 'generic',
  "config" jsonb NOT NULL,
  "enabled" boolean DEFAULT true,
  "cron_job_id" varchar,
  "last_run_at" timestamp(3) with time zone,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
`));

  await db.execute(sql.raw(`
CREATE TABLE IF NOT EXISTS "external_api_runs" (
  "id" serial PRIMARY KEY NOT NULL,
  "started_at" timestamp(3) with time zone NOT NULL,
  "finished_at" timestamp(3) with time zone,
  "status" varchar NOT NULL,
  "records_fetched" integer,
  "error_message" text,
  "raw_result" jsonb,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "api_sources_id" integer
);
`));

  await db.execute(sql.raw(`
DO $do$
BEGIN
  ALTER TABLE "external_api_runs" ADD CONSTRAINT "external_api_runs_api_sources_fk" FOREIGN KEY ("api_sources_id") REFERENCES "public"."api_sources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$do$;
`));

  await db.execute(
    sql.raw(`ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "api_sources_id" integer;`)
  );
  await db.execute(
    sql.raw(`ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "external_api_runs_id" integer;`)
  );

  await db.execute(sql.raw(`
DO $do$
BEGIN
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_api_sources_fk" FOREIGN KEY ("api_sources_id") REFERENCES "public"."api_sources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$do$;
`));

  await db.execute(sql.raw(`
DO $do$
BEGIN
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_external_api_runs_fk" FOREIGN KEY ("external_api_runs_id") REFERENCES "public"."external_api_runs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$do$;
`));

  for (const stmt of [
    `CREATE INDEX IF NOT EXISTS "api_sources_updated_at_idx" ON "api_sources" USING btree ("updated_at");`,
    `CREATE INDEX IF NOT EXISTS "api_sources_created_at_idx" ON "api_sources" USING btree ("created_at");`,
    `CREATE INDEX IF NOT EXISTS "external_api_runs_updated_at_idx" ON "external_api_runs" USING btree ("updated_at");`,
    `CREATE INDEX IF NOT EXISTS "external_api_runs_created_at_idx" ON "external_api_runs" USING btree ("created_at");`,
    `CREATE INDEX IF NOT EXISTS "external_api_runs_api_sources_id_idx" ON "external_api_runs" USING btree ("api_sources_id");`,
    `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_api_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("api_sources_id");`,
    `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_external_api_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("external_api_runs_id");`,
  ]) {
    await db.execute(sql.raw(stmt));
  }

  await tryRecordPayloadMigration('20260317_add_api_sources_and_runs');
}

export const REPAIR_PAYLOAD_SUCCESS_MESSAGE =
  'Applied Payload schema repairs (users.role, pages.meta_keywords, api_sources / locked_docs rels). Reload /admin.';

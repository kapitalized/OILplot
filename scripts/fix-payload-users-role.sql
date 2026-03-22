-- Fix: column users.role does not exist (Payload admin)
-- Run in Neon SQL Editor if `npm run payload:migrate` did not apply migration `20260311_090655_add_users_role`.
-- Safe to re-run: skips if enum/column already exist.

DO $$ BEGIN
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "role" "public"."enum_users_role" DEFAULT 'user'::"public"."enum_users_role" NOT NULL;

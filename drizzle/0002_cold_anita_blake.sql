ALTER TABLE "project_main" ADD COLUMN IF NOT EXISTS "project_description" text;--> statement-breakpoint
ALTER TABLE "project_main" ADD COLUMN IF NOT EXISTS "short_id" text;--> statement-breakpoint
ALTER TABLE "project_main" ADD COLUMN IF NOT EXISTS "slug" text;
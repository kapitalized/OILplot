CREATE TABLE IF NOT EXISTS "ai_model_config" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"extraction_model" text NOT NULL,
	"analysis_model" text NOT NULL,
	"synthesis_model" text NOT NULL,
	"chat_model" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logs_ai_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"event_type" text NOT NULL,
	"project_id" uuid,
	"user_id" uuid,
	"provider" text NOT NULL,
	"model" text,
	"input_tokens" integer,
	"output_tokens" integer,
	"total_tokens" integer,
	"cost" numeric,
	"latency_ms" integer,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logs_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid,
	"report_id" uuid NOT NULL,
	"analysis_id" uuid NOT NULL,
	"report_type" text NOT NULL,
	"source" text,
	"file_ids" jsonb
);
--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "run_started_at" timestamp;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "run_duration_ms" integer;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "input_size_bytes" integer;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "input_page_count" integer;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "token_usage" jsonb;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "models_used" jsonb;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "step_trace" jsonb;--> statement-breakpoint
ALTER TABLE "project_main" ADD COLUMN "project_objectives" text;--> statement-breakpoint
ALTER TABLE "project_main" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "project_main" ADD COLUMN "project_status" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs_ai_runs" ADD CONSTRAINT "logs_ai_runs_project_id_project_main_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project_main"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs_ai_runs" ADD CONSTRAINT "logs_ai_runs_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs_reports" ADD CONSTRAINT "logs_reports_project_id_project_main_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project_main"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs_reports" ADD CONSTRAINT "logs_reports_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs_reports" ADD CONSTRAINT "logs_reports_report_id_report_generated_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report_generated"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs_reports" ADD CONSTRAINT "logs_reports_analysis_id_ai_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."ai_analyses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

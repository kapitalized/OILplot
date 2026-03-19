import { pgTable, pgSchema, uuid, text, timestamp, integer, jsonb, decimal, boolean, primaryKey } from "drizzle-orm/pg-core";

/**
 * MODULE 1: USER & MEMBERSHIP
 * Handles registration, subscription tiers, and global settings.
 */
export const user_profiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey(), // Links to neon_auth.user.id
  email: text("email").notNull(),
  plan_type: text("plan_type").default("free").notNull(), // 'free', 'basic', 'premium'
  stripe_customer_id: text("stripe_customer_id"),
  total_storage_used: integer("total_storage_used").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

/**
 * MODULE 2: PROJECTS & FILE MANAGEMENT
 * The "Villa Bali" layer. Manages the containers and raw file storage (Vercel Blob).
 */
export const project_main = pgTable("project_main", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => user_profiles.id),
  projectName: text("project_name").notNull(), // e.g., 'Villa Bali'
  projectAddress: text("project_address"),
  status: text("status").default("active"), // 'active', 'archived', 'completed'
  created_at: timestamp("created_at").defaultNow(),
});

export const project_files = pgTable("project_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project_main.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // 'plan', 'defect_report', 'contract'
  blobUrl: text("blob_url").notNull(), // Vercel Blob public URL
  blobKey: text("blob_key").notNull(), // Vercel Blob delete key
  fileSize: integer("file_size"),
  uploaded_at: timestamp("uploaded_at").defaultNow(),
});

/**
 * MODULE 3: AI DIGEST & ANALYSIS
 * The "Intelligence" layer. Stores extracted data and reasoning.
 */
export const ai_digests = pgTable("ai_digests", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileId: uuid("file_id").references(() => project_files.id),
  projectId: uuid("project_id").references(() => project_main.id),
  rawExtraction: jsonb("raw_extraction").notNull(), // The "Digest": structured facts from the AI
  summary: text("summary"),
  processed_at: timestamp("processed_at").defaultNow(),
});

export const ai_analyses = pgTable("ai_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project_main.id),
  analysisType: text("analysis_type").notNull(), // 'quantities', 'comparison', 'structural'
  analysisResult: jsonb("analysis_result").notNull(), // The "Analysis": Calculated logic (e.g. wall surface areas)
  inputSourceIds: jsonb("input_source_ids").notNull(), // Array of fileIds used for this analysis
  created_at: timestamp("created_at").defaultNow(),
});

export const ai_knowledge_nodes = pgTable("ai_knowledge_nodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project_main.id),
  fileId: uuid("file_id").references(() => project_files.id),
  content: text("content").notNull(), // Chunked text for vector search
  vectorId: text("vector_id"), // Reference to Qdrant/Pinecone vector entry
});

/**
 * MODULE 4: INTERACTION & MEMORY
 * Manages chat threads, history, and AI citations.
 */
export const chat_threads = pgTable("chat_threads", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project_main.id),
  userId: uuid("user_id").references(() => user_profiles.id),
  title: text("title").notNull(), // e.g., 'Surface areas of walls'
  contextSummary: text("context_summary"), // Updated by AI to maintain "Long-term memory"
  last_activity: timestamp("last_activity").defaultNow(),
});

export const chat_messages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id").references(() => chat_threads.id),
  role: text("role").notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  citations: jsonb("citations"), // Links to ai_analyses or project_files
  created_at: timestamp("created_at").defaultNow(),
});

/**
 * MODULE 5: OUTPUT & REPORTS
 * Final deliverables generated from analyses.
 */
export const report_generated = pgTable("report_generated", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project_main.id),
  reportTitle: text("report_title").notNull(), // e.g. 'Volume Concrete Report'
  reportType: text("report_type").notNull(), // 'quantity_takeoff', 'defect_audit'
  content: text("content"), // Markdown or structured JSON content
  blobUrl: text("blob_url"), // If generated as a PDF stored in Vercel Blob
  analysisSourceId: uuid("analysis_source_id").references(() => ai_analyses.id),
  created_at: timestamp("created_at").defaultNow(),
});
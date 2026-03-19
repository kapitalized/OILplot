/**
 * Write to logs_* tables: logs_ai_runs (OpenRouter etc.), logs_reports (report creation with file link).
 */

import { db } from '@/lib/db';
import { logs_ai_runs, logs_reports } from '@/lib/db/schema';

export interface WriteLogReportParams {
  projectId: string;
  userId: string | null;
  reportId: string;
  analysisId: string;
  reportType: string;
  source: 'pipeline' | 'from_chat' | 'python_analyze';
  /** File(s) analysed to produce this report (project_files.id). Links report back to source files. */
  fileIds?: string[];
}

export async function writeLogReport(params: WriteLogReportParams): Promise<void> {
  await db.insert(logs_reports).values({
    projectId: params.projectId,
    userId: params.userId ?? undefined,
    reportId: params.reportId,
    analysisId: params.analysisId,
    reportType: params.reportType,
    source: params.source,
    fileIds: params.fileIds && params.fileIds.length > 0 ? params.fileIds : null,
  });
}

export interface WriteLogAiRunParams {
  eventType: 'pipeline_run' | 'chat_turn' | 'batch_step';
  projectId?: string | null;
  userId?: string | null;
  provider: string;
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  cost?: number | string | null;
  latencyMs?: number | null;
  metadata?: Record<string, unknown> | null;
}

export async function writeLogAiRun(params: WriteLogAiRunParams): Promise<void> {
  await db.insert(logs_ai_runs).values({
    eventType: params.eventType,
    projectId: params.projectId ?? undefined,
    userId: params.userId ?? undefined,
    provider: params.provider,
    model: params.model ?? undefined,
    inputTokens: params.inputTokens ?? undefined,
    outputTokens: params.outputTokens ?? undefined,
    totalTokens: params.totalTokens ?? undefined,
    cost: params.cost != null ? String(params.cost) : undefined,
    latencyMs: params.latencyMs ?? undefined,
    metadata: params.metadata ?? undefined,
  });
}

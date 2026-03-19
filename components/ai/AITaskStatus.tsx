'use client';

/**
 * Placeholder: AI task status (Extraction → Analysis → Review).
 * Implement using blueprint @14_AITaskStatus.
 */

export default function AITaskStatus({
  jobId = 'task_placeholder',
  onVerify,
}: {
  jobId?: string;
  onVerify?: (data: unknown) => void;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 text-sm">
      <p className="font-medium">AI Task: {jobId}</p>
      <p className="mt-1 text-muted-foreground">Replace with full AITaskStatus from blueprint.</p>
      {onVerify && (
        <button
          type="button"
          onClick={() => onVerify({})}
          className="mt-3 text-primary hover:underline"
        >
          Verify (placeholder)
        </button>
      )}
    </div>
  );
}

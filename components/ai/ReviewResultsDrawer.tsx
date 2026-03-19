'use client';

/**
 * Placeholder: Human-in-the-loop review drawer.
 * Implement using blueprint @15_ReviewResultsDrawer.
 */

export default function ReviewResultsDrawer({
  isOpen,
  onClose,
  onSync,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSync: (data: unknown) => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="w-full max-w-md bg-card p-6 shadow-xl">
        <p className="font-medium">Review AI Extraction</p>
        <p className="mt-1 text-sm text-muted-foreground">Replace with full ReviewResultsDrawer from blueprint.</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            Close
          </button>
          <button type="button" onClick={() => onSync({})} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

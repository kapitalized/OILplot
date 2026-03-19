import { Suspense } from 'react';
import { AIChatContent } from './AIChatContent';

export default function AIChatPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading…</div>}>
      <AIChatContent />
    </Suspense>
  );
}

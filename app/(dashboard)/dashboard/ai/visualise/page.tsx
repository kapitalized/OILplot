import Link from 'next/link';

export default function VisualisePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Visualise</h1>
      <p className="text-muted-foreground text-sm">
        Create example visuals/stories from your data. (Coming soon: Visual Story Engine UI)
      </p>
      <div className="rounded-lg border bg-card p-4 text-sm">
        <p className="font-medium">Next steps</p>
        <p className="mt-2 text-muted-foreground">
          In the meantime, use <Link className="text-primary underline" href="/dashboard/ai/chat">Chat</Link> to query and
          then wire results into the visual generator.
        </p>
      </div>
    </div>
  );
}


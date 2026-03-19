import { ProjectNav } from './ProjectNav';
import { ProjectPageTitle } from './ProjectPageTitle';
import { ProjectOverview } from './ProjectOverview';

type Props = { params: Promise<{ shortId: string; slug: string }> };

export default async function ProjectHomePage({ params }: Props) {
  const { shortId, slug } = await params;
  const base = `/project/${shortId}/${slug}`;

  return (
    <div className="space-y-6">
      <ProjectNav shortId={shortId} slug={slug} />
      <div>
        <ProjectPageTitle />
        <p className="mt-2 text-muted-foreground">Overview, floorplan and actions.</p>
      </div>
      <ProjectOverview basePath={base} />
    </div>
  );
}

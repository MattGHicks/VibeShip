import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { InlineProjectPage } from "@/components/projects/inline-project-page";
import { AutoSync } from "@/components/projects/auto-sync";
import type { TagType } from "@/lib/actions/tags";

// Force dynamic rendering to always fetch fresh data from database
export const dynamic = "force-dynamic";

interface ProjectTag {
  tag_type: TagType;
  tag_value: string;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*, project_tags(tag_type, tag_value)")
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  const tags: ProjectTag[] = (project.project_tags as ProjectTag[]) || [];

  return (
    <>
      {/* Auto-sync GitHub data if stale (>1 hour) */}
      {project.github_repo_id && (
        <AutoSync
          projectId={project.id}
          lastSyncedAt={project.github_synced_at}
          enabled={project.github_autosync ?? true}
        />
      )}

      <InlineProjectPage project={project} tags={tags} />
    </>
  );
}

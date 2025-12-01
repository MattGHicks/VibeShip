import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusSwitcher } from "@/components/projects/status-switcher";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { GitHubSyncButton } from "@/components/projects/github-sync-button";
import { AutoSync } from "@/components/projects/auto-sync";
import { TagDisplay } from "@/components/projects/tag-selector";
import { Github, ExternalLink, Pencil, Compass, EyeOff, Calendar, Clock, Star, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { TagType } from "@/lib/actions/tags";

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

  const createdAt = new Date(project.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lastActivity = new Date(project.last_activity_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Auto-sync GitHub data if stale (>1 hour) */}
      {project.github_repo_id && (
        <AutoSync
          projectId={project.id}
          lastSyncedAt={project.github_synced_at}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge
              variant="outline"
              className={project.is_public ? "ml-2 border-green-500/50 text-green-600 dark:text-green-400" : "ml-2"}
            >
              {project.is_public ? (
                <>
                  <Compass className="mr-1 h-3 w-3" />
                  Discoverable
                </>
              ) : (
                <>
                  <EyeOff className="mr-1 h-3 w-3" />
                  Hidden
                </>
              )}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground max-w-2xl">{project.description}</p>
          )}
          {tags.length > 0 && (
            <div className="pt-2">
              <TagDisplay tags={tags} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusSwitcher projectId={project.id} currentStatus={project.status} />
          <Button variant="outline" asChild>
            <Link href={`/projects/${project.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Created {createdAt}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>Last activity {lastActivity}</span>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {project.screenshot_url && (
            <Card className="overflow-hidden">
              <div className="relative aspect-video w-full">
                <Image
                  src={project.screenshot_url}
                  alt={`${project.name} screenshot`}
                  fill
                  className="object-cover"
                />
              </div>
            </Card>
          )}

          {project.where_i_left_off && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Where I Left Off</CardTitle>
                <CardDescription>Your notes on what to do next</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{project.where_i_left_off}</p>
              </CardContent>
            </Card>
          )}

          {project.lessons_learned && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lessons Learned</CardTitle>
                <CardDescription>What you took away from this project</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{project.lessons_learned}</p>
              </CardContent>
            </Card>
          )}

          {!project.where_i_left_off && !project.lessons_learned && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center mb-4">
                  No notes yet. Add some to remember where you left off!
                </p>
                <Button variant="outline" asChild>
                  <Link href={`/projects/${project.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Add Notes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.github_repo_url ? (
                <a
                  href={project.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <Github className="h-4 w-4" />
                  <span className="truncate">{project.github_repo_url.replace("https://github.com/", "")}</span>
                  <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
                </a>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  No GitHub repo linked
                </p>
              )}

              {project.live_url ? (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span className="truncate">{project.live_url.replace(/https?:\/\//, "")}</span>
                  <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
                </a>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  No live URL
                </p>
              )}
            </CardContent>
          </Card>

          {project.github_repo_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GitHub Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-muted-foreground">Stars:</span>
                  <span className="font-medium">{project.github_stars}</span>
                </div>
                <Separator />
                <GitHubSyncButton
                  projectId={project.id}
                  lastSyncedAt={project.github_synced_at}
                />
              </CardContent>
            </Card>
          )}

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <DeleteProjectButton projectId={project.id} projectName={project.name} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

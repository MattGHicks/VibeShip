import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Flame, Pause, Skull, Rocket, Github, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Project, ProjectStatus } from "@/types/database";
import { TagDisplay } from "@/components/projects/tag-selector";
import type { TagType } from "@/lib/actions/tags";

const statusConfig: Record<ProjectStatus, { label: string; icon: React.ElementType; color: string }> = {
  active: { label: "Active", icon: Flame, color: "bg-status-active text-white" },
  paused: { label: "Paused", icon: Pause, color: "bg-status-paused text-white" },
  graveyard: { label: "Graveyard", icon: Skull, color: "bg-status-graveyard text-white" },
  shipped: { label: "Shipped", icon: Rocket, color: "bg-status-shipped text-white" },
};

interface ProjectTag {
  tag_type: TagType;
  tag_value: string;
}

interface ProjectWithTags extends Project {
  tags: ProjectTag[];
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select("*, project_tags(tag_type, tag_value)")
    .order("last_activity_at", { ascending: false });

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  const { data: projectsData } = await query;

  // Transform data to include tags array
  let projects: ProjectWithTags[] | null = projectsData?.map((p) => ({
    ...p,
    tags: (p.project_tags as ProjectTag[]) || [],
  })) || null;

  // Filter by tag if specified
  if (params.tag && projects) {
    projects = projects.filter((p) =>
      p.tags.some((t) => t.tag_value.toLowerCase() === params.tag!.toLowerCase())
    );
  }

  const currentStatus = params.status || "all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage all your vibe coding projects
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <form>
            <Input
              name="search"
              placeholder="Search projects..."
              defaultValue={params.search}
              className="pl-9"
            />
            <input type="hidden" name="status" value={currentStatus} />
          </form>
        </div>
        <Tabs value={currentStatus} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all" asChild>
              <Link href={`/projects?status=all${params.search ? `&search=${params.search}` : ""}`}>
                All
              </Link>
            </TabsTrigger>
            {(Object.keys(statusConfig) as ProjectStatus[]).map((status) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              return (
                <TabsTrigger key={status} value={status} asChild>
                  <Link href={`/projects?status=${status}${params.search ? `&search=${params.search}` : ""}`}>
                    <Icon className="mr-1 h-3 w-3" />
                    {config.label}
                  </Link>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const config = statusConfig[project.status];
            const Icon = config.icon;
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full transition-colors hover:bg-accent/50 overflow-hidden">
                  {project.screenshot_url && (
                    <div className="relative aspect-video w-full bg-muted">
                      <Image
                        src={project.screenshot_url}
                        alt={`${project.name} screenshot`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                      <Badge variant="secondary" className={config.color}>
                        <Icon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.tags.length > 0 && (
                      <TagDisplay tags={project.tags} size="sm" />
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {project.github_repo_url && (
                        <div className="flex items-center gap-1">
                          <Github className="h-4 w-4" />
                          <span>GitHub</span>
                        </div>
                      )}
                      {project.live_url && (
                        <div className="flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />
                          <span>Live</span>
                        </div>
                      )}
                    </div>
                    {project.where_i_left_off && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Where I left off:
                        </p>
                        <p className="text-sm line-clamp-2">
                          {project.where_i_left_off}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {params.search || params.status !== "all"
                ? "No projects found"
                : "No projects yet"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {params.search || params.status !== "all"
                ? "Try adjusting your filters"
                : "Create your first project or import from GitHub to get started."}
            </p>
            {!params.search && params.status === "all" && (
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/projects/new">Create Project</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/import">Import from GitHub</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

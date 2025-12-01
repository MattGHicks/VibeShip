import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Flame,
  Pause,
  Skull,
  Rocket,
  Github,
  ExternalLink,
  Star,
  Compass,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Project, ProjectStatus, User } from "@/types/database";
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

interface ProjectWithDetails extends Project {
  tags: ProjectTag[];
  users: Pick<User, "username" | "display_name" | "avatar_url">;
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; tag?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Get all public projects with user info and tags
  // Note: Use users!projects_user_id_fkey to specify the direct FK relationship
  let query = supabase
    .from("projects")
    .select("*, project_tags(tag_type, tag_value), users!projects_user_id_fkey(username, display_name, avatar_url)")
    .eq("is_public", true);

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  // Sort order
  const sortBy = params.sort || "recent";
  if (sortBy === "recent") {
    query = query.order("last_activity_at", { ascending: false });
  } else if (sortBy === "stars") {
    query = query.order("github_stars", { ascending: false });
  } else if (sortBy === "oldest") {
    query = query.order("created_at", { ascending: true });
  }

  const { data: projectsData } = await query.limit(50);

  // Transform data
  let projects: ProjectWithDetails[] = projectsData?.map((p) => ({
    ...p,
    tags: (p.project_tags as ProjectTag[]) || [],
    users: p.users as Pick<User, "username" | "display_name" | "avatar_url">,
  })) || [];

  // Filter by tag if specified
  if (params.tag && projects) {
    projects = projects.filter((p) =>
      p.tags.some((t) => t.tag_value.toLowerCase() === params.tag!.toLowerCase())
    );
  }

  const currentStatus = params.status || "all";
  const currentSort = params.sort || "recent";

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Compass className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
        </div>
        <p className="text-muted-foreground">
          Explore public projects from the community
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <form>
            <Input
              name="search"
              placeholder="Search projects..."
              defaultValue={params.search}
              className="pl-9"
            />
            <input type="hidden" name="status" value={currentStatus} />
            <input type="hidden" name="sort" value={currentSort} />
          </form>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={currentStatus} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all" asChild>
                <Link href={`/discover?status=all&sort=${currentSort}${params.search ? `&search=${params.search}` : ""}`}>
                  All
                </Link>
              </TabsTrigger>
              <TabsTrigger value="shipped" asChild>
                <Link href={`/discover?status=shipped&sort=${currentSort}${params.search ? `&search=${params.search}` : ""}`}>
                  <Rocket className="mr-1 h-3 w-3" />
                  Shipped
                </Link>
              </TabsTrigger>
              <TabsTrigger value="active" asChild>
                <Link href={`/discover?status=active&sort=${currentSort}${params.search ? `&search=${params.search}` : ""}`}>
                  <Flame className="mr-1 h-3 w-3" />
                  Active
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={currentSort} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="recent" asChild>
                <Link href={`/discover?status=${currentStatus}&sort=recent${params.search ? `&search=${params.search}` : ""}`}>
                  Recent
                </Link>
              </TabsTrigger>
              <TabsTrigger value="stars" asChild>
                <Link href={`/discover?status=${currentStatus}&sort=stars${params.search ? `&search=${params.search}` : ""}`}>
                  <Star className="mr-1 h-3 w-3" />
                  Stars
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const config = statusConfig[project.status];
            const Icon = config.icon;
            return (
              <Card key={project.id} className="overflow-hidden group">
                {project.screenshot_url && (
                  <div className="relative aspect-video w-full bg-muted">
                    <Image
                      src={project.screenshot_url}
                      alt={`${project.name} screenshot`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <a
                        href={project.github_repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Live</span>
                      </a>
                    )}
                    {project.github_stars > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{project.github_stars}</span>
                      </div>
                    )}
                  </div>

                  {/* Creator Info */}
                  <Link
                    href={`/${project.users.username}`}
                    className="flex items-center gap-2 pt-2 border-t border-border hover:text-primary transition-colors"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={project.users.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {(project.users.display_name || project.users.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {project.users.display_name || project.users.username}
                    </span>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Compass className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground text-center">
              {params.search || params.status !== "all"
                ? "Try adjusting your filters"
                : "Be the first to share a public project!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

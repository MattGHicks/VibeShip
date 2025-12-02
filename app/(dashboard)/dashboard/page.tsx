import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Flame, Pause, Skull, Rocket, ArrowRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Project, ProjectStatus } from "@/types/database";
import { ProjectPlaceholder } from "@/components/projects/project-placeholder";

const statusConfig: Record<ProjectStatus, { label: string; icon: React.ElementType; color: string }> = {
  active: { label: "Active", icon: Flame, color: "bg-status-active text-white" },
  paused: { label: "Paused", icon: Pause, color: "bg-status-paused text-white" },
  graveyard: { label: "Graveyard", icon: Skull, color: "bg-status-graveyard text-white" },
  shipped: { label: "Shipped", icon: Rocket, color: "bg-status-shipped text-white" },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: projectsData } = await supabase
    .from("projects")
    .select("*")
    .order("last_activity_at", { ascending: false })
    .limit(5);

  const projects = projectsData as Project[] | null;

  // Count projects by status
  const { data: statusCountsData } = await supabase
    .from("projects")
    .select("status");

  const statusCounts = statusCountsData as { status: ProjectStatus }[] | null;

  const counts = {
    active: 0,
    paused: 0,
    graveyard: 0,
    shipped: 0,
    total: 0,
  };

  statusCounts?.forEach((p) => {
    counts[p.status]++;
    counts.total++;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your projects.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(statusConfig) as ProjectStatus[]).map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <Card key={status}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {config.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts[status]}</div>
                <p className="text-xs text-muted-foreground">
                  {counts[status] === 1 ? "project" : "projects"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const config = statusConfig[project.status];
              const Icon = config.icon;
              return (
                <Card key={project.id} className="h-full flex flex-col overflow-hidden group py-0 gap-0">
                  <Link href={`/projects/${project.id}`} className="flex-1">
                    {project.screenshot_url ? (
                      <div className="relative aspect-video w-full bg-muted">
                        <Image
                          src={project.screenshot_url}
                          alt={`${project.name} screenshot`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <ProjectPlaceholder />
                    )}
                    <CardHeader className="px-4 py-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        <Badge variant="secondary" className={config.color}>
                          <Icon className="mr-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    {project.where_i_left_off && (
                      <CardContent className="px-4 pt-0 pb-4">
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Where I left off:
                          </p>
                          <p className="text-sm line-clamp-2">
                            {project.where_i_left_off}
                          </p>
                        </div>
                      </CardContent>
                    )}
                  </Link>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first project or import from GitHub to get started.
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/projects/new">Create Project</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/import">Import from GitHub</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

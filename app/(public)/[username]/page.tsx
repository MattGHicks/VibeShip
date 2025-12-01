import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Github,
  Globe,
  Twitter,
  ExternalLink,
  Flame,
  Pause,
  Skull,
  Rocket,
  Calendar,
  Star,
  FolderKanban,
  Sparkles,
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

interface ProjectWithTags extends Project {
  tags: ProjectTag[];
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase
    .from("users")
    .select("display_name, username, bio")
    .eq("username", username)
    .single();

  if (!user) {
    return {
      title: "User Not Found - VibeShip",
    };
  }

  return {
    title: `${user.display_name || user.username} - VibeShip`,
    description: user.bio || `Check out ${user.display_name || user.username}'s vibe coding projects on VibeShip.`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  // Get user by username
  const { data: profileUser, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profileUser) {
    notFound();
  }

  // Get user's public projects
  const { data: projectsData } = await supabase
    .from("projects")
    .select("*, project_tags(tag_type, tag_value)")
    .eq("user_id", profileUser.id)
    .eq("is_public", true)
    .order("last_activity_at", { ascending: false });

  const projects: ProjectWithTags[] = projectsData?.map((p) => ({
    ...p,
    tags: (p.project_tags as ProjectTag[]) || [],
  })) || [];

  const memberSince = new Date(profileUser.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  // Count stats
  const shippedCount = projects.filter((p) => p.status === "shipped").length;
  const activeCount = projects.filter((p) => p.status === "active").length;
  const totalStars = projects.reduce((sum, p) => sum + (p.github_stars || 0), 0);

  // Get featured project (most starred shipped project, or most recent shipped)
  const featuredProject = projects
    .filter((p) => p.status === "shipped")
    .sort((a, b) => (b.github_stars || 0) - (a.github_stars || 0))[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

        <div className="container relative max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-6 md:gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/50 to-primary/20 rounded-2xl blur-lg opacity-50" />
              <Avatar className="relative h-28 w-28 md:h-36 md:w-36 rounded-2xl border-4 border-background shadow-2xl">
                <AvatarImage
                  src={profileUser.avatar_url || undefined}
                  alt={profileUser.display_name || profileUser.username}
                />
                <AvatarFallback className="rounded-2xl text-3xl md:text-4xl bg-primary/10">
                  {(profileUser.display_name || profileUser.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {profileUser.display_name || profileUser.username}
                </h1>
                <p className="text-lg text-muted-foreground">@{profileUser.username}</p>
              </div>

              {profileUser.bio && (
                <p className="text-muted-foreground max-w-2xl text-base md:text-lg leading-relaxed">
                  {profileUser.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Joined {memberSince}</span>
                </Badge>

                {profileUser.website_url && (
                  <a
                    href={profileUser.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Badge variant="outline" className="gap-1.5 py-1.5 px-3 hover:bg-primary/10 transition-colors cursor-pointer">
                      <Globe className="h-3.5 w-3.5" />
                      <span>Website</span>
                    </Badge>
                  </a>
                )}

                {profileUser.github_username && (
                  <a
                    href={`https://github.com/${profileUser.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Badge variant="outline" className="gap-1.5 py-1.5 px-3 hover:bg-primary/10 transition-colors cursor-pointer">
                      <Github className="h-3.5 w-3.5" />
                      <span>@{profileUser.github_username}</span>
                    </Badge>
                  </a>
                )}

                {profileUser.twitter_handle && (
                  <a
                    href={`https://twitter.com/${profileUser.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Badge variant="outline" className="gap-1.5 py-1.5 px-3 hover:bg-primary/10 transition-colors cursor-pointer">
                      <Twitter className="h-3.5 w-3.5" />
                      <span>@{profileUser.twitter_handle}</span>
                    </Badge>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold">{projects.length}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Public Projects</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-status-shipped/20">
                  <Rocket className="h-5 w-5 text-status-shipped" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold">{shippedCount}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Shipped</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-status-active/20">
                  <Flame className="h-5 w-5 text-status-active" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold">{activeCount}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold">{totalStars}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">GitHub Stars</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Project */}
        {featuredProject && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Featured Project</h2>
            </div>

            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="grid md:grid-cols-2 gap-0">
                {featuredProject.screenshot_url && (
                  <div className="relative aspect-video md:aspect-auto md:min-h-[280px] bg-muted">
                    <Image
                      src={featuredProject.screenshot_url}
                      alt={`${featuredProject.name} screenshot`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className={`p-6 flex flex-col justify-center ${!featuredProject.screenshot_url ? 'md:col-span-2' : ''}`}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold">{featuredProject.name}</h3>
                        <Badge variant="secondary" className="mt-2 bg-status-shipped text-white">
                          <Rocket className="mr-1 h-3 w-3" />
                          Shipped
                        </Badge>
                      </div>
                      {featuredProject.github_stars > 0 && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-5 w-5 fill-current" />
                          <span className="font-bold">{featuredProject.github_stars}</span>
                        </div>
                      )}
                    </div>

                    {featuredProject.description && (
                      <p className="text-muted-foreground">{featuredProject.description}</p>
                    )}

                    {featuredProject.tags.length > 0 && (
                      <TagDisplay tags={featuredProject.tags} />
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                      {featuredProject.live_url && (
                        <a
                          href={featuredProject.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Live
                        </a>
                      )}
                      {featuredProject.github_repo_url && (
                        <a
                          href={featuredProject.github_repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
                        >
                          <Github className="h-4 w-4" />
                          View Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* All Projects Grid */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {featuredProject ? "All Projects" : "Projects"}
          </h2>

          {projects.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const config = statusConfig[project.status];
                const Icon = config.icon;
                return (
                  <Card
                    key={project.id}
                    className="overflow-hidden group hover:border-primary/30 transition-colors"
                  >
                    {project.screenshot_url ? (
                      <div className="relative aspect-video w-full bg-muted overflow-hidden">
                        <Image
                          src={project.screenshot_url}
                          alt={`${project.name} screenshot`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <FolderKanban className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                        <Badge variant="secondary" className={`${config.color} flex-shrink-0`}>
                          <Icon className="mr-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      {project.tags.length > 0 && (
                        <TagDisplay tags={project.tags} size="sm" />
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {project.github_repo_url && (
                          <a
                            href={project.github_repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <Github className="h-4 w-4" />
                            <span>Code</span>
                          </a>
                        )}
                        {project.live_url && (
                          <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Live</span>
                          </a>
                        )}
                        {project.github_stars > 0 && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4" />
                            <span>{project.github_stars}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <FolderKanban className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No public projects yet</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {profileUser.display_name || profileUser.username} hasn&apos;t shared any public projects yet. Check back later!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

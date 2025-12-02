"use client";

import { useState } from "react";
import { StatusSwitcher } from "@/components/projects/status-switcher";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { ApiSettings } from "@/components/projects/api-settings";
import { GitHubSyncButton } from "@/components/projects/github-sync-button";
import { DiscoverableToggle } from "@/components/projects/discoverable-toggle";
import { ScreenshotUpload } from "@/components/projects/screenshot-upload";
import { ProjectPlaceholder } from "@/components/projects/project-placeholder";
import { EditableText, EditableTextarea, EditableDescription, EditableLinks, InlineTagEditor } from "@/components/inline-edit";
import { Calendar, Clock, Star, ImagePlus, Github, GitFork, CircleDot, RefreshCw, ExternalLink, Lightbulb, MapPin, Trash2, Activity, ListTodo } from "lucide-react";
import { ShipDateGoal } from "@/components/projects/ship-date-goal";
import { ActivityTimeline } from "@/components/projects/activity-timeline";
import { NextStepsChecklist } from "@/components/projects/next-steps-checklist";
import { ResourceLinks } from "@/components/projects/resource-links";
import Image from "next/image";
import { updateProject } from "@/lib/actions/projects";
import { toggleGitHubAutosync } from "@/lib/actions/github";
import { Switch } from "@/components/ui/switch";
import type { Project } from "@/types/database";
import type { TagType } from "@/lib/actions/tags";
import { cn } from "@/lib/utils";

interface ProjectTag {
  tag_type: TagType;
  tag_value: string;
}

interface InlineProjectPageProps {
  project: Project;
  tags: ProjectTag[];
}

export function InlineProjectPage({ project: initialProject, tags }: InlineProjectPageProps) {
  const [project, setProject] = useState(initialProject);
  const [showScreenshotUpload, setShowScreenshotUpload] = useState(false);

  const updateField = async (field: keyof Project, value: string | null) => {
    setProject((prev) => ({ ...prev, [field]: value }));
    const result = await updateProject(project.id, { [field]: value || null });
    if (result?.error) {
      setProject(initialProject);
      throw new Error(result.error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysSinceActivity = (date: string) => {
    const lastActivity = new Date(date);
    const now = new Date();
    const diffTime = now.getTime() - lastActivity.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getActivityStatus = (date: string) => {
    const days = getDaysSinceActivity(date);
    if (days === 0) return { text: "Active today", color: "text-status-shipped", bg: "bg-status-shipped/10" };
    if (days === 1) return { text: "1 day ago", color: "text-status-shipped", bg: "bg-status-shipped/10" };
    if (days <= 3) return { text: `${days} days ago`, color: "text-status-shipped", bg: "bg-status-shipped/10" };
    if (days <= 7) return { text: `${days} days ago`, color: "text-status-active", bg: "bg-status-active/10" };
    if (days <= 14) return { text: `${days} days ago`, color: "text-amber-500", bg: "bg-amber-500/10" };
    if (days <= 30) return { text: `${days} days ago`, color: "text-status-paused", bg: "bg-status-paused/10" };
    return { text: `${days} days ago`, color: "text-status-graveyard", bg: "bg-status-graveyard/10" };
  };

  const hasGitHub = !!project.github_repo_id;
  const activityStatus = getActivityStatus(project.last_activity_at);

  return (
    <div className="space-y-6 pb-8">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER - Project identity and controls
          ═══════════════════════════════════════════════════════════════════ */}
      <header className="space-y-4 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
        {/* Top row: Name + Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <EditableText
              value={project.name}
              onSave={(value) => updateField("name", value)}
              placeholder="Project Name"
              className="text-3xl font-display font-semibold tracking-tight"
              required
            />
            <EditableDescription
              value={project.description || ""}
              onSave={(value) => updateField("description", value)}
              placeholder="Add a description..."
              className="text-muted-foreground max-w-2xl"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <DiscoverableToggle
              projectId={project.id}
              isPublic={project.is_public}
              showLabel
            />
            <StatusSwitcher projectId={project.id} currentStatus={project.status} size="lg" />
          </div>
        </div>

        {/* Tags + Metadata row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <InlineTagEditor projectId={project.id} initialTags={tags} />

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(project.created_at)}
            </span>
            <span className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium",
              activityStatus.color,
              activityStatus.bg
            )}>
              <Clock className="h-3.5 w-3.5" />
              {activityStatus.text}
            </span>
          </div>

          <div className="group">
            <ShipDateGoal
              projectId={project.id}
              targetDate={project.target_ship_date}
              status={project.status}
            />
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          BENTO GRID - Main content area
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ─────────────────────────────────────────────────────────────────
            ROW 1: Screenshot + Where I Left Off
            ───────────────────────────────────────────────────────────────── */}

        {/* Screenshot Card - Large visual anchor */}
        <BentoCard className="lg:col-span-5 xl:col-span-4" glow delay={0}>
          <div className="relative">
            {showScreenshotUpload ? (
              <div className="p-4">
                <ScreenshotUpload
                  projectId={project.id}
                  currentUrl={project.screenshot_url}
                  onUpload={async (url) => {
                    await updateField("screenshot_url", url);
                    setShowScreenshotUpload(false);
                  }}
                />
                {project.screenshot_url && (
                  <button
                    type="button"
                    onClick={() => setShowScreenshotUpload(false)}
                    className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ) : project.screenshot_url ? (
              <div
                className="relative aspect-[4/3] w-full cursor-pointer group overflow-hidden rounded-lg"
                onClick={() => setShowScreenshotUpload(true)}
              >
                <Image
                  src={project.screenshot_url}
                  alt={`${project.name} screenshot`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="text-white/90 text-sm font-medium">Preview</span>
                    <div className="flex items-center gap-1.5 text-white/80 text-xs bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                      <ImagePlus className="h-3.5 w-3.5" />
                      Change
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="cursor-pointer group relative overflow-hidden rounded-lg"
                onClick={() => setShowScreenshotUpload(true)}
              >
                <ProjectPlaceholder />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="text-white text-sm font-medium flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <ImagePlus className="h-4 w-4" />
                    Add Screenshot
                  </div>
                </div>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Where I Left Off - Primary focus area */}
        <BentoCard className="lg:col-span-7 xl:col-span-8 flex flex-col" highlight delay={100}>
          <CardHeader icon={MapPin} iconColor="text-amber">
            Where I Left Off
          </CardHeader>
          <div className="mt-3 flex-1">
            <EditableTextarea
              value={project.where_i_left_off || ""}
              onSave={(value) => updateField("where_i_left_off", value)}
              placeholder="What were you working on? What's the next step?"
              emptyStateMessage="Click to add notes about where you left off..."
              minRows={4}
              className="h-full"
            />
          </div>
        </BentoCard>

        {/* ─────────────────────────────────────────────────────────────────
            ROW 2: Links + GitHub Stats + Lessons Learned
            ───────────────────────────────────────────────────────────────── */}

        {/* Links & Resources Card */}
        <BentoCard className={cn(
          "lg:col-span-6",
          hasGitHub ? "xl:col-span-4" : "xl:col-span-6"
        )} delay={200}>
          <CardHeader icon={ExternalLink}>Links & Resources</CardHeader>
          <div className="mt-3 space-y-4">
            <EditableLinks
              githubUrl={project.github_repo_url || ""}
              liveUrl={project.live_url || ""}
              onSaveGithub={(value) => updateField("github_repo_url", value)}
              onSaveLive={(value) => updateField("live_url", value)}
            />
            <div className="border-t border-border/30 pt-3">
              <ResourceLinks projectId={project.id} />
            </div>
          </div>
        </BentoCard>

        {/* GitHub Stats Card - Only if connected */}
        {hasGitHub && (
          <BentoCard className="lg:col-span-6 xl:col-span-4" delay={300}>
            <GitHubPanel project={project} />
          </BentoCard>
        )}

        {/* Lessons Learned */}
        <BentoCard className={cn(
          "lg:col-span-6",
          hasGitHub ? "xl:col-span-4" : "xl:col-span-6"
        )} delay={400}>
          <CardHeader icon={Lightbulb} iconColor="text-status-shipped">
            Lessons Learned
          </CardHeader>
          <div className="mt-3">
            <EditableTextarea
              value={project.lessons_learned || ""}
              onSave={(value) => updateField("lessons_learned", value)}
              placeholder="What did you learn from this project?"
              emptyStateMessage="Click to document what you learned..."
              minRows={3}
            />
          </div>
        </BentoCard>

        {/* Activity Timeline */}
        <BentoCard className={cn(
          "lg:col-span-6",
          hasGitHub ? "xl:col-span-4" : "xl:col-span-6"
        )} delay={450}>
          <CardHeader icon={Activity} iconColor="text-blue-500">
            AI Activity
          </CardHeader>
          <div className="mt-3">
            <ActivityTimeline
              projectId={project.id}
              hasApiKey={!!project.api_key}
            />
          </div>
        </BentoCard>

        {/* Next Steps Checklist */}
        <BentoCard className={cn(
          "lg:col-span-6",
          hasGitHub ? "xl:col-span-8" : "xl:col-span-6"
        )} delay={475}>
          <CardHeader icon={ListTodo} iconColor="text-primary">
            Next Steps
          </CardHeader>
          <div className="mt-3">
            <NextStepsChecklist projectId={project.id} />
          </div>
        </BentoCard>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          AI INTEGRATION - Full width section
          ═══════════════════════════════════════════════════════════════════ */}
      <BentoCard className="relative overflow-hidden" delay={500}>
        <div className="absolute inset-0 bg-gradient-to-br from-amber/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <ApiSettings
            project={project}
            tags={tags}
            apiKey={project.api_key}
          />
        </div>
      </BentoCard>

      {/* ═══════════════════════════════════════════════════════════════════
          DANGER ZONE - Delete project
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="pt-4 border-t border-border/30 animate-fade-in-up opacity-0"
        style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trash2 className="h-4 w-4" />
            <span className="text-sm">Danger Zone</span>
          </div>
          <DeleteProjectButton
            projectId={project.id}
            projectName={project.name}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  highlight?: boolean;
  delay?: number;
}

function BentoCard({ children, className, glow, highlight, delay = 0 }: BentoCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm",
        "transition-all duration-300",
        "hover:border-border/60 hover:bg-card/70",
        glow && "hover:shadow-[0_0_30px_rgba(251,191,36,0.08)]",
        highlight && "border-amber/20 bg-gradient-to-br from-amber/5 via-card/50 to-card/50",
        "animate-fade-in-up opacity-0",
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  icon?: React.ElementType;
  iconColor?: string;
}

function CardHeader({ children, icon: Icon, iconColor = "text-muted-foreground" }: CardHeaderProps) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-medium text-foreground/80">
      {Icon && <Icon className={cn("h-4 w-4", iconColor)} />}
      {children}
    </h3>
  );
}

// GitHub Panel with stats and autosync
function GitHubPanel({ project }: { project: Project }) {
  const [autosync, setAutosync] = useState(project.github_autosync ?? true);
  const [isToggling, setIsToggling] = useState(false);

  const handleAutosyncToggle = async (enabled: boolean) => {
    setAutosync(enabled);
    setIsToggling(true);
    try {
      await toggleGitHubAutosync(project.id, enabled);
    } catch {
      setAutosync(!enabled);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <CardHeader icon={Github}>Repository Stats</CardHeader>

      {/* Stats Grid */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatCard
          icon={Star}
          value={project.github_stars ?? 0}
          label="Stars"
          iconColor="text-amber-400"
        />
        <StatCard
          icon={GitFork}
          value={project.github_forks ?? 0}
          label="Forks"
          iconColor="text-blue-400"
        />
        <StatCard
          icon={CircleDot}
          value={project.github_open_issues ?? 0}
          label="Issues"
          iconColor="text-emerald-400"
        />
      </div>

      {/* Language badge */}
      {project.github_language && (
        <div className="mt-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">{project.github_language}</span>
        </div>
      )}

      {/* Sync Controls */}
      <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <GitHubSyncButton
            projectId={project.id}
            lastSyncedAt={project.github_synced_at}
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="autosync" className="text-sm text-muted-foreground flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Auto-sync
          </label>
          <Switch
            id="autosync"
            checked={autosync}
            onCheckedChange={handleAutosyncToggle}
            disabled={isToggling}
          />
        </div>
      </div>
    </>
  );
}

// Individual stat card in GitHub panel
function StatCard({
  icon: Icon,
  value,
  label,
  iconColor
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  iconColor: string;
}) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/20">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <Icon className={cn("h-4 w-4", iconColor)} />
        <span className="text-lg font-semibold tabular-nums">{value}</span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

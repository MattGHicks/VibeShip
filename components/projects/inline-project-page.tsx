"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { StatusSwitcher } from "@/components/projects/status-switcher";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { ApiSettings } from "@/components/projects/api-settings";
import { GitHubSyncButton } from "@/components/projects/github-sync-button";
import { DiscoverableToggle } from "@/components/projects/discoverable-toggle";
import { ScreenshotUpload } from "@/components/projects/screenshot-upload";
import { ProjectPlaceholder } from "@/components/projects/project-placeholder";
import { EditableText, EditableTextarea, EditableDescription, EditableLinks, InlineTagEditor } from "@/components/inline-edit";
import { Calendar, Clock, Star, ImagePlus, Github, GitFork, CircleDot, RefreshCw } from "lucide-react";
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
    // Optimistic update
    setProject((prev) => ({ ...prev, [field]: value }));

    const result = await updateProject(project.id, { [field]: value || null });
    if (result?.error) {
      // Revert on error
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

  return (
    <div className="space-y-8">
      {/* Header Section - Screenshot thumbnail + Info */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Screenshot Thumbnail - Left side */}
        <div className="shrink-0">
          <div className="rounded-lg overflow-hidden border border-border/50 bg-muted/20 w-full sm:w-48 md:w-56">
            {showScreenshotUpload ? (
              <div className="p-3">
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
                    className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ) : project.screenshot_url ? (
              <div
                className="relative aspect-video w-full cursor-pointer group"
                onClick={() => setShowScreenshotUpload(true)}
              >
                <Image
                  src={project.screenshot_url}
                  alt={`${project.name} screenshot`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="text-white text-xs font-medium flex items-center gap-1.5">
                    <ImagePlus className="h-3.5 w-3.5" />
                    Change
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="cursor-pointer group relative"
                onClick={() => setShowScreenshotUpload(true)}
              >
                <ProjectPlaceholder />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="text-white text-xs font-medium flex items-center gap-1.5">
                    <ImagePlus className="h-3.5 w-3.5" />
                    Add Screenshot
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Info - Right side */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title row with status */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5 flex-1 min-w-0">
              {/* Project Name - Editable */}
              <EditableText
                value={project.name}
                onSave={(value) => updateField("name", value)}
                placeholder="Project Name"
                className="text-2xl font-semibold tracking-tight"
                required
              />

              {/* Description - Editable */}
              <EditableDescription
                value={project.description || ""}
                onSave={(value) => updateField("description", value)}
                placeholder="Add a description..."
              />
            </div>

            {/* Status & Visibility Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <DiscoverableToggle
                projectId={project.id}
                isPublic={project.is_public}
                showLabel
              />
              <StatusSwitcher projectId={project.id} currentStatus={project.status} />
            </div>
          </div>

          {/* Tags */}
          <InlineTagEditor
            projectId={project.id}
            initialTags={tags}
          />

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Created {formatDate(project.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Updated {formatDate(project.last_activity_at)}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Content - Links and GitHub panel */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Links */}
        <div className="lg:flex-1">
          <DetailPanel>
            <DetailPanelHeader>Links</DetailPanelHeader>
            <EditableLinks
              githubUrl={project.github_repo_url || ""}
              liveUrl={project.live_url || ""}
              onSaveGithub={(value) => updateField("github_repo_url", value)}
              onSaveLive={(value) => updateField("live_url", value)}
            />
          </DetailPanel>
        </div>

        {/* GitHub Stats - Only show if connected */}
        {project.github_repo_id && (
          <div className="lg:flex-1">
            <GitHubPanel project={project} />
          </div>
        )}
      </div>

      {/* Notes Section - 2 columns on desktop */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Where I Left Off */}
        <Section title="Where I Left Off">
          <EditableTextarea
            value={project.where_i_left_off || ""}
            onSave={(value) => updateField("where_i_left_off", value)}
            placeholder="What were you working on? What's the next step?"
            emptyStateMessage="Click to add notes about where you left off..."
            minRows={2}
          />
        </Section>

        {/* Lessons Learned - Always show on shipped/graveyard, or if has content */}
        {(project.status === "graveyard" || project.status === "shipped" || project.lessons_learned) && (
          <Section title="Lessons Learned">
            <EditableTextarea
              value={project.lessons_learned || ""}
              onSave={(value) => updateField("lessons_learned", value)}
              placeholder="What did you learn from this project?"
              emptyStateMessage="Click to document what you learned..."
              minRows={2}
            />
          </Section>
        )}
      </div>

      {/* AI Integration */}
      <ApiSettings
        project={project}
        tags={tags}
        apiKey={project.api_key}
      />

      {/* Danger Zone */}
      <Separator />
      <div className="flex items-center justify-between">
        <DeleteProjectButton
          projectId={project.id}
          projectName={project.name}
        />
      </div>
    </div>
  );
}

// Lightweight section wrapper - no card, just typography
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

// Subtle detail panel for sidebar
function DetailPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-lg border border-border/40 bg-muted/10 p-3",
      className
    )}>
      {children}
    </div>
  );
}

function DetailPanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5">
      {children}
    </h4>
  );
}

// GitHub Panel with stats and autosync toggle
function GitHubPanel({ project }: { project: Project }) {
  const [autosync, setAutosync] = useState(project.github_autosync ?? true);
  const [isToggling, setIsToggling] = useState(false);

  const handleAutosyncToggle = async (enabled: boolean) => {
    setAutosync(enabled);
    setIsToggling(true);
    try {
      await toggleGitHubAutosync(project.id, enabled);
    } catch {
      setAutosync(!enabled); // Revert on error
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <DetailPanel>
      <DetailPanelHeader>
        <span className="flex items-center gap-1.5">
          <Github className="h-3.5 w-3.5" />
          GitHub
        </span>
      </DetailPanelHeader>
      <div className="space-y-3">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatItem icon={Star} value={project.github_stars ?? 0} label="stars" color="text-amber-500" />
          <StatItem icon={GitFork} value={project.github_forks ?? 0} label="forks" color="text-blue-500" />
          <StatItem icon={CircleDot} value={project.github_open_issues ?? 0} label="issues" color="text-emerald-500" />
        </div>

        {/* Language */}
        {project.github_language && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {project.github_language}
          </div>
        )}

        {/* Sync controls */}
        <div className="pt-2 border-t border-border/30 space-y-2">
          <GitHubSyncButton
            projectId={project.id}
            lastSyncedAt={project.github_synced_at}
          />

          {/* Autosync toggle */}
          <div className="flex items-center justify-between">
            <label htmlFor="autosync" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3" />
              Auto-sync
            </label>
            <Switch
              id="autosync"
              checked={autosync}
              onCheckedChange={handleAutosyncToggle}
              disabled={isToggling}
              className="scale-75 origin-right"
            />
          </div>
        </div>
      </div>
    </DetailPanel>
  );
}

// Stat item for GitHub stats
function StatItem({
  icon: Icon,
  value,
  label,
  color
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1">
        <Icon className={cn("h-3 w-3", color)} />
        <span className="font-medium tabular-nums text-sm">{value}</span>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

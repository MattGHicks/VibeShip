"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Bot,
  FileText,
  Image,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  RefreshCw,
  Eye,
  GitBranch,
  Tag,
  Flame,
  Pause,
  Skull,
  Rocket,
  Edit3,
  User,
  Star,
  GitFork,
  Webhook,
} from "lucide-react";
import { getAllProjectActivity } from "@/lib/actions/activity";
import type { ApiActivityLog } from "@/types/database";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  projectId: string;
  hasApiKey?: boolean;
}

const actionIcons: Record<string, React.ElementType> = {
  // AI/API actions
  read: FileText,
  update: FileText,
  upload_screenshot: Image,
  // User actions
  project_created: Plus,
  status_changed: RefreshCw,
  notes_updated: Edit3,
  screenshot_uploaded: Image,
  visibility_changed: Eye,
  github_synced: GitBranch,
  tags_updated: Tag,
  project_edited: Edit3,
  // GitHub webhook actions
  github_push: GitBranch,
  github_release: Rocket,
  github_starred: Star,
  github_forked: GitFork,
};

const actionColors: Record<string, string> = {
  // AI/API actions
  read: "text-blue-500 bg-blue-500/10",
  update: "text-status-shipped bg-status-shipped/10",
  upload_screenshot: "text-purple-500 bg-purple-500/10",
  // User actions
  project_created: "text-status-shipped bg-status-shipped/10",
  status_changed: "text-status-active bg-status-active/10",
  notes_updated: "text-primary bg-primary/10",
  screenshot_uploaded: "text-purple-500 bg-purple-500/10",
  visibility_changed: "text-blue-500 bg-blue-500/10",
  github_synced: "text-gray-500 bg-gray-500/10",
  tags_updated: "text-pink-500 bg-pink-500/10",
  project_edited: "text-primary bg-primary/10",
  // GitHub webhook actions
  github_push: "text-emerald-500 bg-emerald-500/10",
  github_release: "text-purple-500 bg-purple-500/10",
  github_starred: "text-amber-500 bg-amber-500/10",
  github_forked: "text-blue-500 bg-blue-500/10",
};

const statusIcons: Record<string, React.ElementType> = {
  active: Flame,
  paused: Pause,
  graveyard: Skull,
  shipped: Rocket,
};

function formatAction(action: string, details?: Record<string, unknown> | null): string {
  // AI/API actions
  if (action === "read") return "AI read project context";
  if (action.startsWith("update_")) {
    const fields = action.replace("update_", "").split("_");
    return `AI updated ${fields.join(", ")}`;
  }
  if (action === "upload_screenshot") return "AI uploaded screenshot";

  // User actions
  if (action === "project_created") {
    const source = details?.source;
    if (source === "github_import") return "Imported from GitHub";
    return "Project created";
  }
  if (action === "status_changed") {
    const status = details?.status as string;
    if (status) {
      const statusLabels: Record<string, string> = {
        active: "Active",
        paused: "Paused",
        graveyard: "Graveyard",
        shipped: "Shipped",
      };
      return `Status changed to ${statusLabels[status] || status}`;
    }
    return "Status changed";
  }
  if (action === "notes_updated") return "Notes updated";
  if (action === "screenshot_uploaded") return "Screenshot uploaded";
  if (action === "visibility_changed") {
    const isPublic = details?.is_public;
    return isPublic ? "Made public" : "Made private";
  }
  if (action === "github_synced") return "Synced with GitHub";
  if (action === "tags_updated") return "Tags updated";
  if (action === "project_edited") return "Project updated";

  // GitHub webhook actions
  if (action === "github_push") {
    const commitCount = details?.commit_count as number;
    const branch = details?.branch as string;
    if (commitCount && branch) {
      return `${commitCount} commit${commitCount > 1 ? "s" : ""} pushed to ${branch}`;
    }
    return "Code pushed to GitHub";
  }
  if (action === "github_release") {
    const tag = details?.tag as string;
    if (tag) return `Released ${tag}`;
    return "New release published";
  }
  if (action === "github_starred") {
    const by = details?.by as string;
    const total = details?.total_stars as number;
    if (by && total) return `Starred by ${by} (${total} total)`;
    return "Received a star";
  }
  if (action === "github_forked") {
    const by = details?.by as string;
    if (by) return `Forked by ${by}`;
    return "Repository forked";
  }

  return action;
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ActivityTimeline({ projectId, hasApiKey }: ActivityTimelineProps) {
  const [activity, setActivity] = useState<ApiActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getAllProjectActivity(projectId, 30).then((result) => {
      if (result.activity) {
        setActivity(result.activity);
      }
      setIsLoading(false);
    });
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-pulse text-muted-foreground">Loading activity...</div>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground/60">
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No activity yet</p>
        <p className="text-xs mt-1">Activity will appear when you or AI makes changes</p>
      </div>
    );
  }

  const displayedActivity = isExpanded ? activity : activity.slice(0, 5);
  const hasMore = activity.length > 5;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {displayedActivity.map((log, index) => {
          const actionType = log.action.startsWith("update") ? "update" : log.action;
          const Icon = actionIcons[actionType] || Activity;
          const colorClass = actionColors[actionType] || "text-muted-foreground bg-muted";
          const isUserAction = log.user_agent === "VibeShip User";
          const details = log.details as Record<string, unknown> | null;

          // For status changes, use the status-specific icon
          let StatusIcon = Icon;
          if (log.action === "status_changed" && details?.status) {
            StatusIcon = statusIcons[details.status as string] || RefreshCw;
          }

          return (
            <div
              key={log.id}
              className={cn(
                "flex items-start gap-3 py-2 px-3 rounded-lg transition-colors",
                "hover:bg-muted/50",
                index === 0 && "bg-muted/30"
              )}
            >
              <div className={cn("p-1.5 rounded-md", colorClass)}>
                <StatusIcon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {formatAction(log.action, details)}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(log.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    {isUserAction ? (
                      <>
                        <User className="h-3 w-3" />
                        You
                      </>
                    ) : log.user_agent === "GitHub Webhook" ? (
                      <>
                        <Webhook className="h-3 w-3" />
                        GitHub
                      </>
                    ) : log.user_agent ? (
                      <>
                        <Bot className="h-3 w-3" />
                        {log.user_agent.includes("Claude") ? "Claude" :
                         log.user_agent.includes("Cursor") ? "Cursor" :
                         log.user_agent.split("/")[0]}
                      </>
                    ) : null}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Show {activity.length - 5} more
            </>
          )}
        </button>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Bot,
  FileText,
  Image,
  Clock,
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
  ArrowRight,
  Star,
  GitFork,
  Webhook,
} from "lucide-react";
import { getRecentActivity } from "@/lib/actions/activity";
import type { ApiActivityLog, Project } from "@/types/database";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const actionIcons: Record<string, React.ElementType> = {
  read: FileText,
  update: FileText,
  upload_screenshot: Image,
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
  read: "text-blue-500 bg-blue-500/10",
  update: "text-status-shipped bg-status-shipped/10",
  upload_screenshot: "text-purple-500 bg-purple-500/10",
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
  if (action === "read") return "read context";
  if (action.startsWith("update_")) {
    const fields = action.replace("update_", "").split("_");
    return `updated ${fields.join(", ")}`;
  }
  if (action === "upload_screenshot") return "uploaded screenshot";
  if (action === "project_created") {
    const source = details?.source;
    if (source === "github_import") return "imported from GitHub";
    return "created";
  }
  if (action === "status_changed") {
    const status = details?.status as string;
    if (status) {
      const statusLabels: Record<string, string> = {
        active: "active",
        paused: "paused",
        graveyard: "graveyard",
        shipped: "shipped",
      };
      return `marked as ${statusLabels[status] || status}`;
    }
    return "status changed";
  }
  if (action === "notes_updated") return "notes updated";
  if (action === "screenshot_uploaded") return "screenshot uploaded";
  if (action === "visibility_changed") {
    const isPublic = details?.is_public;
    return isPublic ? "made public" : "made private";
  }
  if (action === "github_synced") return "synced with GitHub";
  if (action === "tags_updated") return "tags updated";
  if (action === "project_edited") return "updated";

  // GitHub webhook actions
  if (action === "github_push") {
    const commitCount = details?.commit_count as number;
    if (commitCount) return `received ${commitCount} commit${commitCount > 1 ? "s" : ""}`;
    return "received new commits";
  }
  if (action === "github_release") {
    const tag = details?.tag as string;
    if (tag) return `released ${tag}`;
    return "published a release";
  }
  if (action === "github_starred") return "received a star";
  if (action === "github_forked") return "was forked";

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

export function ActivityFeed() {
  const [activity, setActivity] = useState<ApiActivityLog[]>([]);
  const [projects, setProjects] = useState<Pick<Project, "id" | "name" | "slug">[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRecentActivity(15).then((result) => {
      if (result.activity) {
        setActivity(result.activity);
      }
      if (result.projects) {
        setProjects(result.projects);
      }
      setIsLoading(false);
    });
  }, []);

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading activity...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activity.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm mt-1">Start working on your projects to see activity here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {activity.map((log) => {
            const actionType = log.action.startsWith("update") ? "update" : log.action;
            const Icon = actionIcons[actionType] || Activity;
            const colorClass = actionColors[actionType] || "text-muted-foreground bg-muted";
            const isUserAction = log.user_agent === "VibeShip User";
            const details = log.details as Record<string, unknown> | null;
            const projectName = getProjectName(log.project_id);

            let StatusIcon = Icon;
            if (log.action === "status_changed" && details?.status) {
              StatusIcon = statusIcons[details.status as string] || RefreshCw;
            }

            return (
              <Link
                key={log.id}
                href={`/projects/${log.project_id}`}
                className={cn(
                  "flex items-start gap-3 py-2 px-3 rounded-lg transition-colors",
                  "hover:bg-muted/50 group"
                )}
              >
                <div className={cn("p-1.5 rounded-md flex-shrink-0", colorClass)}>
                  <StatusIcon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {projectName}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      {formatAction(log.action, details)}
                    </span>
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
                          AI
                        </>
                      ) : null}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Activity, Bot, FileText, Image, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { getProjectActivity } from "@/lib/actions/api-keys";
import type { ApiActivityLog } from "@/types/database";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  projectId: string;
  hasApiKey: boolean;
}

const actionIcons: Record<string, React.ElementType> = {
  read: FileText,
  update: FileText,
  upload_screenshot: Image,
};

const actionColors: Record<string, string> = {
  read: "text-blue-500 bg-blue-500/10",
  update: "text-status-shipped bg-status-shipped/10",
  upload_screenshot: "text-purple-500 bg-purple-500/10",
};

function formatAction(action: string): string {
  if (action === "read") return "Read project context";
  if (action.startsWith("update_")) {
    const fields = action.replace("update_", "").split("_");
    return `Updated ${fields.join(", ")}`;
  }
  if (action === "upload_screenshot") return "Uploaded screenshot";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (hasApiKey && !hasLoaded) {
      setIsLoading(true);
      getProjectActivity(projectId, 20).then((result) => {
        if (result.activity) {
          setActivity(result.activity);
        }
        setIsLoading(false);
        setHasLoaded(true);
      });
    }
  }, [projectId, hasApiKey, hasLoaded]);

  if (!hasApiKey) {
    return (
      <div className="text-center py-6 text-muted-foreground/60">
        <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Enable AI integration to track activity</p>
      </div>
    );
  }

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
        <p className="text-sm">No AI activity yet</p>
        <p className="text-xs mt-1">Activity will appear when AI reads or updates this project</p>
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
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {formatAction(log.action)}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(log.created_at)}
                  </span>
                  {log.user_agent && (
                    <span className="truncate max-w-[150px]" title={log.user_agent}>
                      {log.user_agent.includes("Claude") ? "Claude" :
                       log.user_agent.includes("Cursor") ? "Cursor" :
                       log.user_agent.split("/")[0]}
                    </span>
                  )}
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

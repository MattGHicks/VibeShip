"use client";

import { useState } from "react";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import { syncGitHubProject } from "@/lib/actions/github";

interface GitHubSyncButtonProps {
  projectId: string;
  lastSyncedAt: string | null;
}

export function GitHubSyncButton({ projectId, lastSyncedAt }: GitHubSyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus("idle");
    setErrorMessage(null);

    const result = await syncGitHubProject(projectId);

    setIsSyncing(false);

    if (result.error) {
      setSyncStatus("error");
      setErrorMessage(result.error);
      // Reset error state after 5 seconds
      setTimeout(() => {
        setSyncStatus("idle");
        setErrorMessage(null);
      }, 5000);
    } else {
      setSyncStatus("success");
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSyncStatus("idle");
      }, 3000);
    }
  };

  const formatLastSynced = (dateStr: string | null) => {
    if (!dateStr) return "Never synced";

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {formatLastSynced(lastSyncedAt)}
        </span>
        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className={`flex items-center gap-1 text-xs transition-colors ${
            syncStatus === "success"
              ? "text-emerald-500"
              : syncStatus === "error"
              ? "text-destructive"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Syncing</span>
            </>
          ) : syncStatus === "success" ? (
            <>
              <Check className="h-3 w-3" />
              <span>Synced</span>
            </>
          ) : syncStatus === "error" ? (
            <>
              <AlertCircle className="h-3 w-3" />
              <span>Failed</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3" />
              <span>Sync</span>
            </>
          )}
        </button>
      </div>
      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

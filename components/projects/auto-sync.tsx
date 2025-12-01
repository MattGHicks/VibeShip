"use client";

import { useEffect, useRef } from "react";
import { syncGitHubProject } from "@/lib/actions/github";

interface AutoSyncProps {
  projectId: string;
  lastSyncedAt: string | null;
  enabled?: boolean; // Whether autosync is enabled for this project
  staleAfterMs?: number; // Default 1 hour
}

export function AutoSync({
  projectId,
  lastSyncedAt,
  enabled = true,
  staleAfterMs = 3600000
}: AutoSyncProps) {
  const hasSynced = useRef(false);

  useEffect(() => {
    // Skip if autosync is disabled or already synced this mount
    if (!enabled || hasSynced.current) return;

    const isStale = !lastSyncedAt ||
      (Date.now() - new Date(lastSyncedAt).getTime()) > staleAfterMs;

    if (isStale) {
      hasSynced.current = true;
      // Sync in background - don't await, let it happen silently
      syncGitHubProject(projectId).catch(() => {
        // Silently fail - user can manually sync if needed
      });
    }
  }, [projectId, lastSyncedAt, staleAfterMs, enabled]);

  // This component renders nothing - it's just for the side effect
  return null;
}

"use server";

import { createClient } from "@/lib/supabase/server";
import type { ApiActivityLogInsert, ApiActivityLog, Project, Json } from "@/types/database";

// Activity types for user-initiated actions
export type UserActivityAction =
  | "project_created"
  | "status_changed"
  | "notes_updated"
  | "screenshot_uploaded"
  | "visibility_changed"
  | "github_synced"
  | "tags_updated"
  | "project_edited";

/**
 * Log a user-initiated activity on a project.
 * Uses the same api_activity_log table but with user_agent = "VibeShip User"
 */
export async function logUserActivity(
  projectId: string,
  action: UserActivityAction,
  details?: Record<string, unknown>
) {
  const supabase = await createClient();

  const logEntry: ApiActivityLogInsert = {
    project_id: projectId,
    action,
    details: (details as Json) || null,
    ip_address: null, // Not tracking for user actions
    user_agent: "VibeShip User", // Distinguishes from AI/API activity
  };

  const { error } = await supabase.from("api_activity_log").insert(logEntry);

  if (error) {
    console.error("Failed to log activity:", error);
  }

  // Also update last_activity_at on the project
  await supabase
    .from("projects")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", projectId);
}

/**
 * Get recent activity across all user's projects for dashboard feed
 */
export async function getRecentActivity(limit: number = 20) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's project IDs first
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, slug")
    .eq("user_id", user.id);

  if (!projects || projects.length === 0) {
    return { activity: [], projects: [] };
  }

  const projectIds = projects.map((p) => p.id);

  // Fetch activity for all user's projects
  const { data: activity, error } = await supabase
    .from("api_activity_log")
    .select("*")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message };
  }

  return {
    activity: activity as ApiActivityLog[],
    projects: projects as Pick<Project, "id" | "name" | "slug">[],
  };
}

/**
 * Get all activity (both user and API) for a specific project
 */
export async function getAllProjectActivity(projectId: string, limit: number = 50) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return { error: "Project not found or not authorized" };
  }

  // Fetch all activity
  const { data: activity, error } = await supabase
    .from("api_activity_log")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message };
  }

  return { activity: activity as ApiActivityLog[] };
}

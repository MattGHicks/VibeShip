"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

function generateApiKey(): string {
  // Format: vs_[32 random hex chars] = 35 chars total
  return `vs_${crypto.randomBytes(16).toString("hex")}`;
}

export async function generateProjectApiKey(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify the user owns this project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return { error: "Project not found" };
  }

  if (project.user_id !== user.id) {
    return { error: "Not authorized" };
  }

  // Generate new API key
  const apiKey = generateApiKey();

  // Store in database
  const { error } = await supabase
    .from("projects")
    .update({ api_key: apiKey })
    .eq("id", projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);

  // Return the key - this is the only time it will be visible in full
  return { apiKey };
}

export async function revokeProjectApiKey(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Set api_key to null (user must own project due to RLS)
  const { error } = await supabase
    .from("projects")
    .update({ api_key: null })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function getProjectActivity(projectId: string, limit: number = 10) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify ownership (RLS will also enforce this)
  const { data: project } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return { error: "Project not found or not authorized" };
  }

  // Fetch activity logs
  const { data: activity, error } = await supabase
    .from("api_activity_log")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message };
  }

  return { activity };
}

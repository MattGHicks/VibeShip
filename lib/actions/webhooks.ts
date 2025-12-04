"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Toggle GitHub webhook tracking for a project.
 * Note: Users still need to manually configure the webhook in their GitHub repo settings.
 */
export async function toggleGitHubWebhook(projectId: string, enabled: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify the project exists and has a GitHub repo connected
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, user_id, github_repo_id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return { error: "Project not found" };
  }

  if (project.user_id !== user.id) {
    return { error: "Not authorized" };
  }

  if (!project.github_repo_id) {
    return { error: "Project is not connected to a GitHub repository" };
  }

  // Update the webhook enabled status
  const { error } = await supabase
    .from("projects")
    .update({
      github_webhook_enabled: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);

  return { success: true, enabled };
}

/**
 * Get the webhook URL for a project.
 * This is the URL users should configure in their GitHub repo settings.
 */
export async function getWebhookUrl(): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "https://vibe-ship.vercel.app";

  return `${baseUrl}/api/webhooks/github`;
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ProjectLink } from "@/types/database";

export async function getProjectLinks(projectId: string): Promise<ProjectLink[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("project_links")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  return (data as ProjectLink[]) || [];
}

export async function addProjectLink(projectId: string, title: string, url: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get the max sort_order for this project
  const { data: existing } = await supabase
    .from("project_links")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from("project_links")
    .insert({
      project_id: projectId,
      title,
      url,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { link: data as ProjectLink };
}

export async function updateProjectLink(
  linkId: string,
  projectId: string,
  updates: { title?: string; url?: string }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("project_links")
    .update(updates)
    .eq("id", linkId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteProjectLink(linkId: string, projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("project_links")
    .delete()
    .eq("id", linkId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

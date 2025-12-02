"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ProjectChecklist } from "@/types/database";

export async function getProjectChecklist(projectId: string): Promise<ProjectChecklist[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("project_checklist")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  return (data as ProjectChecklist[]) || [];
}

export async function addChecklistItem(projectId: string, content: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get the max sort_order for this project
  const { data: existing } = await supabase
    .from("project_checklist")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from("project_checklist")
    .insert({
      project_id: projectId,
      content,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { item: data as ProjectChecklist };
}

export async function updateChecklistItem(
  itemId: string,
  projectId: string,
  updates: { content?: string; is_completed?: boolean }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updateData: Record<string, unknown> = { ...updates };
  if (updates.is_completed !== undefined) {
    updateData.completed_at = updates.is_completed ? new Date().toISOString() : null;
  }

  const { error } = await supabase
    .from("project_checklist")
    .update(updateData)
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteChecklistItem(itemId: string, projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("project_checklist")
    .delete()
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

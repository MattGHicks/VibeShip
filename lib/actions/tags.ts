"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ProjectTag, TagCatalog } from "@/types/database";

export type TagType = "model" | "framework" | "tool";

export async function getTagsCatalog() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags_catalog")
    .select("*")
    .order("name");

  if (error) {
    return { error: error.message, data: null };
  }

  return { data: data as TagCatalog[], error: null };
}

export async function getProjectTags(projectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("project_tags")
    .select("*")
    .eq("project_id", projectId);

  if (error) {
    return { error: error.message, data: null };
  }

  return { data: data as ProjectTag[], error: null };
}

export async function updateProjectTags(
  projectId: string,
  tags: { tag_type: TagType; tag_value: string }[]
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify user owns the project
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return { error: "Project not found or access denied" };
  }

  // Delete existing tags
  await supabase.from("project_tags").delete().eq("project_id", projectId);

  // Insert new tags
  if (tags.length > 0) {
    const { error } = await supabase.from("project_tags").insert(
      tags.map((tag) => ({
        project_id: projectId,
        tag_type: tag.tag_type,
        tag_value: tag.tag_value,
      }))
    );

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function addTagToCatalog(name: string, type: TagType) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if tag already exists
  const { data: existing } = await supabase
    .from("tags_catalog")
    .select("id")
    .eq("name", name)
    .single();

  if (existing) {
    return { data: existing, error: null };
  }

  const { data, error } = await supabase
    .from("tags_catalog")
    .insert({ name, type })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { data: data as TagCatalog, error: null };
}

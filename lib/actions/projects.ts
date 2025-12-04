"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProjectStatus } from "@/types/database";
import { logUserActivity } from "./activity";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export type ProjectFormData = {
  name: string;
  description?: string;
  status: ProjectStatus;
  is_public: boolean;
  github_repo_url?: string;
  live_url?: string;
  screenshot_url?: string | null;
  where_i_left_off?: string;
  lessons_learned?: string;
  target_ship_date?: string | null;
};

export async function createProject(data: ProjectFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Generate a unique slug
  let slug = slugify(data.name);
  let counter = 0;

  // Check if slug exists and make it unique if needed
  while (true) {
    const checkSlug = counter === 0 ? slug : `${slug}-${counter}`;
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id)
      .eq("slug", checkSlug)
      .single();

    if (!existing) {
      slug = checkSlug;
      break;
    }
    counter++;
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: data.name,
      slug,
      description: data.description || null,
      status: data.status,
      is_public: data.is_public,
      github_repo_url: data.github_repo_url || null,
      live_url: data.live_url || null,
      screenshot_url: data.screenshot_url || null,
      where_i_left_off: data.where_i_left_off || null,
      lessons_learned: data.lessons_learned || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Log project creation activity
  await logUserActivity(project.id, "project_created", {
    name: data.name,
    status: data.status,
  });

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(id: string, data: Partial<ProjectFormData>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("projects")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Log activity based on what was updated
  const updatedFields = Object.keys(data);
  if (updatedFields.includes("where_i_left_off") || updatedFields.includes("lessons_learned")) {
    await logUserActivity(id, "notes_updated", { fields: updatedFields });
  } else if (updatedFields.length > 0) {
    await logUserActivity(id, "project_edited", { fields: updatedFields });
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);

  return { success: true };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProjectStatus(id: string, status: ProjectStatus) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("projects")
    .update({
      status,
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Log status change activity
  await logUserActivity(id, "status_changed", { status });

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);

  return { success: true };
}

export async function toggleProjectVisibility(id: string, isPublic: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("projects")
    .update({
      is_public: isPublic,
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Log visibility change activity
  await logUserActivity(id, "visibility_changed", {
    is_public: isPublic,
  });

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/discover");

  return { success: true, isPublic };
}

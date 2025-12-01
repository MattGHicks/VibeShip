"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadScreenshot(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const file = formData.get("file") as File;
  const projectId = formData.get("projectId") as string;

  if (!file) {
    return { error: "No file provided" };
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image." };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: "File too large. Maximum size is 5MB." };
  }

  // Generate unique filename
  const ext = file.name.split(".").pop();
  const fileName = `${user.id}/${projectId || "temp"}/${Date.now()}.${ext}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("screenshots")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { error: "Failed to upload screenshot. Please try again." };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("screenshots")
    .getPublicUrl(uploadData.path);

  return { url: publicUrl };
}

export async function updateProjectScreenshot(projectId: string, screenshotUrl: string | null) {
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
      screenshot_url: screenshotUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);

  return { success: true };
}

export async function deleteScreenshot(projectId: string, screenshotUrl: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Extract file path from URL
  const urlParts = screenshotUrl.split("/screenshots/");
  if (urlParts.length < 2) {
    return { error: "Invalid screenshot URL" };
  }
  const filePath = urlParts[1];

  // Delete from storage
  const { error: deleteError } = await supabase.storage
    .from("screenshots")
    .remove([filePath]);

  if (deleteError) {
    console.error("Delete error:", deleteError);
    return { error: "Failed to delete screenshot" };
  }

  // Update project to remove screenshot URL
  const { error: updateError } = await supabase
    .from("projects")
    .update({
      screenshot_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);

  return { success: true };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  private: boolean;
}

export async function getGitHubRepos() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get GitHub access token from user profile
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("github_access_token")
    .eq("id", user.id)
    .single();

  if (userError || !userData?.github_access_token) {
    return { error: "GitHub account not connected. Please reconnect your GitHub account." };
  }

  try {
    // Fetch repos from GitHub API
    const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: {
        Authorization: `Bearer ${userData.github_access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "GitHub token expired. Please reconnect your GitHub account." };
      }
      return { error: "Failed to fetch repositories from GitHub." };
    }

    const repos: GitHubRepo[] = await response.json();

    // Get existing imported repos to mark them
    const { data: existingProjects } = await supabase
      .from("projects")
      .select("github_repo_id")
      .eq("user_id", user.id);

    const importedRepoIds = new Set(
      existingProjects?.map((p) => p.github_repo_id).filter(Boolean) || []
    );

    return {
      repos: repos.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        homepage: repo.homepage,
        stars: repo.stargazers_count,
        language: repo.language,
        updatedAt: repo.updated_at,
        isPrivate: repo.private,
        isImported: importedRepoIds.has(repo.id),
      })),
    };
  } catch {
    return { error: "Failed to connect to GitHub. Please try again." };
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export async function importGitHubRepo(repoId: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get GitHub access token
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("github_access_token")
    .eq("id", user.id)
    .single();

  if (userError || !userData?.github_access_token) {
    return { error: "GitHub account not connected." };
  }

  // Check if already imported
  const { data: existingProject } = await supabase
    .from("projects")
    .select("id")
    .eq("github_repo_id", repoId)
    .eq("user_id", user.id)
    .single();

  if (existingProject) {
    return { error: "This repository has already been imported." };
  }

  try {
    // Fetch repo details from GitHub
    const response = await fetch(`https://api.github.com/repositories/${repoId}`, {
      headers: {
        Authorization: `Bearer ${userData.github_access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      return { error: "Failed to fetch repository details." };
    }

    const repo: GitHubRepo = await response.json();

    // Generate unique slug
    let slug = slugify(repo.name);
    let counter = 0;

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

    // Create the project
    const { data: project, error: createError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: repo.name,
        slug,
        description: repo.description || null,
        status: "active",
        is_public: !repo.private,
        github_repo_url: repo.html_url,
        github_repo_id: repo.id,
        github_stars: repo.stargazers_count,
        live_url: repo.homepage || null,
      })
      .select()
      .single();

    if (createError) {
      return { error: createError.message };
    }

    // Auto-add language as a tag if present
    if (repo.language) {
      await supabase.from("project_tags").insert({
        project_id: project.id,
        tag_type: "framework",
        tag_value: repo.language,
      });

      // Also add to catalog if not exists
      const { data: existingTag } = await supabase
        .from("tags_catalog")
        .select("id")
        .eq("name", repo.language)
        .eq("type", "framework")
        .single();

      if (!existingTag) {
        await supabase.from("tags_catalog").insert({
          name: repo.language,
          type: "framework",
        });
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath("/import");

    return { project };
  } catch {
    return { error: "Failed to import repository. Please try again." };
  }
}

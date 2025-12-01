import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

// Service role client for API access (bypasses RLS)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fields that AI can update
const ALLOWED_UPDATE_FIELDS = [
  "where_i_left_off",
  "lessons_learned",
  "status",
  "description",
] as const;

const VALID_STATUSES = ["active", "paused", "shipped", "graveyard"] as const;

async function validateApiKey(
  projectId: string,
  authHeader: string | null
): Promise<{ valid: boolean; error?: string }> {
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid Authorization header" };
  }

  const apiKey = authHeader.replace("Bearer ", "");

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, api_key")
    .eq("id", projectId)
    .single();

  if (error || !project) {
    return { valid: false, error: "Project not found" };
  }

  if (!project.api_key || project.api_key !== apiKey) {
    return { valid: false, error: "Invalid API key" };
  }

  return { valid: true };
}

async function logActivity(
  projectId: string,
  action: string,
  details: Record<string, unknown> | null,
  request: NextRequest
) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  await supabase.from("api_activity_log").insert({
    project_id: projectId,
    action,
    details,
    ip_address: ip,
    user_agent: userAgent,
  });
}

// GET: Read project context
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get("Authorization");

  const validation = await validateApiKey(id, authHeader);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 401 });
  }

  // Fetch project data
  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      id, name, slug, description, status,
      where_i_left_off, lessons_learned,
      github_repo_url, live_url,
      github_stars, github_forks, github_open_issues, github_language,
      created_at, updated_at, last_activity_at
    `)
    .eq("id", id)
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch tags
  const { data: tags } = await supabase
    .from("project_tags")
    .select("tag_type, tag_value")
    .eq("project_id", id);

  // Group tags by type
  const groupedTags = {
    models: [] as string[],
    frameworks: [] as string[],
    tools: [] as string[],
  };

  tags?.forEach((tag) => {
    if (tag.tag_type === "model") groupedTags.models.push(tag.tag_value);
    else if (tag.tag_type === "framework") groupedTags.frameworks.push(tag.tag_value);
    else if (tag.tag_type === "tool") groupedTags.tools.push(tag.tag_value);
  });

  // Log the read activity
  await logActivity(id, "read", null, request);

  // Return AI-friendly response format
  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      where_i_left_off: project.where_i_left_off,
      lessons_learned: project.lessons_learned,
      tags: groupedTags,
      links: {
        github: project.github_repo_url,
        live: project.live_url,
      },
      github_stats: {
        stars: project.github_stars,
        forks: project.github_forks,
        open_issues: project.github_open_issues,
        language: project.github_language,
      },
      created_at: project.created_at,
      updated_at: project.updated_at,
      last_activity_at: project.last_activity_at,
    },
  });
}

// PATCH: Update project fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get("Authorization");

  const validation = await validateApiKey(id, authHeader);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 401 });
  }

  // Parse request body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Filter to only allowed fields
  const updates: Record<string, unknown> = {};
  const changedFields: string[] = [];

  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (field in body && body[field] !== undefined) {
      // Validate status if provided
      if (field === "status") {
        if (!VALID_STATUSES.includes(body[field] as typeof VALID_STATUSES[number])) {
          return NextResponse.json(
            { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
            { status: 400 }
          );
        }
      }

      // Validate string fields
      if (field !== "status" && typeof body[field] !== "string" && body[field] !== null) {
        return NextResponse.json(
          { error: `Field "${field}" must be a string or null` },
          { status: 400 }
        );
      }

      updates[field] = body[field];
      changedFields.push(field);
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: `No valid fields to update. Allowed fields: ${ALLOWED_UPDATE_FIELDS.join(", ")}` },
      { status: 400 }
    );
  }

  // Apply updates with timestamps
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("projects")
    .update({
      ...updates,
      updated_at: now,
      last_activity_at: now,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the update activity with details
  await logActivity(
    id,
    `update_${changedFields.join("_")}`,
    { fields: changedFields, values: updates },
    request
  );

  return NextResponse.json({
    success: true,
    updated: changedFields,
    timestamp: now,
  });
}

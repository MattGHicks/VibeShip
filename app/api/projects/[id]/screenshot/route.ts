import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { Database, ApiActivityLogInsert } from "@/types/database";

// Service role client for API access (bypasses RLS)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function validateApiKey(
  projectId: string,
  authHeader: string | null
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid Authorization header" };
  }

  const apiKey = authHeader.replace("Bearer ", "");

  const { data, error } = await supabase
    .from("projects")
    .select("id, api_key, user_id")
    .eq("id", projectId)
    .single();

  const project = data as { id: string; api_key: string | null; user_id: string } | null;

  if (error || !project) {
    return { valid: false, error: "Project not found" };
  }

  if (!project.api_key || project.api_key !== apiKey) {
    return { valid: false, error: "Invalid API key" };
  }

  return { valid: true, userId: project.user_id };
}

async function logActivity(
  projectId: string,
  action: string,
  details: Record<string, unknown> | null,
  request: NextRequest
) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  const logEntry: ApiActivityLogInsert = {
    project_id: projectId,
    action,
    details: details as Database["public"]["Tables"]["api_activity_log"]["Insert"]["details"],
    ip_address: ip,
    user_agent: userAgent,
  };

  // Use type assertion to work around Supabase type inference issues
  await (supabase.from("api_activity_log") as unknown as { insert: (data: ApiActivityLogInsert) => Promise<unknown> }).insert(logEntry);
}

// POST: Upload screenshot from base64
export async function POST(
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
  let body: { image?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { image } = body;
  if (!image) {
    return NextResponse.json({ error: "Missing 'image' field with base64 data" }, { status: 400 });
  }

  // Parse data URL: data:image/png;base64,<data>
  const matches = image.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
  if (!matches) {
    return NextResponse.json(
      { error: "Invalid image format. Expected data:image/<type>;base64,<data>" },
      { status: 400 }
    );
  }

  const imageType = matches[1];
  const base64Data = matches[2];

  // Decode base64
  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64Data, "base64");
  } catch {
    return NextResponse.json({ error: "Invalid base64 encoding" }, { status: 400 });
  }

  // Validate file size
  if (buffer.length > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
      { status: 400 }
    );
  }

  // Generate unique filename
  const ext = imageType === "jpeg" ? "jpg" : imageType;
  const fileName = `${validation.userId}/${id}/${Date.now()}.${ext}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("screenshots")
    .upload(fileName, buffer, {
      contentType: `image/${imageType}`,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Screenshot upload error:", uploadError);
    return NextResponse.json(
      { error: "Failed to upload screenshot" },
      { status: 500 }
    );
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("screenshots")
    .getPublicUrl(uploadData.path);

  // Update project with new screenshot URL
  const now = new Date().toISOString();
  const updatePayload = {
    screenshot_url: publicUrl,
    updated_at: now,
    last_activity_at: now,
  };
  // Use type assertion to work around Supabase type inference issues
  const { error: updateError } = await (supabase
    .from("projects") as unknown as { update: (data: unknown) => { eq: (col: string, val: string) => Promise<{ error: Error | null }> } })
    .update(updatePayload)
    .eq("id", id);

  if (updateError) {
    console.error("Project update error:", updateError);
    return NextResponse.json(
      { error: "Screenshot uploaded but failed to update project" },
      { status: 500 }
    );
  }

  // Log the activity
  await logActivity(
    id,
    "upload_screenshot",
    { size: buffer.length, type: imageType },
    request
  );

  return NextResponse.json({
    success: true,
    screenshot_url: publicUrl,
    size: buffer.length,
    timestamp: now,
  });
}

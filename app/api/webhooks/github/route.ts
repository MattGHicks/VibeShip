import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  verifyWebhookSignature,
  type GitHubWebhookEvent,
  type PushEventPayload,
  type ReleaseEventPayload,
  type StarEventPayload,
  type ForkEventPayload,
} from "@/lib/github-webhook";
import type { ApiActivityLogInsert, Json } from "@/types/database";

// Create a Supabase client with service role for webhook processing
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Log activity for a project
async function logWebhookActivity(
  projectId: string,
  action: string,
  details: Record<string, unknown>
) {
  const supabase = getSupabase();

  const logEntry: ApiActivityLogInsert = {
    project_id: projectId,
    action,
    details: details as Json,
    ip_address: null,
    user_agent: "GitHub Webhook",
  };

  await supabase.from("api_activity_log").insert(logEntry);

  // Update last_activity_at
  await supabase
    .from("projects")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", projectId);
}

// Update GitHub stats for a project
async function updateGitHubStats(
  projectId: string,
  stars: number,
  forks: number,
  openIssues: number
) {
  const supabase = getSupabase();

  await supabase
    .from("projects")
    .update({
      github_stars: stars,
      github_forks: forks,
      github_open_issues: openIssues,
      github_synced_at: new Date().toISOString(),
    })
    .eq("id", projectId);
}

export async function POST(request: NextRequest) {
  try {
    // Get the webhook secret
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("GITHUB_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    // Get the raw body for signature verification
    const rawBody = await request.text();

    // Verify signature
    const signature = request.headers.get("X-Hub-Signature-256");
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse the payload
    const payload = JSON.parse(rawBody);

    // Get the event type
    const event = request.headers.get("X-GitHub-Event") as GitHubWebhookEvent;
    if (!event) {
      return NextResponse.json(
        { error: "Missing event type" },
        { status: 400 }
      );
    }

    // Get the repository ID from the payload
    const repoId = payload.repository?.id;
    if (!repoId) {
      return NextResponse.json(
        { error: "Missing repository ID" },
        { status: 400 }
      );
    }

    // Find projects linked to this repository
    const supabase = getSupabase();
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, github_webhook_enabled")
      .eq("github_repo_id", repoId);

    if (projectsError) {
      console.error("Error finding projects:", projectsError);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    if (!projects || projects.length === 0) {
      // No projects linked to this repo, that's okay
      return NextResponse.json({ message: "No linked projects" });
    }

    // Filter to only projects with webhooks enabled
    const enabledProjects = projects.filter((p) => p.github_webhook_enabled);

    if (enabledProjects.length === 0) {
      return NextResponse.json({ message: "No projects with webhooks enabled" });
    }

    // Process the event for each enabled project
    const results = await Promise.all(
      enabledProjects.map(async (project) => {
        try {
          switch (event) {
            case "push": {
              const pushPayload = payload as PushEventPayload;
              const commitCount = pushPayload.commits?.length || 0;
              const branch = pushPayload.ref?.replace("refs/heads/", "") || "unknown";

              await logWebhookActivity(project.id, "github_push", {
                branch,
                commit_count: commitCount,
                commits: pushPayload.commits?.slice(0, 3).map((c) => ({
                  message: c.message.split("\n")[0], // First line only
                  author: c.author.name,
                })),
                pusher: pushPayload.pusher?.name,
              });
              break;
            }

            case "release": {
              const releasePayload = payload as ReleaseEventPayload;
              if (releasePayload.action === "published") {
                await logWebhookActivity(project.id, "github_release", {
                  tag: releasePayload.release?.tag_name,
                  name: releasePayload.release?.name,
                  url: releasePayload.release?.html_url,
                });
              }
              break;
            }

            case "star": {
              const starPayload = payload as StarEventPayload;
              await updateGitHubStats(
                project.id,
                starPayload.repository.stargazers_count,
                starPayload.repository.forks_count,
                starPayload.repository.open_issues_count
              );

              if (starPayload.action === "created") {
                await logWebhookActivity(project.id, "github_starred", {
                  by: starPayload.sender?.login,
                  total_stars: starPayload.repository.stargazers_count,
                });
              }
              break;
            }

            case "fork": {
              const forkPayload = payload as ForkEventPayload;
              await updateGitHubStats(
                project.id,
                forkPayload.repository.stargazers_count,
                forkPayload.repository.forks_count,
                forkPayload.repository.open_issues_count
              );

              await logWebhookActivity(project.id, "github_forked", {
                by: forkPayload.sender?.login,
                fork_url: forkPayload.forkee?.html_url,
                total_forks: forkPayload.repository.forks_count,
              });
              break;
            }

            case "issues":
            case "pull_request": {
              // Update issue count
              await updateGitHubStats(
                project.id,
                payload.repository.stargazers_count,
                payload.repository.forks_count,
                payload.repository.open_issues_count
              );
              break;
            }

            default:
              // Unhandled event type, that's okay
              break;
          }

          return { projectId: project.id, success: true };
        } catch (err) {
          console.error(`Error processing webhook for project ${project.id}:`, err);
          return { projectId: project.id, success: false, error: String(err) };
        }
      })
    );

    return NextResponse.json({
      message: "Webhook processed",
      event,
      results,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GitHub sends a ping event when webhook is first set up
export async function GET() {
  return NextResponse.json({ message: "GitHub webhook endpoint active" });
}

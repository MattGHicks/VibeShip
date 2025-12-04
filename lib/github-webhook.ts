import crypto from "crypto";

/**
 * Verify GitHub webhook signature
 * GitHub sends a signature in the X-Hub-Signature-256 header
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  const expectedSignature = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(payload, "utf-8")
    .digest("hex")}`;

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * GitHub webhook event types we care about
 */
export type GitHubWebhookEvent =
  | "push"
  | "release"
  | "star"
  | "fork"
  | "issues"
  | "pull_request";

/**
 * Common payload fields from GitHub webhooks
 */
export interface GitHubWebhookPayload {
  action?: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
  };
  sender: {
    login: string;
    avatar_url: string;
  };
}

/**
 * Push event payload
 */
export interface PushEventPayload extends GitHubWebhookPayload {
  ref: string;
  before: string;
  after: string;
  commits: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
    url: string;
    timestamp: string;
  }>;
  pusher: {
    name: string;
    email: string;
  };
}

/**
 * Release event payload
 */
export interface ReleaseEventPayload extends GitHubWebhookPayload {
  action: "published" | "created" | "edited" | "deleted";
  release: {
    id: number;
    tag_name: string;
    name: string;
    body: string;
    html_url: string;
    published_at: string;
  };
}

/**
 * Star event payload
 */
export interface StarEventPayload extends GitHubWebhookPayload {
  action: "created" | "deleted";
  starred_at: string | null;
}

/**
 * Fork event payload
 */
export interface ForkEventPayload extends GitHubWebhookPayload {
  forkee: {
    id: number;
    full_name: string;
    html_url: string;
  };
}

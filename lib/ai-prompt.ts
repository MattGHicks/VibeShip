import type { Project } from "@/types/database";

interface ProjectTag {
  tag_type: "model" | "framework" | "tool";
  tag_value: string;
}

interface GeneratePromptOptions {
  project: Project;
  tags: ProjectTag[];
  apiKey: string;
  baseUrl: string;
}

// ============================================================================
// BOOTSTRAP PROMPT - The ONE prompt users copy (always current!)
// ============================================================================
// This is tiny and stable. AI fetches latest instructions from hosted URL.

export function generateBootstrapPrompt(options: {
  projectName: string;
  baseUrl: string;
}): string {
  const { projectName, baseUrl } = options;

  return `# VibeShip: ${projectName}

Fetch instructions: ${baseUrl}/static/ai-instructions.md
Then read \`.vibe/vibeship.md\` for project context.
Source \`.vibe/.secrets\` for API credentials.`;
}

// ============================================================================
// VIBESHIP.MD - Project context (local file, changes often)
// ============================================================================

export function generateVibeshipMd(options: {
  project: Project;
  tags: ProjectTag[];
  baseUrl: string;
}): string {
  const { project, tags, baseUrl } = options;
  const projectUrl = `${baseUrl}/projects/${project.id}`;

  const models = tags.filter((t) => t.tag_type === "model").map((t) => t.tag_value);
  const frameworks = tags.filter((t) => t.tag_type === "framework").map((t) => t.tag_value);
  const tools = tags.filter((t) => t.tag_type === "tool").map((t) => t.tag_value);

  const statusDescriptions: Record<string, string> = {
    active: "Currently being actively developed",
    paused: "Development temporarily paused",
    shipped: "Project is complete and live",
    graveyard: "Project has been abandoned/archived",
  };

  return `# VibeShip Project Context

> Last synced: ${new Date().toISOString()}

## Project: ${project.name}

| Field | Value |
|-------|-------|
| **ID** | ${project.id} |
| **Status** | ${project.status} (${statusDescriptions[project.status]}) |
| **VibeShip** | ${projectUrl} |
| **GitHub** | ${project.github_repo_url || "Not linked"} |
| **Live** | ${project.live_url || "Not deployed"} |

## Description

${project.description || "_Not set - run initial setup to populate_"}

## Where I Left Off

${project.where_i_left_off || "_Not documented yet_"}

## Lessons Learned

${project.lessons_learned || "_None documented yet_"}

## Tech Stack

${models.length > 0 ? `- **AI Models:** ${models.join(", ")}` : "- AI Models: Not specified"}
${frameworks.length > 0 ? `- **Frameworks:** ${frameworks.join(", ")}` : "- Frameworks: Not specified"}
${tools.length > 0 ? `- **Tools:** ${tools.join(", ")}` : "- Tools: Not specified"}
`;
}

// ============================================================================
// .SECRETS - API credentials (never committed)
// ============================================================================

export function generateSecretsMd(options: {
  projectId: string;
  apiKey: string;
  baseUrl: string;
}): string {
  const { projectId, apiKey, baseUrl } = options;
  const endpoint = `${baseUrl}/api/projects/${projectId}`;

  return `# VibeShip API credentials - DO NOT COMMIT THIS FILE
# This file should be in .gitignore

export VIBESHIP_PROJECT_ID="${projectId}"
export VIBESHIP_API_KEY="${apiKey}"
export VIBESHIP_ENDPOINT="${endpoint}"
`;
}

// ============================================================================
// FULL SETUP PROMPT - For initial .vibe/ folder creation
// ============================================================================

export function generateAiContextPrompt({
  project,
  tags,
  apiKey,
  baseUrl,
}: GeneratePromptOptions): string {
  const bootstrap = generateBootstrapPrompt({ projectName: project.name, baseUrl });
  const vibeshipMd = generateVibeshipMd({ project, tags, baseUrl });
  const secrets = generateSecretsMd({ projectId: project.id, apiKey, baseUrl });

  const needsSetup = !project.description || !project.where_i_left_off || !project.screenshot_url;

  return `${bootstrap}

---

## Setup: Create .vibe/ Folder

${needsSetup ? "**This project needs initial setup.** " : ""}Run these commands:

\`\`\`bash
# 1. Add .secrets to gitignore
grep -q ".vibe/.secrets" .gitignore 2>/dev/null || echo ".vibe/.secrets" >> .gitignore

# 2. Create .vibe folder with context and credentials
mkdir -p .vibe

cat > .vibe/vibeship.md << 'EOF'
${vibeshipMd}
EOF

cat > .vibe/.secrets << 'EOF'
${secrets}
EOF

chmod 600 .vibe/.secrets
\`\`\`

---

After creating files: **"Created .vibe/ folder. vibeship.md can be committed - .secrets is gitignored."**

${needsSetup ? `Then run the **Initial Setup** from the fetched instructions to populate project context.` : `Then read .vibe/vibeship.md and ask what to work on today.`}`;
}

export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return apiKey;
  return `${apiKey.slice(0, 6)}${"•".repeat(6)}`;
}

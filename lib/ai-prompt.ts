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
// BOOTSTRAP PROMPT - What the user copies (tiny!)
// ============================================================================

export function generateBootstrapPrompt(projectName: string): string {
  return `# VibeShip: ${projectName}

Read the \`.vibe/\` folder in this project for context and instructions.

1. **Read** \`.vibe/INSTRUCTIONS.md\` for how to work with VibeShip
2. **Read** \`.vibe/vibeship.md\` for current project context
3. **Source** \`.vibe/.secrets\` has API credentials (never commit)

Start by reading these files, then ask what to work on today.`;
}

// ============================================================================
// INSTRUCTIONS.md - Standardized behavior (rarely changes)
// ============================================================================

export function generateInstructionsMd(options: {
  projectId: string;
  baseUrl: string;
  projectName: string;
  repoIdentifier: string | null;
}): string {
  const { projectId, baseUrl, projectName, repoIdentifier } = options;
  const endpoint = `${baseUrl}/api/projects/${projectId}`;
  const screenshotEndpoint = `${baseUrl}/api/projects/${projectId}/screenshot`;
  const projectUrl = `${baseUrl}/projects/${projectId}`;

  return `# VibeShip AI Instructions

> These instructions tell AI tools how to work with VibeShip for this project.
> **Do not edit manually** - regenerate from VibeShip if needed.

## Your Role

You are helping a vibe coder work on **${projectName}**. VibeShip tracks progress so they never lose context between sessions. Your role: help them build, keep context synced, and encourage shipping!

---

## Session Start Checklist

Every session, do these checks:

### 1. Verify Correct Folder
${repoIdentifier ? `\`\`\`bash
git remote get-url origin 2>/dev/null | grep -q "${repoIdentifier}" && echo "✓ Correct folder" || echo "⚠ WARNING: Wrong folder"
\`\`\`` : "Check that you're in the right project directory."}

### 2. Read Current Context
\`\`\`bash
cat .vibe/vibeship.md
\`\`\`

### 3. Check if Setup Needed
If \`vibeship.md\` shows empty fields (description, where_i_left_off), run the Initial Setup flow below.

---

## API Reference

**Endpoint:** \`${endpoint}\`
**Screenshot:** \`${screenshotEndpoint}\`
**Project URL:** ${projectUrl}

### Read Project
\`\`\`bash
source .vibe/.secrets
curl -X GET "$VIBESHIP_ENDPOINT" -H "Authorization: Bearer $VIBESHIP_API_KEY"
\`\`\`

### Update Project
\`\`\`bash
source .vibe/.secrets
curl -X PATCH "$VIBESHIP_ENDPOINT" \\
  -H "Authorization: Bearer $VIBESHIP_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "where_i_left_off": "Your progress notes here",
    "lessons_learned": "What you learned",
    "tags": [{"tag_type": "framework", "tag_value": "Next.js"}]
  }'
\`\`\`

### Upload Screenshot
\`\`\`bash
source .vibe/.secrets
# Capture screenshot
screencapture -x /tmp/vibeship_screenshot.png

# Upload (file-based to avoid arg length issues)
printf '{"image": "data:image/png;base64,%s"}' "$(base64 -i /tmp/vibeship_screenshot.png | tr -d '\\n')" > /tmp/screenshot_payload.json
curl -X POST "${screenshotEndpoint}" \\
  -H "Authorization: Bearer $VIBESHIP_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d @/tmp/screenshot_payload.json
\`\`\`

### Writable Fields
- \`description\` (string) - Brief project description
- \`where_i_left_off\` (string) - Current progress and next steps
- \`lessons_learned\` (string) - Insights from the project
- \`status\` (enum) - "active", "paused", "shipped", "graveyard"
- \`tags\` (array) - Tech stack: \`[{tag_type: "model"|"framework"|"tool", tag_value: "Name"}]\`

---

## Initial Setup Flow

Run this if the project hasn't been set up yet:

### Step 1: Analyze Codebase
\`\`\`bash
# Read key files
cat README.md package.json CLAUDE.md 2>/dev/null | head -200
git log --oneline -10
\`\`\`

### Step 2: Auto-Detect Tech Stack

Look for:
- **AI Models:** anthropic, openai imports → Claude, GPT-4
- **Frameworks:** package.json deps → Next.js, React, Tailwind
- **Tools:** config files → Vercel, Supabase, Docker

### Step 3: Capture Screenshot
If dev server running, capture and upload a screenshot.

### Step 4: Update VibeShip
\`\`\`bash
source .vibe/.secrets
curl -X PATCH "$VIBESHIP_ENDPOINT" \\
  -H "Authorization: Bearer $VIBESHIP_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "description": "Your crafted description",
    "where_i_left_off": "Current state and next steps",
    "tags": [{"tag_type": "framework", "tag_value": "Next.js"}]
  }'
\`\`\`

### Step 5: Update Local vibeship.md
After API success, update \`.vibe/vibeship.md\` with the same info.

---

## When to Update VibeShip

### Do Automatically (Silent)
- Read .vibe/vibeship.md at session start

### Offer Proactively
- **After git push:** "Want me to update VibeShip with your progress?"
- **After completing a feature:** "Nice work! Should we log this?"
- **When user says "done" or "stopping":** "Let me save your progress."
- **After fixing a tricky bug:** "Worth adding to lessons learned?"

### On Request Only
- Full project updates
- Status changes
- Screenshot uploads

### Never Do
- Interrupt mid-task to suggest updates
- Nag about incomplete fields
- Update without user confirmation

---

## After Git Push

"Pushed to GitHub! Want me to update VibeShip with your progress?"

If yes:
1. Update progress notes via API
2. Offer to capture fresh screenshot (if UI changed)
3. Update local .vibe/vibeship.md

---

## Shipping Mindset

When user ships (status → shipped):
- Celebrate! "Congrats on shipping! That's what vibe coding is all about."
- Prompt: "Any lessons learned worth capturing?"
- Encourage: "Ready to start the next project?"

Use momentum language:
- "Nice progress!" (not "Task complete")
- "What are we shipping today?" (not "What do you want to do?")
- "Hit a snag - let's work through it" (not "Error occurred")

---

## Guidelines

1. **Read .vibe/ first** - Instant context, works offline
2. **Keep .vibe/ synced** - Update vibeship.md after API calls
3. **Be specific** - Include file names, function names, next steps
4. **Stay concise** - Summaries should be scannable
5. **Encourage shipping** - Celebrate progress, maintain momentum

## Constraints

- Only read/update this specific project
- Cannot create/delete projects
- Cannot modify project name, visibility, or GitHub settings
- Screenshots must be base64 PNG/JPEG under 5MB
- API key stays in .secrets only (never in vibeship.md)
`;
}

// ============================================================================
// VIBESHIP.MD - Project context (changes often)
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
> See INSTRUCTIONS.md for how AI should work with this project.

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
// LEGACY: Full prompt for backwards compatibility
// ============================================================================

export function generateAiContextPrompt({
  project,
  tags,
  apiKey,
  baseUrl,
}: GeneratePromptOptions): string {
  const repoIdentifier = project.github_repo_url
    ? project.github_repo_url.replace(/\.git$/, "").split("/").slice(-2).join("/")
    : null;

  // Generate all three files as a single prompt for initial setup
  const bootstrap = generateBootstrapPrompt(project.name);
  const instructions = generateInstructionsMd({
    projectId: project.id,
    baseUrl,
    projectName: project.name,
    repoIdentifier,
  });
  const vibeshipMd = generateVibeshipMd({ project, tags, baseUrl });
  const secrets = generateSecretsMd({ projectId: project.id, apiKey, baseUrl });

  const needsSetup = !project.description || !project.where_i_left_off || !project.screenshot_url;

  return `${bootstrap}

---

## Setup Required: Create .vibe/ Folder

${needsSetup ? "**This project needs initial setup.** " : ""}Create these files in the project root:

### 1. Add to .gitignore
\`\`\`bash
grep -q ".vibe/.secrets" .gitignore 2>/dev/null || echo ".vibe/.secrets" >> .gitignore
\`\`\`

### 2. Create .vibe/INSTRUCTIONS.md
\`\`\`bash
mkdir -p .vibe
cat > .vibe/INSTRUCTIONS.md << 'INSTRUCTIONS_EOF'
${instructions}
INSTRUCTIONS_EOF
\`\`\`

### 3. Create .vibe/vibeship.md
\`\`\`bash
cat > .vibe/vibeship.md << 'VIBESHIP_EOF'
${vibeshipMd}
VIBESHIP_EOF
\`\`\`

### 4. Create .vibe/.secrets
\`\`\`bash
cat > .vibe/.secrets << 'SECRETS_EOF'
${secrets}
SECRETS_EOF
chmod 600 .vibe/.secrets
\`\`\`

---

After creating files, tell the user: **"Created .vibe/ folder. The vibeship.md and INSTRUCTIONS.md files can be committed - API key is in .secrets which is gitignored."**

${needsSetup ? `
Then run the **Initial Setup Flow** from INSTRUCTIONS.md to populate project context.
` : `
Then read .vibe/vibeship.md and ask what to work on today.
`}`;
}

export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return apiKey;
  return `${apiKey.slice(0, 6)}${"•".repeat(6)}`;
}

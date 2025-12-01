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

export function generateAiContextPrompt({
  project,
  tags,
  apiKey,
  baseUrl,
}: GeneratePromptOptions): string {
  // Group tags by type
  const models = tags.filter((t) => t.tag_type === "model").map((t) => t.tag_value);
  const frameworks = tags.filter((t) => t.tag_type === "framework").map((t) => t.tag_value);
  const tools = tags.filter((t) => t.tag_type === "tool").map((t) => t.tag_value);

  const statusDescriptions: Record<string, string> = {
    active: "Currently being actively developed",
    paused: "Development temporarily paused",
    shipped: "Project is complete and live",
    graveyard: "Project has been abandoned/archived",
  };

  const endpoint = `${baseUrl}/api/projects/${project.id}`;

  return `# Project Context: ${project.name}

You have access to read and update this VibeShip project via API.

## Project Overview
- **Name:** ${project.name}
- **Status:** ${project.status} (${statusDescriptions[project.status]})
- **Description:** ${project.description || "No description"}

## Current Progress
**Where I Left Off:**
${project.where_i_left_off || "_Not yet documented_"}

**Lessons Learned:**
${project.lessons_learned || "_Not yet documented_"}

## Tech Stack
${models.length > 0 ? `- **Models:** ${models.join(", ")}` : ""}
${frameworks.length > 0 ? `- **Frameworks:** ${frameworks.join(", ")}` : ""}
${tools.length > 0 ? `- **Tools:** ${tools.join(", ")}` : ""}

## Links
${project.github_repo_url ? `- **GitHub:** ${project.github_repo_url}` : "- GitHub: Not linked"}
${project.live_url ? `- **Live:** ${project.live_url}` : "- Live: Not deployed"}

---

## API Access

**Endpoint:** ${endpoint}
**API Key:** ${apiKey}

### Read Project Context
\`\`\`bash
curl -X GET "${endpoint}" \\
  -H "Authorization: Bearer ${apiKey}"
\`\`\`

### Update Progress Notes
\`\`\`bash
curl -X PATCH "${endpoint}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"where_i_left_off": "Your progress notes here"}'
\`\`\`

### Update Multiple Fields
\`\`\`bash
curl -X PATCH "${endpoint}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "where_i_left_off": "Completed feature X, next step is Y",
    "lessons_learned": "Discovered that Z works better than W",
    "status": "active"
  }'
\`\`\`

## Writable Fields
- \`where_i_left_off\` (string) - Notes about current progress and next steps
- \`lessons_learned\` (string) - Insights and learnings from the project
- \`description\` (string) - Project description
- \`status\` (enum) - One of: "active", "paused", "shipped", "graveyard"

## Guidelines for AI
1. **Read context first** - Always fetch the latest project state at the start of each session
2. **Update "where_i_left_off"** when you:
   - Complete a significant piece of work
   - Stop mid-task (document what's next)
   - Hit a blocker or need to make a decision
3. **Add to "lessons_learned"** when you discover something worth remembering
4. **Update status** when appropriate:
   - "active" → actively working on it
   - "paused" → stepping away temporarily
   - "shipped" → project is complete
   - "graveyard" → abandoned/archived

## Constraints
- You can ONLY read and update this specific project
- You CANNOT create new projects or delete projects
- You CANNOT modify the project name, visibility, or GitHub settings
`;
}

export function maskApiKey(apiKey: string): string {
  // Show first 6 chars, mask the rest: vs_abc1...
  if (apiKey.length <= 8) return apiKey;
  return `${apiKey.slice(0, 6)}${"•".repeat(6)}`;
}

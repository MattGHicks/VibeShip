# VibeShip Project Context

> Last synced: 2025-12-04T22:55:00Z
> See INSTRUCTIONS.md for how AI should work with this project.

## Project: VibeShip

| Field | Value |
|-------|-------|
| **ID** | a002c296-87b4-4499-88e3-ef52db24b744 |
| **Status** | active (Currently being actively developed) |
| **VibeShip** | https://vibe-ship.vercel.app/projects/a002c296-87b4-4499-88e3-ef52db24b744 |
| **GitHub** | https://github.com/MattGHicks/VibeShip |
| **Live** | https://vibe-ship.vercel.app |

## Description

VibeShip is a project tracker for indie hackers and vibe coders. Import from GitHub, track your progress, and showcase what you've shipped.

## Where I Left Off

Implemented Phase 3 features - Activity & Real-time Features:

### 1. Activity Timeline
- Created `lib/actions/activity.ts` with `logUserActivity()`, `getRecentActivity()`, `getAllProjectActivity()`
- Added activity logging to all project mutations (create, update, status change, visibility)
- Dashboard now shows "Recent Activity" feed across all projects
- Project pages show detailed activity timeline with icons for each action type
- Supports user actions, AI actions, and GitHub webhook events

### 2. Rich Notes (Markdown)
- Installed `react-markdown` and `remark-gfm` packages
- Created `components/ui/markdown-display.tsx` for rendering markdown
- Created `components/ui/markdown-editor.tsx` with Edit/Preview toggle
- "Where I Left Off" and "Lessons Learned" fields now support full markdown
- Inline editing shows rendered markdown in view mode

### 3. GitHub Webhooks (Partial)
- Created `lib/github-webhook.ts` with signature verification
- Created `app/api/webhooks/github/route.ts` to receive webhook events
- Created `lib/actions/webhooks.ts` for toggle functionality
- Created `components/projects/webhook-toggle.tsx` UI component
- Supports push, release, star, and fork events
- **Requires migration**: Run SQL in Supabase dashboard to add columns

### Migration Required
Run this SQL in Supabase SQL Editor:
```sql
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS github_webhook_id bigint,
ADD COLUMN IF NOT EXISTS github_webhook_enabled boolean DEFAULT false;
```

## Next Steps

- [ ] Run webhook migration in Supabase dashboard
- [ ] Add GITHUB_WEBHOOK_SECRET env var in Vercel for production webhooks
- [ ] Test webhook functionality end-to-end
- [ ] Phase 4: Pro features, social features

## Lessons Learned

- Server Actions in Next.js must be async even for simple return statements
- Supabase REST API doesn't expose arbitrary SQL execution - use dashboard SQL Editor for migrations
- When Supabase CLI db push is slow, mark conflicting migrations as "applied" with `supabase migration repair`
- Activity logging pattern: insert to `api_activity_log` + update `last_activity_at` on projects
- Cast `Record<string, unknown>` to Supabase `Json` type to satisfy TypeScript
- GitHub webhook signature uses HMAC SHA-256 with `sha256=` prefix
- `remark-gfm` plugin enables GitHub Flavored Markdown (tables, strikethrough, task lists)

## Tech Stack

- **AI Models:** Claude
- **Frameworks:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Tools:** Supabase, Vercel

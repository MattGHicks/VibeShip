# VibeShip Project Context

> Last synced: 2025-12-02T02:21:00Z
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

Fixed production OAuth and API authentication issues:

**Root Cause:**
- Vercel environment variables weren't properly set for production
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` needed to be re-added in Vercel dashboard
- `SUPABASE_SERVICE_ROLE_KEY` was missing (API returned 500)

**Fixes Applied:**
- Updated Vercel env vars with correct Supabase anon key
- Added `SUPABASE_SERVICE_ROLE_KEY` for API routes
- Excluded `/callback` route from middleware to prevent PKCE interference
- Added `http://localhost:3000/**` to Supabase redirect URLs for local dev
- Cleaned up debug logging from callback route after fixing

**Auth Flow Now Working:**
- Production: https://vibe-ship.vercel.app → GitHub OAuth → dashboard
- Local dev: http://localhost:3000 → GitHub OAuth → localhost dashboard
- API: GET and PATCH operations working for project context sync

All changes pushed and deployed to production.

## Next Steps

- [ ] Test new checklist and resource links features in production
- [ ] Add drag-and-drop reordering for checklist items
- [ ] Continue Phase 2 features (discover page enhancements, social features)

## Lessons Learned

- Combining related UI cards (Links + Resources) reduces visual clutter and makes better use of space
- Extending existing API endpoints (PATCH) is cleaner than creating new endpoints for related operations
- When Supabase CLI is slow/stuck, executing SQL directly in the dashboard SQL Editor is a reliable workaround
- Optimistic UI updates (updating state before server confirms) provide snappier user experience for checklist operations
- shadcn/ui sidebar `collapsible="icon"` mode is better UX than `offcanvas` - keeps navigation visible
- Use `group-data-[collapsible=icon]:` Tailwind prefix for conditional collapsed styles
- Header icons create visual consistency across dashboard pages - follow the pattern established by existing pages
- Vercel env vars must have **Production** checkbox enabled - delete and re-add if values seem correct but auth fails
- Supabase redirect URLs need `http://localhost:3000/**` wildcard for local OAuth to work
- Exclude auth callback routes from middleware to prevent PKCE flow interference
- API routes need `SUPABASE_SERVICE_ROLE_KEY` (not anon key) for database access

## Tech Stack

- **AI Models:** Claude
- **Frameworks:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Tools:** Supabase, Vercel

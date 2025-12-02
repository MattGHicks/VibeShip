# VibeShip Project Context

> Last synced: 2025-12-02T00:44:58Z
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

Shipped major project page enhancements:

**New Features:**
- Next Steps Checklist - add, complete, delete checklist items from project page
- Resource Links - manage project reference docs and links
- Activity Timeline - shows recent API activity for the project
- Ship Date Goal - countdown to target ship date
- Combined Links & Resources card for cleaner layout

**API Enhancements:**
- GET returns next_steps and resource_links arrays
- PATCH supports add_next_step, complete_next_step, delete_next_step, add_resource_link
- AI can now manage checklist and links programmatically

**Database:**
- Added project_checklist and project_links tables with RLS policies

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

## Tech Stack

- **AI Models:** Claude
- **Frameworks:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Tools:** Supabase, Vercel

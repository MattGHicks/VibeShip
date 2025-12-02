# VibeShip Project Context

> Last synced: 2025-12-02T01:30:00Z
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

Fixed auth redirect bug and improved UI consistency across dashboard:

**Auth Fix:**
- Authenticated users now redirect from landing page to dashboard

**UI Consistency Improvements:**
- Added header icons to Dashboard, Projects, New Project, and Import pages
- Dashboard project cards now match Projects page design with screenshots
- Widened New Project page for better form layout

**Sidebar Enhancements:**
- Changed from offcanvas to icon-collapse mode
- Centered icons with proper sizing when collapsed
- Added separators between icon groups (only visible when collapsed)
- All menu items now have tooltips

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

## Tech Stack

- **AI Models:** Claude
- **Frameworks:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Tools:** Supabase, Vercel

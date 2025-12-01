# VibeShip Project Context

> Last synced: 2025-12-01T05:29:00Z
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

Refactored AI prompt system to use cleaner .vibe/ folder architecture:

- **INSTRUCTIONS.md** - Standardized AI behavior (rarely changes)
- **vibeship.md** - Project context (changes often)
- **.secrets** - API credentials (never commit)
- Bootstrap prompt is now tiny - just tells AI to read .vibe/ folder

Also fixed:
- Screenshot uploads now replace existing files (prevents accumulation)
- "Where I Left Off" textarea uses modal for long content
- Cache-busting URLs for screenshot refresh

Next steps:
- Test new prompt structure with fresh AI session
- Consider adding INSTRUCTIONS.md regeneration from UI
- Continue Phase 2 features (discover page, social features)

## Lessons Learned

The AI prompt needs to be extremely detailed and prescriptive - AI tools work best with explicit step-by-step instructions rather than high-level goals. Including verification steps (check git remote, check .vibe/ exists) prevents AI from accidentally setting up the wrong project.

Separating standardized instructions from dynamic context makes the system more maintainable and the bootstrap prompt much smaller to copy.

## Tech Stack

- **AI Models:** Claude
- **Frameworks:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Tools:** Supabase, Vercel

# VibeShip - Project Documentation

## Overview

VibeShip is a web platform for solo vibe coders to track, organize, and share their AI-assisted projects. It helps developers remember where they left off, track project statuses, and showcase shipped work.

**Target Users:** Solo developers who use AI tools (Claude, Cursor, v0, Bolt, etc.) to rapidly prototype and build projects.

**Core Value Prop:** Never lose track of your vibe coding projects again. Know exactly where you left off, showcase what you've shipped, and discover what others are building.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 16 | App Router, Server Components, Server Actions |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS v4 + shadcn/ui | Dark mode default |
| Database | Supabase (PostgreSQL) | Also handles Auth + Storage |
| Auth | Supabase Auth | GitHub OAuth |
| Fonts | Geist Sans & Geist Mono | Google Fonts |
| Hosting | Vercel | Auto-deploy on push |
| Repo | GitHub | CI/CD trigger |

---

## URLs

| Environment | URL |
|-------------|-----|
| **Production** | https://vibe-ship.vercel.app |
| **GitHub Repo** | https://github.com/MattGHicks/VibeShip |
| **Local Dev** | http://localhost:3000 |
| **AI Instructions** | https://vibe-ship.vercel.app/_static/ai-instructions.md |

---

## AI Integration

VibeShip provides API endpoints for AI tools to read/write project context. This enables AI assistants to maintain context across sessions.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  User's Project                                             │
│  ├── .vibe/                                                 │
│  │   ├── vibeship.md      # Project context (committed)     │
│  │   └── .secrets         # API credentials (gitignored)    │
│  └── ...                                                    │
└─────────────────────────────────────────────────────────────┘
           │                           ▲
           │ API calls                 │ Fetch instructions
           ▼                           │
┌─────────────────────────────────────────────────────────────┐
│  VibeShip                                                   │
│  ├── /api/projects/[id]          # Read/update project      │
│  ├── /api/projects/[id]/screenshot  # Upload screenshot     │
│  └── /_static/ai-instructions.md    # Hosted instructions   │
└─────────────────────────────────────────────────────────────┘
```

### Bootstrap Prompt

Users copy this small prompt into their AI tool. It fetches current instructions from VibeShip:

```
# VibeShip: {ProjectName}

Fetch instructions: https://vibe-ship.vercel.app/_static/ai-instructions.md
Then read `.vibe/vibeship.md` for project context.
Source `.vibe/.secrets` for API credentials.
```

### API Endpoints

**GET /api/projects/[id]** - Read project context
- Auth: `Bearer {api_key}`
- Returns: project details, tags, GitHub stats

**PATCH /api/projects/[id]** - Update project
- Auth: `Bearer {api_key}`
- Fields: `description`, `where_i_left_off`, `lessons_learned`, `status`, `tags`

**POST /api/projects/[id]/screenshot** - Upload screenshot
- Auth: `Bearer {api_key}`
- Body: `{ "image": "data:image/png;base64,..." }`
- Max size: 5MB

### Key Files

- `lib/ai-prompt.ts` - Generates bootstrap prompt, vibeship.md, .secrets
- `public/_static/ai-instructions.md` - Hosted AI instructions (update here for all projects)
- `app/api/projects/[id]/route.ts` - Project API (GET, PATCH)
- `app/api/projects/[id]/screenshot/route.ts` - Screenshot upload API

---

## Deployment Workflow

```
Local Development → Git Push → GitHub → Vercel Auto-Deploy → Production
```

### How it works:
1. Develop locally at `localhost:3000`
2. Commit changes: `git add . && git commit -m "message"`
3. Push to GitHub: `git push`
4. Vercel automatically detects the push and rebuilds
5. Changes go live at `vibe-ship.vercel.app` within ~1 minute

### Preview Deployments:
- Every PR gets its own preview URL
- Format: `vibeship-{hash}-mattghicks-projects.vercel.app`

---

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint
```

---

## Project Structure

```
VibeShip/
├── app/
│   ├── (auth)/                    # Auth route group
│   │   ├── callback/route.ts      # OAuth callback handler
│   │   └── login/page.tsx         # GitHub login page
│   ├── (dashboard)/               # Protected dashboard routes
│   │   ├── layout.tsx             # Sidebar layout wrapper
│   │   ├── dashboard/page.tsx     # Main dashboard with stats
│   │   ├── guide/page.tsx         # AI setup guide
│   │   ├── import/page.tsx        # GitHub import
│   │   └── projects/
│   │       ├── page.tsx           # Projects list with filters
│   │       ├── new/page.tsx       # Create new project
│   │       └── [id]/
│   │           ├── page.tsx       # Project detail view
│   │           └── edit/page.tsx  # Edit project
│   ├── (public)/                  # Public routes
│   │   ├── layout.tsx             # Public header/footer
│   │   ├── page.tsx               # Landing page
│   │   └── discover/page.tsx      # Browse public projects
│   ├── [username]/                # Public profile routes
│   │   ├── page.tsx               # User profile
│   │   └── [slug]/page.tsx        # Public project view
│   ├── api/
│   │   └── projects/[id]/
│   │       ├── route.ts           # Project API (GET, PATCH)
│   │       └── screenshot/route.ts # Screenshot upload
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles + theme
├── components/
│   ├── layout/
│   │   └── app-sidebar.tsx        # Dashboard sidebar navigation
│   ├── projects/
│   │   ├── project-form.tsx       # Create/edit project form
│   │   ├── status-switcher.tsx    # Quick status change dropdown
│   │   ├── api-settings.tsx       # API key management
│   │   ├── tag-selector.tsx       # Tech stack tag picker
│   │   └── delete-project-button.tsx
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── actions/
│   │   ├── projects.ts            # Server actions for CRUD
│   │   └── github.ts              # GitHub import actions
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   ├── server.ts              # Server Supabase client
│   │   └── middleware.ts          # Auth session refresh
│   ├── ai-prompt.ts               # AI prompt generation
│   ├── github.ts                  # GitHub API helpers
│   └── utils.ts                   # cn() helper
├── types/
│   └── database.ts                # TypeScript types for DB
├── public/
│   ├── _static/
│   │   └── ai-instructions.md     # Hosted AI instructions
│   ├── favicon.svg
│   ├── logo.svg
│   └── icon.svg
├── supabase/
│   └── migrations/
└── middleware.ts                  # Route protection
```

---

## Design System

### Theme Colors

```css
--primary: #8B5CF6          /* Purple - brand color */
--status-active: #F97316    /* Orange - active projects */
--status-paused: #6366F1    /* Indigo - paused projects */
--status-graveyard: #6B7280 /* Gray - abandoned projects */
--status-shipped: #10B981   /* Emerald - shipped projects */
```

### Project Statuses

| Status    | Color   | Icon   | Meaning |
|-----------|---------|--------|---------|
| Active    | Orange  | Flame  | Currently working on |
| Paused    | Indigo  | Pause  | Temporarily set aside |
| Graveyard | Gray    | Skull  | Abandoned/archived |
| Shipped   | Emerald | Rocket | Successfully launched |

### shadcn/ui Components Installed

avatar, badge, button, card, dialog, dropdown-menu, input, label, select, separator, sheet, sidebar, skeleton, tabs, textarea, tooltip, collapsible

---

## Database Schema

### Tables

1. **users** - Extends Supabase auth.users
   - id (uuid, PK, FK to auth.users)
   - username (unique)
   - display_name, avatar_url, bio
   - github_username, github_access_token
   - is_pro, stripe_customer_id

2. **projects** - User's coding projects
   - id (uuid, PK)
   - user_id (FK to users)
   - name, slug (unique per user)
   - description, status, is_public
   - github_repo_url, github_repo_id, github_stars, github_forks, github_open_issues, github_language
   - live_url, screenshot_url
   - where_i_left_off, lessons_learned
   - **api_key** (unique, for AI access)
   - last_activity_at, created_at, updated_at

3. **project_tags** - Tech stack tags
   - project_id (FK)
   - tag_type (model | framework | tool)
   - tag_value

4. **tags_catalog** - Predefined tags (seeded)
   - name, type, icon_url, color
   - Includes: Claude, GPT-4, Cursor, v0, Bolt, Next.js, React, etc.

5. **project_likes** - User likes on projects
6. **bookmarks** - User bookmarks

7. **api_activity_log** - Tracks AI API usage
   - project_id (FK)
   - action (read, update, upload_screenshot)
   - details (JSON)
   - ip_address, user_agent
   - created_at

### Supabase Storage

- **screenshots** bucket - Project screenshots uploaded via API
  - Path format: `{user_id}/{project_id}/screenshot.{ext}`
  - Public read access
  - Max 5MB per file

### Row Level Security

- Users can read public profiles, edit own
- Projects visible if public OR owned by user
- Tags follow project visibility
- Likes/bookmarks private to user
- API routes use service role key (bypass RLS)

---

## Server Actions

Located in `lib/actions/projects.ts`:

```typescript
createProject(data)        // Create new project with auto-slug
updateProject(id, data)    // Update project fields
deleteProject(id)          // Delete and redirect
updateProjectStatus(id, status)  // Quick status change
regenerateApiKey(id)       // Generate new API key
```

---

## Authentication Flow

1. User clicks "Sign in with GitHub" on `/login`
2. Redirects to Supabase Auth → GitHub OAuth
3. GitHub redirects back to `/callback`
4. `callback/route.ts`:
   - Exchanges code for session
   - Creates user profile if new user (from GitHub metadata)
   - Redirects to `/dashboard`
5. `middleware.ts` protects `/dashboard/*`, `/projects/*`, `/settings/*`, `/import/*`

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For API routes
```

---

## Development Notes

### Lazy Supabase Client in API Routes

API routes must create Supabase client lazily (inside functions) to avoid build-time errors:

```typescript
// WRONG - fails during Vercel build
const supabase = createClient(...);

// CORRECT - lazy initialization
function getSupabase() {
  return createClient(...);
}
```

### Type Assertions for Supabase

Due to SSR compatibility issues with Supabase generics, use runtime type assertions:

```typescript
const { data: projectsData } = await supabase.from("projects").select("*");
const projects = projectsData as Project[] | null;
```

### Route Groups

- `(auth)` - Authentication routes (login, callback)
- `(dashboard)` - Protected routes with sidebar
- `(public)` - Public routes with header/footer

### Static Files

Files in `public/_static/` are served directly and excluded from middleware via matcher pattern in `middleware.ts`.

---

## Development Status

### Phase 1: Foundation - COMPLETED

- [x] Next.js project setup with TypeScript
- [x] Tailwind CSS + shadcn/ui with dark theme
- [x] Custom color scheme (purple primary, status colors)
- [x] Supabase integration (client + server)
- [x] GitHub OAuth authentication
- [x] User profile creation on first login
- [x] Route protection middleware
- [x] Database schema with RLS policies
- [x] Dashboard layout with sidebar navigation
- [x] Project CRUD operations (create, read, update, delete)
- [x] Project listing with search and status filter tabs
- [x] Project detail and edit views
- [x] Status switcher component
- [x] "Where I Left Off" notes field
- [x] Landing page with feature showcase
- [x] Custom logo/favicon (rocket ship design)

### Phase 2: Enhanced Features - COMPLETED

- [x] Tech stack tags (model, framework, tool)
- [x] Screenshot upload (Supabase Storage)
- [x] GitHub import (fetch repos, sync stars)
- [x] Public profiles (`/[username]`)
- [x] Discover page (browse public projects)
- [x] Project visibility toggle (public/private)
- [x] AI Integration (API endpoints for context sync)
- [x] Hosted AI instructions (auto-updating across projects)
- [x] API activity logging

### Phase 3: Activity & Real-time Features - COMPLETED

- [x] Activity Timeline - Track project activity, "days since last activity"
  - User action logging (status changes, notes updates, visibility changes)
  - Dashboard activity feed across all projects
  - AI and webhook activity tracking
- [x] Rich Notes - Markdown editor, todo lists in "Where I Left Off"
  - Markdown editor with live preview
  - Markdown rendering in project views
  - GitHub Flavored Markdown support
- [x] GitHub Webhooks - Real-time commit tracking
  - Webhook endpoint with signature validation
  - Push, release, star, and fork event tracking
  - Toggle UI in project settings

### Phase 4: Future Features

- **Pro Features** - Stripe integration, unlimited projects, analytics
- **Social Features** - Follow developers, activity feed, comments

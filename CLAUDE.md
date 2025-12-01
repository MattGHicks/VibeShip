# VibeShip - Project Documentation

## Overview

VibeShip is a web platform for solo vibe coders to track, organize, and share their AI-assisted projects. It helps developers remember where they left off, track project statuses, and showcase shipped work.

**Target Users:** Solo developers who use AI tools (Claude, Cursor, v0, Bolt, etc.) to rapidly prototype and build projects.

**Core Value Prop:** Never lose track of your vibe coding projects again. Know exactly where you left off, showcase what you've shipped, and discover what others are building.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 15 | App Router, Server Components, Server Actions |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS v4 + shadcn/ui | Dark mode default |
| Database | Supabase (PostgreSQL) | Also handles Auth |
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
│   │   └── projects/
│   │       ├── page.tsx           # Projects list with filters
│   │       ├── new/page.tsx       # Create new project
│   │       └── [id]/
│   │           ├── page.tsx       # Project detail view
│   │           └── edit/page.tsx  # Edit project
│   ├── (public)/                  # Public routes
│   │   ├── layout.tsx             # Public header/footer
│   │   └── page.tsx               # Landing page
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles + theme
├── components/
│   ├── layout/
│   │   └── app-sidebar.tsx        # Dashboard sidebar navigation
│   ├── projects/
│   │   ├── project-form.tsx       # Create/edit project form
│   │   ├── status-switcher.tsx    # Quick status change dropdown
│   │   └── delete-project-button.tsx
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── actions/
│   │   └── projects.ts            # Server actions for CRUD
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   ├── server.ts              # Server Supabase client
│   │   └── middleware.ts          # Auth session refresh
│   └── utils.ts                   # cn() helper
├── types/
│   └── database.ts                # TypeScript types for DB
├── hooks/
│   └── use-mobile.ts              # Mobile detection hook
├── supabase/
│   └── migrations/
│       └── 20241130_initial_schema.sql
├── public/
│   ├── favicon.svg                # 32x32 favicon (rocket)
│   ├── logo.svg                   # 512x512 full logo
│   └── icon.svg                   # 24x24 inline icon
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

avatar, badge, button, card, dialog, dropdown-menu, input, label, select, separator, sheet, sidebar, skeleton, tabs, textarea, tooltip

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
   - github_repo_url, github_repo_id, github_stars
   - live_url, screenshot_url
   - where_i_left_off, lessons_learned
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

### Row Level Security

- Users can read public profiles, edit own
- Projects visible if public OR owned by user
- Tags follow project visibility
- Likes/bookmarks private to user

---

## Server Actions

Located in `lib/actions/projects.ts`:

```typescript
createProject(data)        // Create new project with auto-slug
updateProject(id, data)    // Update project fields
deleteProject(id)          // Delete and redirect
updateProjectStatus(id, status)  // Quick status change
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
```

---

## Development Notes

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

### Server Actions Pattern

All mutations use Server Actions in `lib/actions/`:

```typescript
"use server";

export async function createProject(data: ProjectFormData) {
  const supabase = await createClient();
  // ... mutation logic
  revalidatePath("/dashboard");
  redirect(`/projects/${project.id}`);
}
```

---

## Development Status

### Phase 1: Foundation - COMPLETED

- [x] Next.js 15 project setup with TypeScript
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

---

### Phase 2: Enhanced Features - NEXT UP

#### 2.1 Tech Stack Tags
Let users tag projects with AI models, frameworks, and tools.

**Tasks:**
- [ ] Create tag selector component with autocomplete
- [ ] Fetch from tags_catalog table
- [ ] Allow custom tags (auto-add to catalog)
- [ ] Display tags on project cards and detail pages
- [ ] Filter projects by tags

**Files to create:**
- `components/projects/tag-selector.tsx`
- `lib/actions/tags.ts`
- Modify `project-form.tsx` to include tags

#### 2.2 Screenshot Upload
Allow users to upload project screenshots.

**Tasks:**
- [ ] Set up Supabase Storage bucket "screenshots"
- [ ] Create upload component with preview
- [ ] Add storage RLS policies
- [ ] Display screenshots on project cards
- [ ] Support drag-and-drop upload

**Files to create:**
- `components/projects/screenshot-upload.tsx`
- `lib/actions/storage.ts`

#### 2.3 GitHub Import
Import repositories from GitHub.

**Tasks:**
- [ ] Create `/import` page with repo list
- [ ] Use GitHub API to fetch user repos
- [ ] One-click import to create project
- [ ] Sync GitHub stars periodically
- [ ] Store GitHub repo ID for updates

**Files to create:**
- `app/(dashboard)/import/page.tsx`
- `lib/github.ts`
- `lib/actions/github.ts`

#### 2.4 Public Profiles
Public profile pages showing user's shipped projects.

**Tasks:**
- [ ] Create `app/[username]/page.tsx` dynamic route
- [ ] Display user info + public projects
- [ ] Profile customization in `/settings`
- [ ] SEO meta tags for profiles

**Files to create:**
- `app/[username]/page.tsx`
- `app/[username]/[project-slug]/page.tsx`
- `app/(dashboard)/settings/page.tsx`

#### 2.5 Discover Page
Browse public projects from all users.

**Tasks:**
- [ ] Create discover page with grid layout
- [ ] Filter by status, tags, sort options
- [ ] Like/bookmark functionality
- [ ] Trending/recent sorting

**Files to create:**
- `app/(public)/discover/page.tsx`
- `lib/actions/social.ts`

---

### Phase 3: Future Features

- **Activity Timeline** - Track project activity, "days since last activity"
- **Rich Notes** - Markdown editor, todo lists in "Where I Left Off"
- **GitHub Webhooks** - Real-time commit tracking
- **Pro Features** - Stripe integration, unlimited projects, analytics
- **Social Features** - Follow developers, activity feed, comments

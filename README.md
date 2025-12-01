# VibeShip

A portfolio tracker for vibe coders. Track your side projects, import from GitHub, and share your work with the community.

## Features

- **Project Management** - Track your projects with status (Active, Paused, Graveyard, Shipped)
- **GitHub Integration** - Import repos and auto-sync stars, descriptions, and metadata
- **Public Profiles** - Share your portfolio with a customizable public profile page
- **Discover** - Browse public projects from the community
- **Tags** - Categorize projects by AI model, framework, and tools used
- **Notes** - Keep track of where you left off and lessons learned

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with GitHub OAuth
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

Run the migration in `supabase/migrations/20241130_initial_schema.sql` to set up the database schema.

For GitHub sync functionality, also run:
```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_synced_at TIMESTAMPTZ;
```

## License

MIT

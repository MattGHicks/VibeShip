-- Add enhanced GitHub sync fields to projects table
-- Run this migration to enable additional GitHub stats and autosync control

-- Add github_synced_at if it doesn't exist (for tracking last sync time)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'github_synced_at') THEN
    ALTER TABLE public.projects ADD COLUMN github_synced_at timestamptz;
  END IF;
END $$;

-- Add new GitHub stats fields
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS github_forks int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS github_open_issues int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS github_language text,
  ADD COLUMN IF NOT EXISTS github_autosync boolean DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.github_autosync IS 'When true, GitHub data will be synced automatically when viewing the project';
COMMENT ON COLUMN public.projects.github_forks IS 'Number of forks on GitHub';
COMMENT ON COLUMN public.projects.github_open_issues IS 'Number of open issues on GitHub';
COMMENT ON COLUMN public.projects.github_language IS 'Primary programming language from GitHub';

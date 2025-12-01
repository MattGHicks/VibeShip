-- AI Integration: Add API key to projects and activity logging
-- Migration: 20241202_ai_integration.sql

-- Add API key column for AI integration
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS api_key text UNIQUE;

-- Index for fast API key lookups
CREATE INDEX IF NOT EXISTS projects_api_key_idx
  ON public.projects(api_key) WHERE api_key IS NOT NULL;

-- Activity log for AI API access
CREATE TABLE IF NOT EXISTS public.api_activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Index for fetching recent activity by project
CREATE INDEX IF NOT EXISTS api_activity_log_project_created_idx
  ON public.api_activity_log(project_id, created_at DESC);

-- Enable RLS on activity log
ALTER TABLE public.api_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only project owner can view activity
CREATE POLICY "Users can view activity for own projects"
  ON public.api_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = api_activity_log.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Allow service role to insert activity logs (for API route)
CREATE POLICY "Service role can insert activity"
  ON public.api_activity_log FOR INSERT
  WITH CHECK (true);

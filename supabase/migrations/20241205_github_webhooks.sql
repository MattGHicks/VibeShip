-- Add GitHub webhook columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS github_webhook_id bigint,
ADD COLUMN IF NOT EXISTS github_webhook_enabled boolean DEFAULT false;

-- Create index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_projects_github_repo_id_webhook
ON projects (github_repo_id)
WHERE github_webhook_enabled = true;

-- Add new activity types comment
COMMENT ON TABLE api_activity_log IS 'Tracks both API (AI) activity and user/webhook activity. Actions include: read, update_*, upload_screenshot, project_created, status_changed, notes_updated, visibility_changed, github_synced, github_push, github_release, github_starred, github_forked';

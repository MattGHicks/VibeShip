-- Add target ship date for countdown feature
ALTER TABLE projects ADD COLUMN IF NOT EXISTS target_ship_date DATE;

-- Create table for project checklist items (Next Steps)
CREATE TABLE IF NOT EXISTS project_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_project_checklist_project_id ON project_checklist(project_id);

-- Create table for project resource links
CREATE TABLE IF NOT EXISTS project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_project_links_project_id ON project_links(project_id);

-- RLS policies for project_checklist
ALTER TABLE project_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own project checklist items"
  ON project_checklist FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert checklist items for their own projects"
  ON project_checklist FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own project checklist items"
  ON project_checklist FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own project checklist items"
  ON project_checklist FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- RLS policies for project_links
ALTER TABLE project_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own project links"
  ON project_links FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view links for public projects"
  ON project_links FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE is_public = TRUE
    )
  );

CREATE POLICY "Users can insert links for their own projects"
  ON project_links FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own project links"
  ON project_links FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own project links"
  ON project_links FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

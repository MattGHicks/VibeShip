-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  website_url text,
  twitter_handle text,
  github_username text,
  github_access_token text, -- encrypted
  is_pro boolean default false,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  name text not null,
  slug text not null,
  description text,
  status text check (status in ('active', 'paused', 'graveyard', 'shipped')) default 'active',
  is_public boolean default false,
  github_repo_url text,
  github_repo_id bigint,
  github_stars int default 0,
  live_url text,
  screenshot_url text,
  where_i_left_off text,
  lessons_learned text,
  last_activity_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, slug)
);

-- Project tags (many-to-many)
create table public.project_tags (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects on delete cascade not null,
  tag_type text check (tag_type in ('model', 'framework', 'tool')) not null,
  tag_value text not null,
  unique(project_id, tag_type, tag_value)
);

-- Tags catalog (predefined tags with icons)
create table public.tags_catalog (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  type text check (type in ('model', 'framework', 'tool')) not null,
  icon_url text,
  color text
);

-- Project likes
create table public.project_likes (
  user_id uuid references public.users on delete cascade,
  project_id uuid references public.projects on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, project_id)
);

-- Bookmarks
create table public.bookmarks (
  user_id uuid references public.users on delete cascade,
  project_id uuid references public.projects on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, project_id)
);

-- Row Level Security Policies
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.project_tags enable row level security;
alter table public.project_likes enable row level security;
alter table public.bookmarks enable row level security;

-- Users: can read public profiles, edit own
create policy "Public profiles are viewable by everyone" on public.users
  for select using (true);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- Projects: can read public or own, edit own
create policy "Public projects are viewable by everyone" on public.projects
  for select using (is_public = true or auth.uid() = user_id);

create policy "Users can insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update own projects" on public.projects
  for update using (auth.uid() = user_id);

create policy "Users can delete own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- Tags: follow project visibility
create policy "Tags viewable with project" on public.project_tags
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = project_tags.project_id
      and (projects.is_public = true or projects.user_id = auth.uid())
    )
  );

create policy "Users can manage tags on own projects" on public.project_tags
  for all using (
    exists (
      select 1 from public.projects
      where projects.id = project_tags.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Likes: users can manage own likes
create policy "Anyone can view likes" on public.project_likes
  for select using (true);

create policy "Users can manage own likes" on public.project_likes
  for all using (auth.uid() = user_id);

-- Bookmarks: private to user
create policy "Users can manage own bookmarks" on public.bookmarks
  for all using (auth.uid() = user_id);

-- Indexes for performance
create index projects_user_id_idx on public.projects(user_id);
create index projects_status_idx on public.projects(status);
create index projects_is_public_idx on public.projects(is_public);
create index projects_last_activity_idx on public.projects(last_activity_at desc);
create index project_tags_project_id_idx on public.project_tags(project_id);
create index project_likes_project_id_idx on public.project_likes(project_id);

-- Seed some common tags
insert into public.tags_catalog (name, type, color) values
  ('Claude', 'model', '#8B5CF6'),
  ('GPT-4', 'model', '#10B981'),
  ('Cursor', 'tool', '#3B82F6'),
  ('v0', 'tool', '#000000'),
  ('Bolt', 'tool', '#F59E0B'),
  ('Next.js', 'framework', '#000000'),
  ('React', 'framework', '#61DAFB'),
  ('Vue', 'framework', '#4FC08D'),
  ('Svelte', 'framework', '#FF3E00'),
  ('Tailwind', 'framework', '#06B6D4'),
  ('TypeScript', 'framework', '#3178C6'),
  ('Python', 'framework', '#3776AB'),
  ('Supabase', 'tool', '#3ECF8E'),
  ('Vercel', 'tool', '#000000'),
  ('GitHub Copilot', 'tool', '#000000');

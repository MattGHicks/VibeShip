-- Create screenshots storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'screenshots',
  'screenshots',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Storage policies for screenshots bucket

-- Allow authenticated users to upload to their own folder
create policy "Users can upload screenshots to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own files
create policy "Users can update own screenshots"
on storage.objects for update
to authenticated
using (
  bucket_id = 'screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
create policy "Users can delete own screenshots"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access (bucket is public)
create policy "Anyone can view screenshots"
on storage.objects for select
to public
using (bucket_id = 'screenshots');

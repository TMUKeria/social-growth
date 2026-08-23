-- 상황 그림을 저장하는 공개 읽기 버킷과 교사 전용 쓰기 정책을 만듭니다.
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'scenario-images',
  'scenario-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "scenario_images_select_public" on storage.objects;
drop policy if exists "scenario_images_insert_owner" on storage.objects;
drop policy if exists "scenario_images_update_owner" on storage.objects;
drop policy if exists "scenario_images_delete_owner" on storage.objects;

create policy "scenario_images_select_public"
on storage.objects for select
using (bucket_id = 'scenario-images');

create policy "scenario_images_insert_owner"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'scenario-images'
  and exists (
    select 1 from public.scenarios s
    where s.id::text = (storage.foldername(name))[1]
      and s.author_id = auth.uid()
  )
);

create policy "scenario_images_update_owner"
on storage.objects for update to authenticated
using (
  bucket_id = 'scenario-images'
  and exists (
    select 1 from public.scenarios s
    where s.id::text = (storage.foldername(name))[1]
      and s.author_id = auth.uid()
  )
)
with check (
  bucket_id = 'scenario-images'
  and exists (
    select 1 from public.scenarios s
    where s.id::text = (storage.foldername(name))[1]
      and s.author_id = auth.uid()
  )
);

create policy "scenario_images_delete_owner"
on storage.objects for delete to authenticated
using (
  bucket_id = 'scenario-images'
  and exists (
    select 1 from public.scenarios s
    where s.id::text = (storage.foldername(name))[1]
      and s.author_id = auth.uid()
  )
);

commit;

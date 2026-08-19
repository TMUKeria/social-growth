-- 하루의 선택: 초기 데이터베이스 구조와 RLS 정책
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  school_name text,
  created_at timestamptz not null default now()
);

create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  category text not null check (category in ('STUDENT', 'ADULT')),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.steps (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  step_order integer not null check (step_order >= 0),
  title text not null,
  description text not null,
  image_url text,
  is_obstacle boolean not null default false,
  unique (scenario_id, step_order)
);

create table public.choices (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.steps(id) on delete cascade,
  choice_order integer not null check (choice_order >= 0),
  text text not null,
  is_correct boolean not null default false,
  feedback_text text not null,
  unique (step_id, choice_order)
);

alter table public.profiles enable row level security;
alter table public.scenarios enable row level security;
alter table public.steps enable row level security;
alter table public.choices enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "scenarios_select_public_or_own" on public.scenarios for select
using (is_public or auth.uid() = author_id);
create policy "scenarios_insert_own" on public.scenarios for insert
with check (auth.uid() = author_id);
create policy "scenarios_update_own" on public.scenarios for update
using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "scenarios_delete_own" on public.scenarios for delete
using (auth.uid() = author_id);

create policy "steps_select_via_scenario" on public.steps for select using (
  exists (select 1 from public.scenarios s where s.id = scenario_id and (s.is_public or s.author_id = auth.uid()))
);
create policy "steps_write_via_owner" on public.steps for all using (
  exists (select 1 from public.scenarios s where s.id = scenario_id and s.author_id = auth.uid())
) with check (
  exists (select 1 from public.scenarios s where s.id = scenario_id and s.author_id = auth.uid())
);

create policy "choices_select_via_scenario" on public.choices for select using (
  exists (
    select 1 from public.steps st join public.scenarios s on s.id = st.scenario_id
    where st.id = step_id and (s.is_public or s.author_id = auth.uid())
  )
);
create policy "choices_write_via_owner" on public.choices for all using (
  exists (
    select 1 from public.steps st join public.scenarios s on s.id = st.scenario_id
    where st.id = step_id and s.author_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.steps st join public.scenarios s on s.id = st.scenario_id
    where st.id = step_id and s.author_id = auth.uid()
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

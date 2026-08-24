-- 첫 가입 닉네임 저장과 상황 순서 변경을 안전하게 처리합니다.
begin;

create or replace function public.is_nickname_available(candidate text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select char_length(trim(candidate)) between 2 and 30
    and not exists (
      select 1 from public.profiles
      where lower(trim(nickname)) = lower(trim(candidate))
    );
$$;

grant execute on function public.is_nickname_available(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_nickname text := nullif(trim(new.raw_user_meta_data ->> 'nickname'), '');
begin
  insert into public.profiles (id, email, nickname)
  values (new.id, new.email, requested_nickname);
  return new;
end;
$$;

create or replace function public.move_scenario_step(step_id uuid, direction integer)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_step public.steps%rowtype;
  other_step public.steps%rowtype;
  temporary_order integer;
begin
  if direction not in (-1, 1) then
    raise exception 'Direction must be -1 or 1.' using errcode = '22023';
  end if;

  select st.* into current_step
  from public.steps st
  join public.scenarios s on s.id = st.scenario_id
  where st.id = step_id and s.author_id = auth.uid()
  for update of st;

  if not found then
    raise exception 'Step not found or access denied.' using errcode = '42501';
  end if;

  if direction = -1 then
    select * into other_step
    from public.steps
    where scenario_id = current_step.scenario_id and step_order < current_step.step_order
    order by step_order desc
    limit 1
    for update;
  else
    select * into other_step
    from public.steps
    where scenario_id = current_step.scenario_id and step_order > current_step.step_order
    order by step_order asc
    limit 1
    for update;
  end if;

  if not found then return; end if;

  select coalesce(max(step_order), 0) + 1000 into temporary_order
  from public.steps where scenario_id = current_step.scenario_id;

  update public.steps set step_order = temporary_order where id = current_step.id;
  update public.steps set step_order = current_step.step_order where id = other_step.id;
  update public.steps set step_order = other_step.step_order where id = current_step.id;
end;
$$;

grant execute on function public.move_scenario_step(uuid, integer) to authenticated;

commit;

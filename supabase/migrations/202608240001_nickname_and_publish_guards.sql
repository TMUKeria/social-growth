-- 닉네임 중복과 내용 없는 시나리오 공개를 DB에서 차단합니다.
begin;

create unique index if not exists profiles_nickname_unique_ci
  on public.profiles (lower(trim(nickname)))
  where nickname is not null;

update public.scenarios s
set is_public = false
where s.is_public = true
  and not exists (
    select 1
    from public.steps st
    where st.scenario_id = s.id
      and exists (select 1 from public.choices c where c.step_id = st.id)
  );

create or replace function public.prevent_empty_scenario_publish()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.is_public = true and not exists (
    select 1
    from public.steps st
    where st.scenario_id = new.id
      and exists (select 1 from public.choices c where c.step_id = st.id)
  ) then
    raise exception 'A scenario needs at least one step with choices before publishing.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_empty_scenario_publish on public.scenarios;
create trigger prevent_empty_scenario_publish
  before insert or update of is_public on public.scenarios
  for each row execute function public.prevent_empty_scenario_publish();

commit;

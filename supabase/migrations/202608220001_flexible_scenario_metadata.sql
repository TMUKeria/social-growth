-- 고정 모드를 유연한 활용 대상과 복수 태그로 변경합니다.
begin;

alter table public.scenarios
  add column target_group text,
  add column tags text[] not null default '{}';

update public.scenarios
set target_group = case
  when category = 'STUDENT' then 'TEEN'
  when category = 'ADULT' then 'ADULT'
  else 'ALL'
end;

alter table public.scenarios
  alter column target_group set default 'ALL',
  alter column target_group set not null,
  add constraint scenarios_target_group_check
    check (target_group in ('CHILD', 'TEEN', 'ADULT', 'ALL'));

alter table public.scenarios drop column category;

create index scenarios_target_group_idx on public.scenarios (target_group);
create index scenarios_tags_idx on public.scenarios using gin (tags);

commit;

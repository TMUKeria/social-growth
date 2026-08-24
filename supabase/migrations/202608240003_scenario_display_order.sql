-- 교사가 대시보드의 시나리오 표시 순서를 직접 정할 수 있게 합니다.
begin;

alter table public.scenarios add column display_order integer;

with ordered as (
  select id, row_number() over (partition by author_id order by updated_at desc, id) - 1 as position
  from public.scenarios
)
update public.scenarios s set display_order = ordered.position
from ordered where ordered.id = s.id;

alter table public.scenarios alter column display_order set not null;
alter table public.scenarios add constraint scenarios_author_display_order_unique unique (author_id, display_order);

create or replace function public.set_new_scenario_display_order()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  select coalesce(max(display_order), -1) + 1 into new.display_order
  from public.scenarios where author_id = new.author_id;
  return new;
end;
$$;

create trigger set_new_scenario_display_order
  before insert on public.scenarios
  for each row execute function public.set_new_scenario_display_order();

create or replace function public.move_scenario(scenario_id uuid, direction integer)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_scenario public.scenarios%rowtype;
  other_scenario public.scenarios%rowtype;
  temporary_order integer;
begin
  if direction not in (-1, 1) then
    raise exception 'Direction must be -1 or 1.' using errcode = '22023';
  end if;

  select * into current_scenario from public.scenarios
  where id = scenario_id and author_id = auth.uid()
  for update;
  if not found then raise exception 'Scenario not found or access denied.' using errcode = '42501'; end if;

  if direction = -1 then
    select * into other_scenario from public.scenarios
    where author_id = current_scenario.author_id and display_order < current_scenario.display_order
    order by display_order desc limit 1 for update;
  else
    select * into other_scenario from public.scenarios
    where author_id = current_scenario.author_id and display_order > current_scenario.display_order
    order by display_order asc limit 1 for update;
  end if;
  if not found then return; end if;

  select coalesce(max(display_order), 0) + 1000 into temporary_order
  from public.scenarios where author_id = current_scenario.author_id;
  update public.scenarios set display_order = temporary_order where id = current_scenario.id;
  update public.scenarios set display_order = current_scenario.display_order where id = other_scenario.id;
  update public.scenarios set display_order = other_scenario.display_order where id = current_scenario.id;
end;
$$;

grant execute on function public.move_scenario(uuid, integer) to authenticated;

commit;

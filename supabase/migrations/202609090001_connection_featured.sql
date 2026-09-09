begin;
alter table public.connections add column if not exists featured boolean not null default false;
create unique index if not exists connections_one_featured_idx on public.connections(featured) where featured;

create or replace function public.clear_unpublished_connection_featured()
returns trigger language plpgsql set search_path=public as $$
begin
  if not new.published or not new.active then new.featured := false; end if;
  return new;
end $$;
drop trigger if exists connections_clear_featured on public.connections;
create trigger connections_clear_featured before insert or update on public.connections
for each row execute function public.clear_unpublished_connection_featured();

create or replace function public.set_connection_featured(target uuid, selected boolean, expected timestamptz, actor_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare existing public.connections%rowtype;
begin
  if not exists(select 1 from public.users where id=actor_id and role='ADMIN' and active) then
    raise exception using errcode='42501',message='Administrator required';
  end if;
  lock table public.connections in share row exclusive mode;
  select * into existing from public.connections where id=target and active;
  if not found then raise exception using errcode='P0002',message='Edition not found'; end if;
  if expected is null or existing.updated_at<>expected then
    raise exception using errcode='40001',message='Edition changed';
  end if;
  if selected is null or (selected and not existing.published) then
    raise exception using errcode='22023',message='Publish before featuring';
  end if;
  if selected then update public.connections set featured=false where featured and id<>target; end if;
  update public.connections set featured=selected where id=target;
end $$;
revoke all on function public.set_connection_featured(uuid,boolean,timestamptz,uuid) from public,anon,authenticated;
grant execute on function public.set_connection_featured(uuid,boolean,timestamptz,uuid) to service_role;
commit;

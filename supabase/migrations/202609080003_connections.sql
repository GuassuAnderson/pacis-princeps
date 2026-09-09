-- Requires the catalog migration (users, sessions and set_updated_at).
begin;
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(), title varchar(180) not null,
  theme varchar(160) not null, event_date date not null, preacher varchar(160) not null,
  preacher_title varchar(160), summary varchar(600) not null, content text,
  published boolean not null default false, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.connection_images (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections(id) on delete cascade,
  image_url text not null, position integer not null default 0 check(position>=0),
  created_at timestamptz not null default now(), unique(connection_id,position)
);
create table if not exists public.connection_assets (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid references public.connections(id) on delete cascade,
  uploaded_by uuid references public.users(id) on delete set null,
  storage_path text unique, external_url text, alt text not null default '',
  width integer, height integer, bytes integer, position integer not null default 0,
  active boolean not null default true, created_at timestamptz not null default now(),
  check(storage_path is not null or external_url is not null)
);
insert into public.connection_assets(id,connection_id,external_url,position)
select id,connection_id,image_url,position from public.connection_images on conflict(id) do nothing;
create index if not exists connection_assets_order_idx on public.connection_assets(connection_id,active,position);
create index if not exists connections_public_idx on public.connections(active,published,event_date desc);
drop trigger if exists connections_set_updated_at on public.connections;
create trigger connections_set_updated_at before update on public.connections
for each row execute function public.set_updated_at();
alter table public.connections enable row level security;
alter table public.connection_images enable row level security;
alter table public.connection_assets enable row level security;
revoke all on public.connections,public.connection_images,public.connection_assets from anon,authenticated;
grant all on public.connections,public.connection_images,public.connection_assets to service_role;

create or replace function public.save_connection(payload jsonb,image_ids uuid[],actor_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  target uuid := (payload->>'id')::uuid;
  expected timestamptz := (payload->>'updatedAt')::timestamptz;
  existing public.connections%rowtype;
  selected_count integer;
begin
  if not exists(select 1 from public.users where id=actor_id and role='ADMIN' and active) then
    raise exception using errcode='42501',message='Administrator required';
  end if;
  if image_ids is null or cardinality(image_ids)>8 or cardinality(image_ids)<>(select count(distinct x) from unnest(image_ids) x) then
    raise exception using errcode='22023',message='Invalid image list';
  end if;
  select * into existing from public.connections where id=target for update;
  if found then
    if not existing.active then raise exception using errcode='P0002',message='Edition archived'; end if;
    if expected is null or existing.updated_at<>expected then
      raise exception using errcode='40001',message='Edition changed; reload before saving';
    end if;
  elsif expected is not null then raise exception using errcode='P0002',message='Edition not found';
  end if;
  perform id from public.connection_assets where id=any(image_ids) order by id for update;
  select count(*) into selected_count from public.connection_assets
    where id=any(image_ids) and ((connection_id is null and uploaded_by=actor_id) or connection_id=target);
  if selected_count<>cardinality(image_ids) then
    raise exception using errcode='22023',message='Image missing or owned by another edition';
  end if;
  if existing.id is null then
    insert into public.connections(id,title,theme,event_date,preacher,preacher_title,summary,content,published)
    values(target,payload->>'title',payload->>'theme',(payload->>'date')::date,payload->>'preacher',
      payload->>'role',payload->>'summary',payload->>'content',(payload->>'published')::boolean);
  else
    update public.connections set title=payload->>'title',theme=payload->>'theme',event_date=(payload->>'date')::date,
      preacher=payload->>'preacher',preacher_title=payload->>'role',summary=payload->>'summary',
      content=payload->>'content',published=(payload->>'published')::boolean where id=target;
  end if;
  update public.connection_assets set active=false where connection_id=target and not(id=any(image_ids));
  update public.connection_assets a set connection_id=target,active=true,position=s.ordinality-1,alt=payload->>'title'
    from unnest(image_ids) with ordinality s(id,ordinality) where a.id=s.id;
  return target;
end $$;
revoke all on function public.save_connection(jsonb,uuid[],uuid) from public,anon,authenticated;
grant execute on function public.save_connection(jsonb,uuid[],uuid) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('connection-images','connection-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
commit;

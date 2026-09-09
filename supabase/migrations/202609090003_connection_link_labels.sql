begin;
alter table public.connections add column if not exists preacher_instagram_label varchar(80) not null default '';
alter table public.connections add column if not exists edition_instagram_label varchar(80) not null default '';
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
    insert into public.connections(id,title,theme,event_date,preacher,preacher_title,summary,content,published,preacher_instagram,edition_instagram,preacher_instagram_label,edition_instagram_label)
    values(target,payload->>'title',payload->>'theme',(payload->>'date')::date,payload->>'preacher',
      payload->>'role',payload->>'summary',payload->>'content',(payload->>'published')::boolean,coalesce(payload->>'preacherInstagram',''),coalesce(payload->>'editionInstagram',''),coalesce(payload->>'preacherInstagramLabel',''),coalesce(payload->>'editionInstagramLabel',''));
  else
    update public.connections set title=payload->>'title',theme=payload->>'theme',event_date=(payload->>'date')::date,
      preacher=payload->>'preacher',preacher_title=payload->>'role',summary=payload->>'summary',
      preacher_instagram=coalesce(payload->>'preacherInstagram',existing.preacher_instagram),
      edition_instagram=coalesce(payload->>'editionInstagram',existing.edition_instagram),
      preacher_instagram_label=coalesce(payload->>'preacherInstagramLabel',existing.preacher_instagram_label),
      edition_instagram_label=coalesce(payload->>'editionInstagramLabel',existing.edition_instagram_label),
      content=payload->>'content',published=(payload->>'published')::boolean where id=target;
  end if;
  update public.connection_assets set active=false where connection_id=target and not(id=any(image_ids));
  update public.connection_assets a set connection_id=target,active=true,position=s.ordinality-1,alt=payload->>'title'
    from unnest(image_ids) with ordinality s(id,ordinality) where a.id=s.id;
  return target;
end $$;
revoke all on function public.save_connection(jsonb,uuid[],uuid) from public,anon,authenticated;
grant execute on function public.save_connection(jsonb,uuid[],uuid) to service_role;
commit;

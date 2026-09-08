-- Independent home placements. Five unique slots enforce the limit even for direct writes.
begin;
alter table public.products add column if not exists hero_slot smallint check (hero_slot between 1 and 5);
alter table public.products add column if not exists in_hero boolean generated always as (hero_slot is not null) stored;
create unique index if not exists products_hero_slot_unique on public.products(hero_slot) where hero_slot is not null;

create or replace function public.save_catalog_product(payload jsonb, image_ids uuid[], actor_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  target_id uuid := (payload->>'id')::uuid;
  category uuid;
  existing public.products%rowtype;
  expected timestamptz := (payload->>'updatedAt')::timestamptz;
  selected_count integer;
  first_url text;
  selected_slot smallint;
begin
  if not exists (select 1 from public.users where id=actor_id and role='ADMIN' and active) then
    raise exception using errcode='42501', message='Administrator required';
  end if;
  if cardinality(image_ids) > 8 or cardinality(image_ids) <> (select count(distinct x) from unnest(image_ids) x) then
    raise exception using errcode='22023', message='Invalid image list';
  end if;
  if (payload->>'active')::boolean and cardinality(image_ids)=0 then
    raise exception using errcode='22023', message='Published products need an image';
  end if;
  select id into category from public.categories where slug=payload->>'category' and active;
  if category is null then raise exception using errcode='22023', message='Invalid category'; end if;
  -- Serialize slot allocation before locking individual products.
  perform pg_advisory_xact_lock(20260908, 2);
  select * into existing from public.products where id=target_id for update;
  if found then
    if expected is null or existing.updated_at <> expected then
      raise exception using errcode='40001', message='Product changed; reload before saving';
    end if;
  elsif expected is not null then
    raise exception using errcode='P0002', message='Product not found';
  end if;

  if coalesce((payload->>'inHero')::boolean, false) then
    selected_slot := existing.hero_slot;
    if selected_slot is null then
      select slot into selected_slot from generate_series(1,5) slot
      where not exists (select 1 from public.products where hero_slot=slot)
      order by slot limit 1;
    end if;
    if selected_slot is null then
      raise exception using errcode='P0003', message='Hero carousel is limited to 5 products';
    end if;
  end if;

  -- Lock uploads before binding them, so two simultaneous saves cannot reuse them.
  perform id from public.product_images where id=any(image_ids) for update;
  select count(*) into selected_count from public.product_images
    where id=any(image_ids) and ((product_id is null and uploaded_by=actor_id) or product_id=target_id);
  if selected_count <> cardinality(image_ids) then
    raise exception using errcode='22023', message='Image missing or owned by another product';
  end if;
  select external_url into first_url from public.product_images where id=image_ids[1];

  if existing.id is null then
    insert into public.products(id,name,slug,description,price,compare_at_price,stock,featured,hero_slot,active,category_id,image_url)
    values(target_id, payload->>'name', target_id::text, payload->>'description',
      (payload->>'price')::numeric, (payload->>'oldPrice')::numeric, (payload->>'stock')::integer,
      (payload->>'featured')::boolean, selected_slot, (payload->>'active')::boolean, category, first_url);
  else
    update public.products set name=payload->>'name', description=payload->>'description',
      price=(payload->>'price')::numeric, compare_at_price=(payload->>'oldPrice')::numeric,
      hero_slot=selected_slot, stock=(payload->>'stock')::integer, featured=(payload->>'featured')::boolean,
      active=(payload->>'active')::boolean, category_id=category, image_url=first_url where id=target_id;
  end if;
  update public.product_images set active=false where product_id=target_id and not (id=any(image_ids));
  update public.product_images i set product_id=target_id, active=true, position=selected.ordinality-1,
    alt=payload->>'name'
    from unnest(image_ids) with ordinality selected(id,ordinality) where i.id=selected.id;
  return target_id;
end $$;
revoke all on function public.save_catalog_product(jsonb,uuid[],uuid) from public, anon, authenticated;
grant execute on function public.save_catalog_product(jsonb,uuid[],uuid) to service_role;


commit;

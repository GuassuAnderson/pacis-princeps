-- Execute no SQL Editor do projeto Supabase. Compatível com o schema legado.
begin;
do $$ begin
  create type public.user_role as enum ('CUSTOMER', 'ADMIN');
exception when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(), name varchar(120) not null,
  email varchar(255) not null unique, password_hash varchar(255) not null,
  role public.user_role not null default 'CUSTOMER', active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), name varchar(100) not null,
  slug varchar(100) not null unique, description varchar(255), active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), name varchar(160) not null,
  slug varchar(180) not null unique, description text not null,
  price numeric(10,2) not null check (price > 0), compare_at_price numeric(10,2),
  stock integer not null default 0 check (stock >= 0), image_url text,
  featured boolean not null default false, active boolean not null default true,
  category_id uuid not null references public.categories(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (compare_at_price is null or compare_at_price > price)
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = clock_timestamp(); return new; end $$;
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_active_featured_idx on public.products(active, featured);
create index if not exists products_created_idx on public.products(created_at desc, id);

insert into public.categories(name, slug, description) values
  ('Terços','tercos','Madeira, cristal e prata'), ('Imagens Sacras','imagens','Santos e devoções'),
  ('Camisetas','camisetas','Estampas autorais'), ('Joias','joias','Prata e folheados'),
  ('Kids','kids','A fé para os pequenos'), ('Livros','livros','Leituras que inspiram'),
  ('Bíblias','biblias','Palavra e contemplação'), ('Mandalas','mandalas','Arte e espiritualidade'),
  ('Crucifixos','crucifixos','Para o lar e para presentear'), ('Velas','velas','Luz e devoção'),
  ('Incensos','incensos','Aromas para oração'), ('Chás','chas','Pausa, cuidado e acolhimento'),
  ('Oficial PACIS','oficial-pacis','Exclusivos da marca'), ('Diversos','diversos','Artigos e presentes')
on conflict (slug) do nothing;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  uploaded_by uuid references public.users(id) on delete set null,
  storage_path text unique, external_url text,
  alt text not null default '', width integer, height integer, bytes integer,
  position integer not null default 0, active boolean not null default true,
  created_at timestamptz not null default now(),
  check (storage_path is not null or external_url is not null)
);
create index if not exists product_images_product_idx on public.product_images(product_id, active, position);
-- Preserva as fotos já cadastradas antes da migração.
insert into public.product_images(product_id, external_url, alt, position)
select p.id, p.image_url, p.name, 0 from public.products p
where nullif(p.image_url, '') is not null
and not exists (select 1 from public.product_images i where i.product_id = p.id);

create table if not exists public.admin_sessions (
  id uuid primary key, user_id uuid not null references public.users(id) on delete cascade,
  expires_at timestamptz not null, created_at timestamptz not null default now()
);
create index if not exists admin_sessions_expiry_idx on public.admin_sessions(expires_at);
create table if not exists public.admin_login_attempts (
  key text primary key, count integer not null, window_start timestamptz not null
);

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.admin_login_attempts enable row level security;
-- O Next é o único ponto de acesso ao catálogo e à autenticação administrativa.
revoke all on public.users, public.categories, public.products, public.product_images,
  public.admin_sessions, public.admin_login_attempts from anon, authenticated;
grant all on public.users, public.categories, public.products, public.product_images,
  public.admin_sessions, public.admin_login_attempts to service_role;

create or replace function public.consume_admin_login_attempt(attempt_key text)
returns boolean language plpgsql security definer set search_path = public as $$
declare attempts integer;
begin
  delete from public.admin_login_attempts where window_start < now() - interval '1 day';
  delete from public.admin_sessions where expires_at < now();
  insert into public.admin_login_attempts(key,count,window_start) values(attempt_key,1,now())
  on conflict (key) do update set
    count = case when admin_login_attempts.window_start < now()-interval '15 minutes' then 1 else admin_login_attempts.count+1 end,
    window_start = case when admin_login_attempts.window_start < now()-interval '15 minutes' then now() else admin_login_attempts.window_start end
  returning count into attempts;
  return attempts <= 8;
end $$;
revoke all on function public.consume_admin_login_attempt(text) from public, anon, authenticated;
grant execute on function public.consume_admin_login_attempt(text) to service_role;

create or replace function public.save_catalog_product(payload jsonb, image_ids uuid[], actor_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  target_id uuid := (payload->>'id')::uuid;
  category uuid;
  existing public.products%rowtype;
  expected timestamptz := (payload->>'updatedAt')::timestamptz;
  selected_count integer;
  first_url text;
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
  select * into existing from public.products where id=target_id for update;
  if found then
    if expected is null or existing.updated_at <> expected then
      raise exception using errcode='40001', message='Product changed; reload before saving';
    end if;
  elsif expected is not null then
    raise exception using errcode='P0002', message='Product not found';
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
    insert into public.products(id,name,slug,description,price,compare_at_price,stock,featured,active,category_id,image_url)
    values(target_id, payload->>'name', target_id::text, payload->>'description',
      (payload->>'price')::numeric, (payload->>'oldPrice')::numeric, (payload->>'stock')::integer,
      (payload->>'featured')::boolean, (payload->>'active')::boolean, category, first_url);
  else
    update public.products set name=payload->>'name', description=payload->>'description',
      price=(payload->>'price')::numeric, compare_at_price=(payload->>'oldPrice')::numeric,
      stock=(payload->>'stock')::integer, featured=(payload->>'featured')::boolean,
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

create or replace function public.catalog_metrics() returns jsonb language sql stable
security definer set search_path = public as $$
  select jsonb_build_object('total',count(*),'featured',count(*) filter(where featured and active),
    'stock',coalesce(sum(stock) filter(where active),0),'categories',count(distinct category_id)) from public.products;
$$;
revoke all on function public.catalog_metrics() from public, anon, authenticated;
grant execute on function public.catalog_metrics() to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
commit;

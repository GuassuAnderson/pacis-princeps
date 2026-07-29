create extension if not exists "pgcrypto";

create type public.user_role as enum ('CUSTOMER', 'ADMIN');

create table public.users (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  email varchar(255) not null unique,
  password_hash varchar(255) not null,
  role public.user_role not null default 'CUSTOMER',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  slug varchar(100) not null unique,
  description varchar(255),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name varchar(160) not null,
  slug varchar(180) not null unique,
  description text not null,
  price numeric(10, 2) not null check (price > 0),
  compare_at_price numeric(10, 2),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  featured boolean not null default false,
  active boolean not null default true,
  category_id uuid not null references public.categories(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (compare_at_price is null or compare_at_price > price)
);

create index products_category_id_idx on public.products(category_id);
create index products_active_featured_idx on public.products(active, featured);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

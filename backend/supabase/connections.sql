create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  title varchar(180) not null,
  theme varchar(160) not null,
  event_date date not null,
  preacher varchar(160) not null,
  preacher_title varchar(160),
  summary varchar(600) not null,
  content text,
  published boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.connection_images (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections(id) on delete cascade,
  image_url text not null,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  unique (connection_id, position)
);

create index if not exists connections_public_idx on public.connections(active, published, event_date desc);
create index if not exists connection_images_connection_idx on public.connection_images(connection_id, position);

drop trigger if exists connections_set_updated_at on public.connections;
create trigger connections_set_updated_at before update on public.connections
for each row execute function public.set_updated_at();

alter table public.connections enable row level security;
alter table public.connection_images enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('connection-images', 'connection-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
allowed_mime_types = array['image/jpeg','image/png','image/webp'];

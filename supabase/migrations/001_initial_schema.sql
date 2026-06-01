-- ARES initial schema: tables, RLS, storage, profile trigger

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  email text not null,
  avatar text,
  bio text,
  location text,
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
  created_at timestamptz not null default timezone('utc', now()),
  constraint profiles_username_unique unique (username),
  constraint profiles_email_unique unique (email)
);

create index profiles_username_idx on public.profiles (username);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  category text not null,
  condition text not null,
  size text,
  brand text,
  color text,
  location text,
  images text[] not null default '{}',
  likes integer not null default 0 check (likes >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index products_user_id_idx on public.products (user_id);
create index products_created_at_idx on public.products (created_at desc);

-- ---------------------------------------------------------------------------
-- Likes (user ↔ product)
-- ---------------------------------------------------------------------------
create table public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, product_id)
);

create index likes_product_id_idx on public.likes (product_id);

-- Sync products.likes count
create or replace function public.sync_product_likes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.products
    set likes = likes + 1
    where id = new.product_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.products
    set likes = greatest(likes - 1, 0)
    where id = old.product_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger likes_count_insert
after insert on public.likes
for each row execute function public.sync_product_likes_count();

create trigger likes_count_delete
after delete on public.likes
for each row execute function public.sync_product_likes_count();

-- ---------------------------------------------------------------------------
-- Saved products
-- ---------------------------------------------------------------------------
create table public.saved_products (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, product_id)
);

create index saved_products_user_id_idx on public.saved_products (user_id);

-- ---------------------------------------------------------------------------
-- Messages
-- ---------------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  read boolean not null default false,
  constraint messages_no_self check (sender_id <> receiver_id)
);

create index messages_receiver_id_idx on public.messages (receiver_id);
create index messages_sender_id_idx on public.messages (sender_id);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint reviews_no_self check (seller_id <> buyer_id)
);

create index reviews_seller_id_idx on public.reviews (seller_id);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index notifications_user_id_idx on public.notifications (user_id);

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(
    regexp_replace(
      coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
      '[^a-zA-Z0-9_]',
      '',
      'g'
    )
  );

  if base_username = '' then
    base_username := 'user';
  end if;

  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, email, avatar)
  values (
    new.id,
    final_username,
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.likes enable row level security;
alter table public.saved_products enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

-- Profiles
create policy "Profiles are viewable by everyone"
on public.profiles for select
using (true);

create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Products
create policy "Products are viewable by everyone"
on public.products for select
using (true);

create policy "Users can insert own products"
on public.products for insert
with check (auth.uid() = user_id);

create policy "Users can update own products"
on public.products for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own products"
on public.products for delete
using (auth.uid() = user_id);

-- Likes
create policy "Likes are viewable by authenticated users"
on public.likes for select
to authenticated
using (true);

create policy "Users can like products"
on public.likes for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can remove own likes"
on public.likes for delete
using (auth.uid() = user_id);

-- Saved products
create policy "Users can view own saved products"
on public.saved_products for select
using (auth.uid() = user_id);

create policy "Users can save products"
on public.saved_products for insert
with check (auth.uid() = user_id);

create policy "Users can unsave products"
on public.saved_products for delete
using (auth.uid() = user_id);

-- Messages
create policy "Users can view own messages"
on public.messages for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
on public.messages for insert
with check (auth.uid() = sender_id);

create policy "Receiver can mark messages read"
on public.messages for update
using (auth.uid() = receiver_id)
with check (auth.uid() = receiver_id);

-- Reviews
create policy "Reviews are viewable by everyone"
on public.reviews for select
using (true);

create policy "Buyers can create reviews"
on public.reviews for insert
with check (auth.uid() = buyer_id);

create policy "Buyers can update own reviews"
on public.reviews for update
using (auth.uid() = buyer_id)
with check (auth.uid() = buyer_id);

-- Notifications
create policy "Users can view own notifications"
on public.notifications for select
using (auth.uid() = user_id);

create policy "Users can update own notifications"
on public.notifications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage: clothing images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'clothing-images',
  'clothing-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Clothing images are publicly accessible"
on storage.objects for select
using (bucket_id = 'clothing-images');

create policy "Users can upload own clothing images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'clothing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own clothing images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'clothing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own clothing images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'clothing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ARES orders table for Mercado Pago checkout

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  payment_id text,
  preference_id text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  total numeric(12, 2) not null check (total >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index orders_buyer_id_idx on public.orders (buyer_id, created_at desc);
create index orders_seller_id_idx on public.orders (seller_id, created_at desc);
create index orders_product_id_idx on public.orders (product_id);
create index orders_payment_id_idx on public.orders (payment_id) where payment_id is not null;
create index orders_preference_id_idx on public.orders (preference_id) where preference_id is not null;

create unique index orders_one_approved_per_product_idx
  on public.orders (product_id)
  where status = 'approved';

create or replace function public.set_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger orders_updated_at
before update on public.orders
for each row
execute function public.set_orders_updated_at();

alter table public.orders enable row level security;

create policy "Buyers can view own orders"
on public.orders for select
to authenticated
using (buyer_id = auth.uid());

create policy "Sellers can view orders for their products"
on public.orders for select
to authenticated
using (seller_id = auth.uid());

-- Run this in the Supabase SQL editor once, on a fresh project.
-- Also create a private storage bucket named "products" (Storage -> New bucket,
-- "Public bucket" OFF) and upload:
--   From_Oven_to_Online_Workbook.pdf
--   The_Script_Pack.pdf
--   The_Script_Pack_COPY_PASTE.txt

create extension if not exists pgcrypto;

create table orders (
  id uuid primary key default gen_random_uuid(),
  external_reference text unique not null,
  transaction_id text,
  buyer_name text not null,
  buyer_phone text not null,
  buyer_email text,
  operator text not null,
  amount integer not null,
  tier_label text not null,
  status text not null default 'pending',
  download_token text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index orders_status_idx on orders(status);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_set_updated_at
before update on orders
for each row execute function set_updated_at();

create extension if not exists pgcrypto;

create table if not exists public.crm_workspaces (
  id uuid primary key default gen_random_uuid(),
  client_name text not null default '',
  client_email text not null default '',
  stage text not null default 'Lead',
  revenue numeric not null default 0,
  balance numeric not null default 0,
  event_date date,
  workspace jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists crm_workspaces_updated_at_idx
  on public.crm_workspaces (updated_at desc);

create or replace function public.set_crm_workspaces_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists crm_workspaces_set_updated_at on public.crm_workspaces;

create trigger crm_workspaces_set_updated_at
before update on public.crm_workspaces
for each row
execute function public.set_crm_workspaces_updated_at();

alter table public.crm_workspaces enable row level security;

drop policy if exists "crm_workspaces_select_all" on public.crm_workspaces;
create policy "crm_workspaces_select_all"
on public.crm_workspaces
for select
to anon, authenticated
using (true);

drop policy if exists "crm_workspaces_insert_all" on public.crm_workspaces;
create policy "crm_workspaces_insert_all"
on public.crm_workspaces
for insert
to anon, authenticated
with check (true);

drop policy if exists "crm_workspaces_update_all" on public.crm_workspaces;
create policy "crm_workspaces_update_all"
on public.crm_workspaces
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "crm_workspaces_delete_all" on public.crm_workspaces;
create policy "crm_workspaces_delete_all"
on public.crm_workspaces
for delete
to anon, authenticated
using (true);

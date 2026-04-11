create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid unique,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  type text not null default '',
  stage text not null default 'Lead',
  event_date date,
  inquired_on date,
  location text not null default '',
  referral_source text not null default '',
  notes text not null default '',
  total_revenue numeric not null default 0,
  balance_due numeric not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

create index if not exists clients_updated_at_idx on public.clients (updated_at desc);
create index if not exists clients_email_idx on public.clients (lower(email));
create index if not exists clients_name_idx on public.clients (lower(name));

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  name text not null default '',
  category text not null default '',
  action text not null default '',
  type text not null default 'file',
  subject text not null default '',
  content text not null default '',
  folder text not null default 'My Templates',
  template_kind text not null default 'file',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists templates_set_updated_at on public.templates;
create trigger templates_set_updated_at
before update on public.templates
for each row
execute function public.set_updated_at();

create index if not exists templates_kind_idx on public.templates (template_kind);
create index if not exists templates_name_idx on public.templates (lower(name));

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  client_id uuid not null references public.clients(id) on delete cascade,
  quote_number integer,
  quote_number_label text not null default '',
  status text not null default 'Draft',
  client_name text not null default '',
  client_email text not null default '',
  event_name text not null default '',
  event_date date,
  introduction text not null default '',
  expiration date,
  notes text not null default '',
  promo_code text not null default '',
  discount_type text not null default 'amount',
  discount_value numeric not null default 0,
  subtotal numeric not null default 0,
  discount_amount numeric not null default 0,
  total_amount numeric not null default 0,
  payment_schedule text not null default '',
  questionnaire text not null default '',
  contract_template text not null default '',
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
before update on public.quotes
for each row
execute function public.set_updated_at();

create index if not exists quotes_client_idx on public.quotes (client_id);
create index if not exists quotes_status_idx on public.quotes (status);
create index if not exists quotes_updated_at_idx on public.quotes (updated_at desc);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  client_id uuid not null references public.clients(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete set null,
  title text not null default '',
  session_date date,
  session_time text not null default '',
  end_time text not null default '',
  location text not null default '',
  status text not null default 'Tentative',
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
before update on public.sessions
for each row
execute function public.set_updated_at();

create index if not exists sessions_client_idx on public.sessions (client_id);
create index if not exists sessions_quote_idx on public.sessions (quote_id);
create index if not exists sessions_date_idx on public.sessions (session_date);

do $$
begin
  if to_regclass('public.contracts') is not null then
    alter table public.contracts add column if not exists client_id uuid references public.clients(id) on delete set null;
    alter table public.contracts add column if not exists quote_id uuid references public.quotes(id) on delete set null;
    alter table public.contracts add column if not exists template_kind text;
  end if;
end $$;

do $$
begin
  if to_regclass('public.invoices') is not null then
    alter table public.invoices add column if not exists client_id uuid references public.clients(id) on delete set null;
    alter table public.invoices add column if not exists template_kind text;
  end if;
end $$;

do $$
begin
  if to_regclass('public.invoices') is not null
     and exists (select 1 from information_schema.columns where table_schema='public' and table_name='invoices' and column_name='quote_id') then
    begin
      alter table public.invoices
        add constraint invoices_quote_id_fkey
        foreign key (quote_id) references public.quotes(id) on delete set null;
    exception when duplicate_object then
      null;
    end;
  end if;
end $$;

do $$
begin
  if to_regclass('public.payments') is not null then
    alter table public.payments add column if not exists client_id uuid references public.clients(id) on delete set null;
  end if;
end $$;

do $$
begin
  if to_regclass('public.contracts') is not null then
    create index if not exists contracts_client_idx on public.contracts (client_id);
    create index if not exists contracts_quote_idx on public.contracts (quote_id);
  end if;
  if to_regclass('public.invoices') is not null then
    create index if not exists invoices_client_idx on public.invoices (client_id);
    create index if not exists invoices_quote_idx on public.invoices (quote_id);
  end if;
  if to_regclass('public.payments') is not null then
    create index if not exists payments_client_idx on public.payments (client_id);
  end if;
end $$;

alter table public.clients enable row level security;
alter table public.templates enable row level security;
alter table public.quotes enable row level security;
alter table public.sessions enable row level security;

drop policy if exists "clients_select_all" on public.clients;
create policy "clients_select_all" on public.clients for select to anon, authenticated using (true);
drop policy if exists "clients_insert_all" on public.clients;
create policy "clients_insert_all" on public.clients for insert to anon, authenticated with check (true);
drop policy if exists "clients_update_all" on public.clients;
create policy "clients_update_all" on public.clients for update to anon, authenticated using (true) with check (true);
drop policy if exists "clients_delete_all" on public.clients;
create policy "clients_delete_all" on public.clients for delete to anon, authenticated using (true);

drop policy if exists "templates_select_all" on public.templates;
create policy "templates_select_all" on public.templates for select to anon, authenticated using (true);
drop policy if exists "templates_insert_all" on public.templates;
create policy "templates_insert_all" on public.templates for insert to anon, authenticated with check (true);
drop policy if exists "templates_update_all" on public.templates;
create policy "templates_update_all" on public.templates for update to anon, authenticated using (true) with check (true);
drop policy if exists "templates_delete_all" on public.templates;
create policy "templates_delete_all" on public.templates for delete to anon, authenticated using (true);

drop policy if exists "quotes_select_all" on public.quotes;
create policy "quotes_select_all" on public.quotes for select to anon, authenticated using (true);
drop policy if exists "quotes_insert_all" on public.quotes;
create policy "quotes_insert_all" on public.quotes for insert to anon, authenticated with check (true);
drop policy if exists "quotes_update_all" on public.quotes;
create policy "quotes_update_all" on public.quotes for update to anon, authenticated using (true) with check (true);
drop policy if exists "quotes_delete_all" on public.quotes;
create policy "quotes_delete_all" on public.quotes for delete to anon, authenticated using (true);

drop policy if exists "sessions_select_all" on public.sessions;
create policy "sessions_select_all" on public.sessions for select to anon, authenticated using (true);
drop policy if exists "sessions_insert_all" on public.sessions;
create policy "sessions_insert_all" on public.sessions for insert to anon, authenticated with check (true);
drop policy if exists "sessions_update_all" on public.sessions;
create policy "sessions_update_all" on public.sessions for update to anon, authenticated using (true) with check (true);
drop policy if exists "sessions_delete_all" on public.sessions;
create policy "sessions_delete_all" on public.sessions for delete to anon, authenticated using (true);

insert into public.clients (
  id,
  workspace_id,
  name,
  email,
  stage,
  event_date,
  location,
  referral_source,
  notes,
  total_revenue,
  balance_due,
  inquired_on,
  created_at,
  updated_at
)
select
  w.id,
  w.id,
  coalesce(w.client_name, w.workspace->'lead'->>'name', ''),
  coalesce(w.client_email, w.workspace->'lead'->>'email', ''),
  coalesce(w.stage, w.workspace->'lead'->>'stage', 'Lead'),
  coalesce(w.event_date, nullif(w.workspace->'lead'->>'eventDate', '')::date),
  coalesce(w.workspace->'lead'->>'location', ''),
  coalesce(w.workspace->'lead'->>'referralSource', ''),
  coalesce(w.workspace->'lead'->>'notes', ''),
  coalesce(w.revenue, 0),
  coalesce(w.balance, 0),
  coalesce(nullif(w.workspace->'lead'->>'inquiredOn', '')::date, timezone('utc', now())::date),
  coalesce(w.created_at, timezone('utc', now())),
  coalesce(w.updated_at, timezone('utc', now()))
from public.crm_workspaces w
on conflict (id) do update
set
  name = excluded.name,
  email = excluded.email,
  stage = excluded.stage,
  event_date = excluded.event_date,
  location = excluded.location,
  referral_source = excluded.referral_source,
  notes = excluded.notes,
  total_revenue = excluded.total_revenue,
  balance_due = excluded.balance_due,
  updated_at = timezone('utc', now());

insert into public.quotes (
  external_id,
  client_id,
  quote_number,
  quote_number_label,
  status,
  client_name,
  client_email,
  event_name,
  event_date,
  introduction,
  expiration,
  notes,
  promo_code,
  discount_type,
  discount_value,
  subtotal,
  discount_amount,
  total_amount,
  payment_schedule,
  questionnaire,
  contract_template,
  raw,
  created_at,
  updated_at
)
select
  concat('workspace-quote-', w.id::text, '-', coalesce(q->>'id', md5(q::text))),
  w.id,
  nullif(regexp_replace(coalesce(q->>'quoteNumber', ''), '[^0-9-]', '', 'g'), '')::int,
  coalesce(q->>'quoteNumberLabel', ''),
  coalesce(q->>'status', 'Draft'),
  coalesce(q->>'clientName', w.client_name, ''),
  coalesce(q->>'clientEmail', w.client_email, ''),
  coalesce(q->>'eventName', ''),
  nullif(q->>'eventDate', '')::date,
  coalesce(q->>'introduction', ''),
  nullif(q->>'expiration', '')::date,
  coalesce(q->>'notes', ''),
  coalesce(q->>'promoCode', ''),
  coalesce(q->>'discountType', 'amount'),
  coalesce(nullif(regexp_replace(coalesce(q->>'discountValue', ''), '[^0-9.-]', '', 'g'), '')::numeric, 0),
  coalesce(nullif(regexp_replace(coalesce(q->>'subtotal', ''), '[^0-9.-]', '', 'g'), '')::numeric, 0),
  coalesce(nullif(regexp_replace(coalesce(q->>'discountAmount', ''), '[^0-9.-]', '', 'g'), '')::numeric, 0),
  coalesce(nullif(regexp_replace(coalesce(q->>'total', ''), '[^0-9.-]', '', 'g'), '')::numeric, 0),
  coalesce(q->>'paymentSchedule', ''),
  coalesce(q->>'questionnaire', ''),
  coalesce(q->>'contractTemplate', ''),
  q,
  coalesce(nullif(q->>'createdAt', '')::timestamptz, w.created_at, timezone('utc', now())),
  coalesce(nullif(q->>'updatedAt', '')::timestamptz, w.updated_at, timezone('utc', now()))
from public.crm_workspaces w
cross join lateral jsonb_array_elements(coalesce(w.workspace->'quotes', '[]'::jsonb)) q
on conflict (external_id) do update
set
  client_id = excluded.client_id,
  quote_number = excluded.quote_number,
  quote_number_label = excluded.quote_number_label,
  status = excluded.status,
  client_name = excluded.client_name,
  client_email = excluded.client_email,
  event_name = excluded.event_name,
  event_date = excluded.event_date,
  introduction = excluded.introduction,
  expiration = excluded.expiration,
  notes = excluded.notes,
  promo_code = excluded.promo_code,
  discount_type = excluded.discount_type,
  discount_value = excluded.discount_value,
  subtotal = excluded.subtotal,
  discount_amount = excluded.discount_amount,
  total_amount = excluded.total_amount,
  payment_schedule = excluded.payment_schedule,
  questionnaire = excluded.questionnaire,
  contract_template = excluded.contract_template,
  raw = excluded.raw,
  updated_at = timezone('utc', now());

insert into public.sessions (
  external_id,
  client_id,
  title,
  session_date,
  session_time,
  end_time,
  location,
  status,
  notes,
  created_at,
  updated_at
)
select
  concat('workspace-session-', w.id::text, '-', coalesce(s->>'id', md5(s::text))),
  w.id,
  coalesce(s->>'title', ''),
  nullif(s->>'date', '')::date,
  coalesce(s->>'time', ''),
  coalesce(s->>'endTime', ''),
  coalesce(s->>'location', ''),
  coalesce(s->>'status', 'Tentative'),
  coalesce(s->>'notes', ''),
  w.created_at,
  coalesce(nullif(s->>'updatedAt', '')::timestamptz, w.updated_at, timezone('utc', now()))
from public.crm_workspaces w
cross join lateral jsonb_array_elements(coalesce(w.workspace->'schedule', '[]'::jsonb)) s
on conflict (external_id) do update
set
  title = excluded.title,
  session_date = excluded.session_date,
  session_time = excluded.session_time,
  end_time = excluded.end_time,
  location = excluded.location,
  status = excluded.status,
  notes = excluded.notes,
  updated_at = timezone('utc', now());

do $$
begin
  if to_regclass('public.contract_templates') is not null then
    insert into public.templates (external_id, name, category, action, type, content, template_kind)
    select
      concat('legacy-contract-', ct.id::text),
      coalesce(ct.name, ''),
      coalesce(ct.category, ''),
      'Contract',
      'file',
      coalesce(ct.body, ''),
      'contract'
    from public.contract_templates ct
    on conflict (external_id) do update
    set
      name = excluded.name,
      category = excluded.category,
      content = excluded.content,
      template_kind = excluded.template_kind,
      updated_at = timezone('utc', now());
  end if;

  if to_regclass('public.release_templates') is not null then
    insert into public.templates (external_id, name, category, action, type, content, template_kind)
    select
      concat('legacy-release-', rt.id::text),
      coalesce(rt.name, ''),
      coalesce(rt.category, ''),
      'Release',
      'file',
      coalesce(rt.body, ''),
      'contract'
    from public.release_templates rt
    on conflict (external_id) do update
    set
      name = excluded.name,
      category = excluded.category,
      content = excluded.content,
      template_kind = excluded.template_kind,
      updated_at = timezone('utc', now());
  end if;
end $$;

do $$
begin
  if to_regclass('public.invoices') is not null then
    update public.invoices i
    set client_id = c.id
    from public.clients c
    where i.client_id is null
      and (
        (i.lead_id is not null and i.lead_id = c.id)
        or lower(coalesce(i.client_email, '')) = lower(coalesce(c.email, ''))
      );
  end if;

  if to_regclass('public.contracts') is not null then
    update public.contracts c0
    set client_id = c.id
    from public.clients c
    where c0.client_id is null
      and (
        (c0.lead_id is not null and c0.lead_id = c.id)
        or lower(coalesce(c0.client_email, '')) = lower(coalesce(c.email, ''))
      );
  end if;

  if to_regclass('public.payments') is not null and to_regclass('public.invoices') is not null then
    update public.payments p
    set client_id = i.client_id
    from public.invoices i
    where p.client_id is null
      and p.invoice_id = i.id
      and i.client_id is not null;
  end if;
end $$;

-- Ensure pgcrypto is available
create extension if not exists pgcrypto;

-- ── 1. CONTRACTS & MODEL RELEASES ──

create table if not exists public.contracts (
    id uuid primary key default gen_random_uuid(),
    template_id uuid,
    title text,
    client_name text,
    client_email text,
    session_type text,
    session_date date,
    location text,
    package_name text,
    total_amount numeric default 0,
    status text default 'Draft',
    sent_on date,
    signed_on date,
    signer text,
    version text default 'v1',
    body text,
    lead_id uuid,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.model_releases (
    id uuid primary key default gen_random_uuid(),
    template_id uuid,
    title text,
    client_name text,
    client_email text,
    session_type text,
    session_date date,
    location text,
    status text default 'Draft',
    sent_on date,
    signed_on date,
    signer text,
    version text default 'v1',
    body text,
    lead_id uuid,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ── 2. INVOICES & PAYMENTS ──

create table if not exists public.invoices (
    id uuid primary key default gen_random_uuid(),
    invoice_number text,
    title text,
    client_name text,
    client_email text,
    session_type text,
    session_date date,
    package_name text,
    subtotal numeric default 0,
    discount_amount numeric default 0,
    total_amount numeric default 0,
    amount numeric default 0, -- redundant but used in mapping
    amount_paid numeric default 0,
    balance_due numeric default 0,
    status text default 'Draft',
    due_date date,
    invoice_type text default 'full',
    payment_method text default 'square',
    square_link text,
    notes text,
    issued_on date,
    lead_id uuid,
    quote_id uuid,
    contract_id uuid,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    invoice_id uuid references public.invoices(id) on delete cascade,
    amount numeric default 0,
    method text,
    reference text,
    note text,
    paid_on date,
    created_at timestamptz default now()
);

-- ── 3. TEMPLATES ──

create table if not exists public.contract_templates (
    id uuid primary key default gen_random_uuid(),
    name text,
    category text,
    body text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.release_templates (
    id uuid primary key default gen_random_uuid(),
    name text,
    category text,
    body text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ── 4. SAFETY: ADD MISSING COLUMNS IF TABLES PRE-EXIST ──

do $$ 
begin
    -- Add 'title' to contracts if missing
    if not exists (select 1 from information_schema.columns where table_name='contracts' and column_name='title') then
        alter table public.contracts add column title text;
    end if;

    -- Add 'title' to model_releases if missing
    if not exists (select 1 from information_schema.columns where table_name='model_releases' and column_name='title') then
        alter table public.model_releases add column title text;
    end if;

    -- Add 'title' to invoices if missing
    if not exists (select 1 from information_schema.columns where table_name='invoices' and column_name='title') then
        alter table public.invoices add column title text;
    end if;
end $$;

-- ── 5. SECURITY (RLS POLICIES) ──

-- Enable RLS
alter table public.contracts enable row level security;
alter table public.model_releases enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.contract_templates enable row level security;
alter table public.release_templates enable row level security;

-- Open policies (Select)
create policy "Select open for all" on public.contracts for select using (true);
create policy "Select open for all" on public.model_releases for select using (true);
create policy "Select open for all" on public.invoices for select using (true);
create policy "Select open for all" on public.payments for select using (true);
create policy "Select open for all" on public.contract_templates for select using (true);
create policy "Select open for all" on public.release_templates for select using (true);

-- Open policies (Insert)
create policy "Insert open for all" on public.contracts for insert with check (true);
create policy "Insert open for all" on public.model_releases for insert with check (true);
create policy "Insert open for all" on public.invoices for insert with check (true);
create policy "Insert open for all" on public.payments for insert with check (true);
create policy "Insert open for all" on public.contract_templates for insert with check (true);
create policy "Insert open for all" on public.release_templates for insert with check (true);

-- Open policies (Update)
create policy "Update open for all" on public.contracts for update using (true) with check (true);
create policy "Update open for all" on public.model_releases for update using (true) with check (true);
create policy "Update open for all" on public.invoices for update using (true) with check (true);
create policy "Update open for all" on public.payments for update using (true) with check (true);
create policy "Update open for all" on public.contract_templates for update using (true) with check (true);
create policy "Update open for all" on public.release_templates for update using (true) with check (true);

-- Open policies (Delete)
create policy "Delete open for all" on public.contracts for delete using (true);
create policy "Delete open for all" on public.model_releases for delete using (true);
create policy "Delete open for all" on public.invoices for delete using (true);
create policy "Delete open for all" on public.payments for delete using (true);
create policy "Delete open for all" on public.contract_templates for delete using (true);
create policy "Delete open for all" on public.release_templates for delete using (true);

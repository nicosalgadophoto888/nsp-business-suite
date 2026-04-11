-- Backfill relational links for existing CRM data.
-- This migration is intentionally conservative: it only links rows when a confident match exists.

-- 1) INVOICES → CLIENTS
do $$
begin
  if to_regclass('public.invoices') is not null and to_regclass('public.clients') is not null then
    -- First preference: legacy lead_id already points to the client UUID.
    update public.invoices i
    set client_id = c.id
    from public.clients c
    where i.client_id is null
      and i.lead_id is not null
      and i.lead_id = c.id;

    -- Second preference: unique email match.
    with email_matches as (
      select
        i.id as invoice_id,
        min(c.id) as client_id,
        count(*) as match_count
      from public.invoices i
      join public.clients c
        on lower(coalesce(i.client_email, '')) = lower(coalesce(c.email, ''))
      where i.client_id is null
        and coalesce(i.client_email, '') <> ''
      group by i.id
    )
    update public.invoices i
    set client_id = em.client_id
    from email_matches em
    where i.id = em.invoice_id
      and em.match_count = 1
      and i.client_id is null;

    -- Third preference: unique name match.
    with name_matches as (
      select
        i.id as invoice_id,
        min(c.id) as client_id,
        count(*) as match_count
      from public.invoices i
      join public.clients c
        on lower(trim(coalesce(i.client_name, ''))) = lower(trim(coalesce(c.name, '')))
      where i.client_id is null
        and coalesce(i.client_name, '') <> ''
      group by i.id
    )
    update public.invoices i
    set client_id = nm.client_id
    from name_matches nm
    where i.id = nm.invoice_id
      and nm.match_count = 1
      and i.client_id is null;
  end if;
end $$;

-- 2) CONTRACTS → CLIENTS
do $$
begin
  if to_regclass('public.contracts') is not null and to_regclass('public.clients') is not null then
    update public.contracts c0
    set client_id = c.id
    from public.clients c
    where c0.client_id is null
      and c0.lead_id is not null
      and c0.lead_id = c.id;

    with email_matches as (
      select
        c0.id as contract_id,
        min(c.id) as client_id,
        count(*) as match_count
      from public.contracts c0
      join public.clients c
        on lower(coalesce(c0.client_email, '')) = lower(coalesce(c.email, ''))
      where c0.client_id is null
        and coalesce(c0.client_email, '') <> ''
      group by c0.id
    )
    update public.contracts c0
    set client_id = em.client_id
    from email_matches em
    where c0.id = em.contract_id
      and em.match_count = 1
      and c0.client_id is null;

    with name_matches as (
      select
        c0.id as contract_id,
        min(c.id) as client_id,
        count(*) as match_count
      from public.contracts c0
      join public.clients c
        on lower(trim(coalesce(c0.client_name, ''))) = lower(trim(coalesce(c.name, '')))
      where c0.client_id is null
        and coalesce(c0.client_name, '') <> ''
      group by c0.id
    )
    update public.contracts c0
    set client_id = nm.client_id
    from name_matches nm
    where c0.id = nm.contract_id
      and nm.match_count = 1
      and c0.client_id is null;
  end if;
end $$;

-- 3) QUOTES → CLIENTS (safety for legacy/partial records)
do $$
begin
  if to_regclass('public.quotes') is not null and to_regclass('public.clients') is not null then
    -- Only touch rows with missing client_id if they exist (column may already be constrained).
    with email_matches as (
      select
        q.id as quote_id,
        min(c.id) as client_id,
        count(*) as match_count
      from public.quotes q
      join public.clients c
        on lower(coalesce(q.client_email, '')) = lower(coalesce(c.email, ''))
      where q.client_id is null
        and coalesce(q.client_email, '') <> ''
      group by q.id
    )
    update public.quotes q
    set client_id = em.client_id
    from email_matches em
    where q.id = em.quote_id
      and em.match_count = 1
      and q.client_id is null;
  end if;
exception
  when undefined_column then
    -- If an environment has stricter/older quote schema, skip gracefully.
    null;
end $$;

-- 4) INVOICES → QUOTES
do $$
begin
  if to_regclass('public.invoices') is not null and to_regclass('public.quotes') is not null then
    -- Link invoice to quote by explicit quote number label when present and uniquely matched for the same client.
    with quote_label_matches as (
      select
        i.id as invoice_id,
        min(q.id) as quote_id,
        count(*) as match_count
      from public.invoices i
      join public.quotes q
        on q.client_id = i.client_id
       and lower(trim(coalesce(q.quote_number_label, ''))) = lower(trim(coalesce(i.invoice_number, '')))
      where i.quote_id is null
        and i.client_id is not null
        and coalesce(i.invoice_number, '') <> ''
      group by i.id
    )
    update public.invoices i
    set quote_id = qm.quote_id
    from quote_label_matches qm
    where i.id = qm.invoice_id
      and qm.match_count = 1
      and i.quote_id is null;

    -- Fallback: if a client has exactly one quote, map all missing invoice.quote_id to that quote.
    with one_quote_clients as (
      select client_id, min(id) as quote_id
      from public.quotes
      group by client_id
      having count(*) = 1
    )
    update public.invoices i
    set quote_id = oq.quote_id
    from one_quote_clients oq
    where i.quote_id is null
      and i.client_id = oq.client_id;
  end if;
end $$;

-- 5) CONTRACTS → QUOTES
do $$
begin
  if to_regclass('public.contracts') is not null and to_regclass('public.quotes') is not null then
    -- If only one quote exists for that client, link contract to it.
    with one_quote_clients as (
      select client_id, min(id) as quote_id
      from public.quotes
      group by client_id
      having count(*) = 1
    )
    update public.contracts c0
    set quote_id = oq.quote_id
    from one_quote_clients oq
    where c0.quote_id is null
      and c0.client_id = oq.client_id;
  end if;
end $$;

-- 6) SESSIONS → QUOTES
do $$
begin
  if to_regclass('public.sessions') is not null and to_regclass('public.quotes') is not null then
    -- Direct date/event match for same client when unique.
    with session_quote_matches as (
      select
        s.id as session_id,
        min(q.id) as quote_id,
        count(*) as match_count
      from public.sessions s
      join public.quotes q
        on q.client_id = s.client_id
       and (
         (s.session_date is not null and q.event_date = s.session_date)
         or (
           s.session_date is null
           and coalesce(s.title, '') <> ''
           and lower(trim(coalesce(q.event_name, ''))) = lower(trim(coalesce(s.title, '')))
         )
       )
      where s.quote_id is null
      group by s.id
    )
    update public.sessions s
    set quote_id = sqm.quote_id
    from session_quote_matches sqm
    where s.id = sqm.session_id
      and sqm.match_count = 1
      and s.quote_id is null;

    -- Fallback: one-quote client mapping.
    with one_quote_clients as (
      select client_id, min(id) as quote_id
      from public.quotes
      group by client_id
      having count(*) = 1
    )
    update public.sessions s
    set quote_id = oq.quote_id
    from one_quote_clients oq
    where s.quote_id is null
      and s.client_id = oq.client_id;
  end if;
end $$;

-- 7) PAYMENTS → CLIENTS via INVOICES
do $$
begin
  if to_regclass('public.payments') is not null and to_regclass('public.invoices') is not null then
    update public.payments p
    set client_id = i.client_id
    from public.invoices i
    where p.client_id is null
      and p.invoice_id = i.id
      and i.client_id is not null;
  end if;
end $$;

-- 8) TEMPLATE KIND BACKFILL
do $$
begin
  if to_regclass('public.templates') is not null then
    update public.templates
    set template_kind = case
      when lower(coalesce(type, '')) = 'email' and lower(coalesce(name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(action, '')) like '%questionnaire%' then 'questionnaire'
      when lower(coalesce(type, '')) = 'email' then 'email'
      when lower(coalesce(name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(action, '')) like '%contract%'
        or lower(coalesce(name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(action, '')) like '%agreement%' then 'contract'
      when lower(coalesce(name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(action, '')) like '%questionnaire%' then 'questionnaire'
      when lower(coalesce(name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(action, '')) like '%package%'
        or lower(coalesce(name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(action, '')) like '%quote%'
        or lower(coalesce(name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(action, '')) like '%proposal%' then 'package'
      else coalesce(nullif(template_kind, ''), 'file')
    end
    where template_kind is null
       or template_kind = ''
       or template_kind = 'file';
  end if;
end $$;

-- 9) Helpful indexes for relational lookups.
create index if not exists quotes_client_status_idx on public.quotes (client_id, status);
create index if not exists invoices_client_quote_idx on public.invoices (client_id, quote_id);
create index if not exists contracts_client_quote_idx on public.contracts (client_id, quote_id);
create index if not exists sessions_client_quote_idx on public.sessions (client_id, quote_id);

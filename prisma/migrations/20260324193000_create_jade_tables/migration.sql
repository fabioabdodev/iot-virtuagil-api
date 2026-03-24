-- Jade CRM + Memory schema
-- Consolidated as Prisma migration to version manual Supabase SQL changes.

create extension if not exists pgcrypto;

create table if not exists public.jade_contacts (
  id uuid primary key default gen_random_uuid(),
  lead_phone text not null unique,
  lead_name text,
  source text default 'whatsapp',
  is_client boolean not null default false,
  client_id text,
  tags text[] default '{}',
  status text default 'active',
  notes text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jade_conversations (
  id uuid primary key default gen_random_uuid(),
  lead_phone text not null unique,
  lead_name text,
  is_client boolean not null default false,
  client_id text,
  channel text not null default 'whatsapp',
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jade_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.jade_conversations(id) on delete cascade,
  lead_phone text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.jade_follow_up_queue (
  id uuid primary key default gen_random_uuid(),
  lead_phone text not null,
  lead_name text,
  is_client boolean not null default false,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'done', 'canceled')),
  priority int not null default 3,
  next_contact_at timestamptz,
  last_attempt_at timestamptz,
  attempts int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jade_human_handoff (
  id uuid primary key default gen_random_uuid(),
  lead_phone text not null,
  lead_name text,
  reason text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'canceled')),
  assigned_to text,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_jade_messages_conversation_created_at on public.jade_messages (conversation_id, created_at desc);
create index if not exists idx_jade_messages_lead_phone_created_at on public.jade_messages (lead_phone, created_at desc);
create index if not exists idx_jade_followup_status_next on public.jade_follow_up_queue (status, next_contact_at);
create index if not exists idx_jade_handoff_status_created on public.jade_human_handoff (status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_jade_contacts_updated_at on public.jade_contacts;
create trigger trg_jade_contacts_updated_at
before update on public.jade_contacts
for each row execute function public.set_updated_at();

drop trigger if exists trg_jade_conversations_updated_at on public.jade_conversations;
create trigger trg_jade_conversations_updated_at
before update on public.jade_conversations
for each row execute function public.set_updated_at();

drop trigger if exists trg_jade_followup_updated_at on public.jade_follow_up_queue;
create trigger trg_jade_followup_updated_at
before update on public.jade_follow_up_queue
for each row execute function public.set_updated_at();

drop trigger if exists trg_jade_handoff_updated_at on public.jade_human_handoff;
create trigger trg_jade_handoff_updated_at
before update on public.jade_human_handoff
for each row execute function public.set_updated_at();

alter table public.jade_contacts enable row level security;
alter table public.jade_conversations enable row level security;
alter table public.jade_messages enable row level security;
alter table public.jade_follow_up_queue enable row level security;
alter table public.jade_human_handoff enable row level security;

revoke all on table public.jade_contacts from anon, authenticated;
revoke all on table public.jade_conversations from anon, authenticated;
revoke all on table public.jade_messages from anon, authenticated;
revoke all on table public.jade_follow_up_queue from anon, authenticated;
revoke all on table public.jade_human_handoff from anon, authenticated;

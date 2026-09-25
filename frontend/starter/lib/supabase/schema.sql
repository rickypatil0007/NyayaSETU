-- Minimal schema for the hackathon build. Deliberately NOT the full
-- documents/regulations/agent_runs/audit_logs schema from the original spec —
-- add tables back only if you have days to spare, which you don't.

create extension if not exists pgcrypto;

create table if not exists audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  document_name text,
  document_text text not null,
  status text not null default 'pending', -- pending | running | complete | error
  created_at timestamptz not null default now()
);

create table if not exists findings (
  id text not null,
  audit_id uuid not null references audits(id) on delete cascade,
  claim text not null,
  citations jsonb not null default '[]',
  status text, -- upheld | dismissed | escalated | unresolved
  reasoning text,
  created_at timestamptz not null default now(),
  primary key (audit_id, id)
);

create table if not exists escalations (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references audits(id) on delete cascade,
  finding_id text not null,
  reason text,
  status text not null default 'pending_human_review',
  created_at timestamptz not null default now()
);

alter table audits enable row level security;
alter table findings enable row level security;
alter table escalations enable row level security;

create policy "users manage own audits" on audits
  for all using (auth.uid() = user_id);

create policy "users read own findings" on findings
  for select using (
    exists (select 1 from audits a where a.id = findings.audit_id and a.user_id = auth.uid())
  );

create policy "users read own escalations" on escalations
  for select using (
    exists (select 1 from audits a where a.id = escalations.audit_id and a.user_id = auth.uid())
  );

-- PlanBiz : schéma Supabase (déjà appliqué sur le projet PlanBiz, conservé pour réinstallation)

-- 1) Business plans : un utilisateur ne voit et ne modifie que les siens
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null default 'Nouveau business',
  sector text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists businesses_owner_idx on public.businesses(owner, updated_at desc);
alter table public.businesses enable row level security;
create policy "owner can read"   on public.businesses for select to authenticated using (owner = (select auth.uid()));
create policy "owner can insert" on public.businesses for insert to authenticated with check (owner = (select auth.uid()));
create policy "owner can update" on public.businesses for update to authenticated using (owner = (select auth.uid())) with check (owner = (select auth.uid()));
create policy "owner can delete" on public.businesses for delete to authenticated using (owner = (select auth.uid()));
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
create trigger businesses_touch before update on public.businesses for each row execute function public.touch_updated_at();

-- 2) Quota journalier de demandes IA par utilisateur
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  calls integer not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
create policy "user reads own usage" on public.ai_usage for select to authenticated using (user_id = (select auth.uid()));
create or replace function public.consume_ai_credit(max_per_day integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if auth.uid() is null then return false; end if;
  insert into public.ai_usage (user_id, day, calls) values (auth.uid(), current_date, 1)
  on conflict (user_id, day) do update set calls = public.ai_usage.calls + 1
  returning calls into n;
  return n <= greatest(1, least(max_per_day, 500));
end; $$;
revoke all on function public.consume_ai_credit(integer) from public, anon;
grant execute on function public.consume_ai_credit(integer) to authenticated;

-- ============================================================================
-- LVFC Session Planner - initial schema
--
-- Access model
--   * every coach belongs to exactly one club
--   * a coach owns their own sessions and practices (their library)
--   * anything marked shared is visible to the whole club, read-only to others
--   * admins manage club settings and can read everything in their own club
--
-- Access control is enforced by row-level security, not by the UI. A coach
-- cannot read another coach's private sessions even by calling the API directly.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- clubs ----
create table if not exists public.clubs (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  -- club-wide planner settings (age groups, session days, planning rules).
  -- Stored server-side so changing them reaches every coach immediately.
  settings     jsonb not null default '{}'::jsonb,
  join_code    text unique,
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------- profiles ----
-- One row per auth user. Mirrors auth.users and carries club membership.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  club_id      uuid references public.clubs(id) on delete set null,
  full_name    text not null default '',
  role         text not null default 'coach' check (role in ('coach','admin')),
  created_at   timestamptz not null default now()
);

create index if not exists profiles_club_idx on public.profiles(club_id);

-- ------------------------------------------------------------- sessions ----
-- A saved session plan. The plan itself (drills, diagrams, notes) is jsonb so
-- the planner can evolve without a migration; the columns are the fields we
-- actually query, filter and sort on.
create table if not exists public.sessions (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  club_id      uuid references public.clubs(id) on delete set null,
  title        text not null default '',
  age_group    text not null default 'U10',
  session_date date,
  month        int check (month between 1 and 3),
  week_block   text check (week_block in ('w12','w34')),
  cycle_day    text check (cycle_day in ('mon-thu','tue-fri','wed-sat')),
  total_mins   int not null default 0,
  shared       boolean not null default false,
  plan         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists sessions_owner_idx  on public.sessions(owner_id, updated_at desc);
create index if not exists sessions_club_idx   on public.sessions(club_id) where shared;
create index if not exists sessions_age_idx    on public.sessions(club_id, age_group);

-- ------------------------------------------------------------ practices ----
-- A reusable practice (one diagram + its notes) in a coach's own library,
-- or promoted to the club library by an admin.
create table if not exists public.practices (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  club_id      uuid references public.clubs(id) on delete set null,
  name         text not null default 'Untitled practice',
  tag          text not null default '',
  mins         int not null default 15,
  rolling      int not null default 70 check (rolling between 0 and 100),
  principles   int[] not null default '{}',
  shared       boolean not null default false,
  -- true only for practices the club has approved into the official library
  official     boolean not null default false,
  detail       jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists practices_owner_idx on public.practices(owner_id, updated_at desc);
create index if not exists practices_club_idx  on public.practices(club_id) where shared;

-- ------------------------------------------------------- updated_at ----
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists sessions_touch on public.sessions;
create trigger sessions_touch before update on public.sessions
  for each row execute function public.touch_updated_at();

drop trigger if exists practices_touch on public.practices;
create trigger practices_touch before update on public.practices
  for each row execute function public.touch_updated_at();

-- ------------------------------------------ new user -> profile row ----
-- Creates the profile automatically on sign-up and honours a join code passed
-- as sign-up metadata, so a coach lands in the right club without admin work.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_club uuid;
  v_code text;
begin
  v_code := nullif(trim(new.raw_user_meta_data->>'join_code'), '');
  if v_code is not null then
    select id into v_club from public.clubs where join_code = v_code;
  end if;

  insert into public.profiles (id, club_id, full_name, role)
  values (
    new.id,
    v_club,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'coach'
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row level security
-- ============================================================================
alter table public.clubs     enable row level security;
alter table public.profiles  enable row level security;
alter table public.sessions  enable row level security;
alter table public.practices enable row level security;

-- Helpers. security definer so they can read profiles without recursing into
-- the very policies that call them.
create or replace function public.my_club()
returns uuid language sql stable security definer set search_path = public as $$
  select club_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

-- ---------------------------------------------------------------- clubs ----
drop policy if exists clubs_read on public.clubs;
create policy clubs_read on public.clubs
  for select using (id = public.my_club());

-- only an admin may change club settings, and only for their own club
drop policy if exists clubs_admin_update on public.clubs;
create policy clubs_admin_update on public.clubs
  for update using (id = public.my_club() and public.is_admin())
  with check (id = public.my_club() and public.is_admin());

-- ------------------------------------------------------------- profiles ----
drop policy if exists profiles_read_self on public.profiles;
create policy profiles_read_self on public.profiles
  for select using (id = auth.uid() or club_id = public.my_club());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- an admin may change roles and membership inside their own club
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
  for update using (club_id = public.my_club() and public.is_admin())
  with check (club_id = public.my_club());

-- ------------------------------------------------------------- sessions ----
-- A coach reads their own sessions, plus anything shared inside their club.
drop policy if exists sessions_read on public.sessions;
create policy sessions_read on public.sessions
  for select using (
    owner_id = auth.uid()
    or (shared and club_id = public.my_club())
    or (public.is_admin() and club_id = public.my_club())
  );

drop policy if exists sessions_insert on public.sessions;
create policy sessions_insert on public.sessions
  for insert with check (owner_id = auth.uid());

drop policy if exists sessions_update on public.sessions;
create policy sessions_update on public.sessions
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists sessions_delete on public.sessions;
create policy sessions_delete on public.sessions
  for delete using (owner_id = auth.uid());

-- ------------------------------------------------------------ practices ----
drop policy if exists practices_read on public.practices;
create policy practices_read on public.practices
  for select using (
    owner_id = auth.uid()
    or (shared and club_id = public.my_club())
    or (public.is_admin() and club_id = public.my_club())
  );

drop policy if exists practices_insert on public.practices;
create policy practices_insert on public.practices
  for insert with check (owner_id = auth.uid());

drop policy if exists practices_update on public.practices;
create policy practices_update on public.practices
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists practices_delete on public.practices;
create policy practices_delete on public.practices
  for delete using (owner_id = auth.uid());

-- only an admin may mark a practice as official club material
drop policy if exists practices_admin_update on public.practices;
create policy practices_admin_update on public.practices
  for update using (club_id = public.my_club() and public.is_admin())
  with check (club_id = public.my_club() and public.is_admin());

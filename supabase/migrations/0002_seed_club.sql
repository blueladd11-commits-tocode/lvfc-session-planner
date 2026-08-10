-- ============================================================================
-- Creates the LVFC club row and its default planner settings.
-- Run this once, after 0001_init.sql.
--
-- The join code is what coaches type when they sign up.
--
-- REPLACE THE PLACEHOLDER BELOW before you run this. Anyone holding the code
-- can create a coach account in your club, so treat it like a door key: give it
-- only to coaching staff, and change it if it ever gets out.
--
-- This repository is public, so a real code must never be committed here.
-- ============================================================================

insert into public.clubs (name, slug, join_code, settings)
values (
  'Lahore Virgil Football Club',
  'lvfc',
  'CHANGE-THIS-BEFORE-RUNNING',
  jsonb_build_object(
    'club',          'LVFC',
    'quarterAnchor', 1,
    'ages',          jsonb_build_array('U8','U10','U12','13+'),
    'days',          jsonb_build_array('mon-thu','tue-fri','wed-sat'),
    'practices',     null,
    'autoPosition',  true,
    'allowOverride', true,
    'lockDurations', false,
    'requireFields', false
  )
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Promote yourself to admin AFTER you have signed up through the app.
-- Replace the email, then run it:
--
--   update public.profiles p
--      set role = 'admin',
--          club_id = (select id from public.clubs where slug = 'lvfc')
--     from auth.users u
--    where u.id = p.id
--      and u.email = 'you@example.com';
--
-- Check it worked:
--   select u.email, p.role, c.name
--     from public.profiles p
--     join auth.users u on u.id = p.id
--     left join public.clubs c on c.id = p.club_id;
-- ---------------------------------------------------------------------------

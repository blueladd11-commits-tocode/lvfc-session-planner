# Going live

About 20 minutes. Everything here needs your own accounts, so these are the
steps only you can do.

---

## 1. Create the Supabase project

1. Sign up at <https://supabase.com> and create a project.
2. Pick a region close to Lahore — **Singapore** or **Mumbai** — so the app
   feels quick.
3. Save the database password Supabase gives you somewhere safe. You will not
   be shown it again.

The free tier is comfortably enough for a club: it covers hundreds of coaches
and thousands of sessions.

## 2. Create the tables

In the Supabase dashboard, open **SQL Editor**, then run each file in order:

1. Paste all of `supabase/migrations/0001_init.sql` and run it.
2. Paste all of `supabase/migrations/0002_seed_club.sql` and run it.

The second one creates the club and its join code. **Change the join code**
from `LVFC-2026` to something only your staff knows:

```sql
update public.clubs set join_code = 'YOUR-CODE-HERE' where slug = 'lvfc';
```

## 3. Turn on email confirmation

**Authentication → Providers → Email.**

- Leave **Confirm email** on. Coaches then have to click a link before their
  account works, which stops strangers signing up with someone else's address.
- Under **URL Configuration**, set the Site URL to wherever you publish the app
  (step 5), so confirmation links come back to the right place.

## 4. Connect the app

Open `app/config.js` and paste in the two values from
**Project Settings → API**:

```js
window.LVFC_CONFIG = {
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "eyJ...your anon public key...",
  joinCodeHint: "Ask your Head of Coaching for the club join code."
};
```

Use the key labelled **anon / public**. It is meant to be visible in the
browser. Never paste the **service_role** key here — it bypasses every
security policy.

## 5. Publish it

`app/` is plain static files, so any of these work. GitHub Pages is free and
fine:

```bash
cd lvfc-session-planner
git remote add origin https://github.com/YOUR-USERNAME/lvfc-session-planner.git
git branch -M main
git push -u origin main
```

Then **Settings → Pages → Source: Deploy from a branch**, branch `main`,
folder `/app`. Your URL will be
`https://YOUR-USERNAME.github.io/lvfc-session-planner/`.

Netlify or Cloudflare Pages work the same way if you would rather drag the
folder in.

Whichever you pick, put that URL back into Supabase as the Site URL (step 3).

## 6. Make yourself the admin

Sign up through the app first, using the join code. Then run this in the SQL
Editor with your own email:

```sql
update public.profiles p
   set role = 'admin',
       club_id = (select id from public.clubs where slug = 'lvfc')
  from auth.users u
 where u.id = p.id
   and u.email = 'you@example.com';
```

Sign out and back in. You will now see **Setup**, and your changes there apply
to every coach.

## 7. Add your coaches

Give them the app URL and the join code. They create their own accounts — you
never handle anyone's password.

To check who has joined:

```sql
select u.email, p.full_name, p.role, c.name as club
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.clubs c on c.id = p.club_id
 order by u.created_at desc;
```

---

## Afterwards

**Backups.** Supabase takes daily backups on paid plans. On the free tier, take
your own now and then: **Database → Backups**, or run a manual export.

**If the join code leaks**, change it. Existing coaches are unaffected — the
code is only used at sign-up.

```sql
update public.clubs set join_code = 'NEW-CODE' where slug = 'lvfc';
```

**Removing a coach.** Deleting the user in **Authentication → Users** removes
their sessions too, because of the cascade. If you want to keep their work,
reassign it first:

```sql
update public.sessions
   set owner_id = (select id from public.profiles p join auth.users u on u.id = p.id
                    where u.email = 'newowner@example.com')
 where owner_id = (select id from public.profiles p join auth.users u on u.id = p.id
                    where u.email = 'leaver@example.com');
```

## If something breaks

**Coaches see "Not signed in" straight after signing in.** The profile row was
not created. Check the `on_auth_user_created` trigger exists, and that
`0001_init.sql` ran without errors.

**A coach has no club.** They signed up without the join code, or with the
wrong one. Fix it directly:

```sql
update public.profiles set club_id = (select id from public.clubs where slug = 'lvfc')
 where id = (select id from auth.users where email = 'coach@example.com');
```

**Nothing loads and the console shows CORS errors.** The Site URL in Supabase
does not match where the app is published. Fix it in **Authentication → URL
Configuration**.

**Sessions save but never appear on another device.** The coach is in offline
mode. Sign out and back in.

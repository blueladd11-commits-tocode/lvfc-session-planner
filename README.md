# LVFC Session Planner

Session planning for Lahore Virgil Football Club, built around the club
curriculum and the LVFC Coaching Methodology.

A coach picks their age group and date; the planner works out where that falls
in the quarterly cycle, builds the session blocks the curriculum prescribes,
and checks the finished plan against the ten coaching principles. Sessions save
to the coach's own library and can be shared with the club.

---

## What it does

**Curriculum-driven.** Pick an age group and a date. The planner derives the
month, the week block and the session day, shows the technical and tactical
focus for that exact point in the cycle, and builds the correct time blocks:
`10' Gamification, 20' Technical, 25' Tactical` for Mon/Thu, three SSG stations
for Tue/Fri, and the 60-minute Arrival / Development / Festival shape for 13+.

**A drill board.** Drag-and-drop players, equipment, zones and movement arrows
on five pitch presets. Every practice in the library is game-based; the
methodology rules out cone-only drills.

**A methodology check.** Ball rolling time against the 70% target, scoring
systems, differentiation, guided questions, principle coverage, and
players-per-ball read straight off the diagram.

**Per-coach libraries.** Each coach owns their sessions. Sharing with the club
is deliberate, and shared sessions stay read-only to everyone else.

**Club control.** An admin sets which age groups, which session days and which
planning rules coaches get. Settings live on the server, so a change reaches
every coach at their next load.

---

## Layout

```
app/                the planner (static files, no build step)
  index.html        markup and the sign-in gate
  styles.css
  planner.js        curriculum, drill board, methodology check
  api.js            Supabase Auth + PostgREST client, no SDK
  cloud.js          sign-in, sync, club library
  config.js         your backend URL and public key
supabase/migrations
  0001_init.sql     tables, triggers, row-level security
  0002_seed_club.sql  the club row and its join code
tools/
  mock_supabase.py  local stand-in for Supabase, for development
  test_access.py    access-control tests
docs/DEPLOY.md      setup, step by step
```

---

## Running it locally

No Node, no build step. Two terminals:

```bash
python3 tools/mock_supabase.py --port 8788 --reset
```

```bash
python3 -m http.server 8790 --directory app
```

Point `app/config.js` at the mock:

```js
window.LVFC_CONFIG = {
  supabaseUrl: "http://127.0.0.1:8788",
  supabaseAnonKey: "mock-anon-key"
};
```

Then open <http://localhost:8790>. Sign up with join code `LVFC-2026`.

The mock is a development tool only. It stores tokens as plain random strings
and is not a security boundary — never point it at real data.

## Tests

```bash
python3 tools/mock_supabase.py --port 8788 --reset &
python3 tools/test_access.py
```

30 checks covering sign-up rules, sign-in, token refresh and replay, per-coach
isolation, deliberate sharing, club boundaries, and admin permissions. Each one
mirrors a policy in `0001_init.sql`.

---

## Going live

See [docs/DEPLOY.md](docs/DEPLOY.md). In short: create a Supabase project, run
the two migrations, paste the project URL and anon key into `app/config.js`,
and publish `app/` to any static host.

## Security notes

- The **anon key belongs in the browser**. It grants nothing by itself; every
  read and write is checked against row-level security.
- The **service_role key must never appear in this repo.** It bypasses all
  policies.
- Access control lives in the database, not the UI. Hiding a button is a
  convenience; the policy is what actually stops a coach reading another
  coach's work.
- If you later store player names, dates of birth or medical notes, you are
  handling children's personal data. Get the club's data-protection position
  agreed before you add those fields.

## Offline

With `config.js` left empty the planner runs offline and saves to the browser.
Coaches can also choose "Use offline instead" at the sign-in screen — useful at
a pitch with no signal. Offline sessions stay on that device.

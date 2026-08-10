/* ============================================================================
   Connect screen.

   Lets an admin paste their Supabase project URL and anon key into the app
   instead of editing config.js, then checks the project is actually set up
   correctly and says plainly what is wrong when it is not.

   The values are kept in this browser. Once you are happy, paste the same two
   values into config.js so every coach gets them without doing this.
   ========================================================================== */
"use strict";

const Setup = (function () {
  const KEY = "lvfc.backend";

  function saved() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "null");
    } catch (_) {
      return null;
    }
  }

  /* Applied before api.js reads window.LVFC_CONFIG. A value pasted here wins
     over an empty config.js, but never over one an admin has filled in. */
  function apply() {
    const c = window.LVFC_CONFIG || (window.LVFC_CONFIG = {});
    if (c.supabaseUrl && c.supabaseAnonKey) return;
    const s = saved();
    if (s && s.url && s.key) {
      c.supabaseUrl = s.url;
      c.supabaseAnonKey = s.key;
    }
  }

  function store(url, key) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ url, key }));
    } catch (_) {}
  }

  function clear() {
    try {
      localStorage.removeItem(KEY);
    } catch (_) {}
  }

  /* ---------------------------------------------------------------- checks */
  // Each check is a plain-language question about the project, so a failure
  // tells you which deployment step to go back to.
  async function diagnose(url, key) {
    const base = String(url || "").replace(/\/+$/, "");
    const out = [];
    const add = (ok, label, detail) => out.push({ ok, label, detail });

    if (!/^https?:\/\//.test(base)) {
      add(false, "Project URL", "Must start with https:// - copy it from Project Settings, API.");
      return out;
    }
    if (!key || key.length < 20) {
      add(false, "Anon key", "That key looks too short. Copy the whole anon / public key.");
      return out;
    }
    if (/service_role/.test(key)) {
      add(false, "Wrong key", "That is the service_role key. It bypasses all security - use the anon / public key.");
      return out;
    }

    const head = { apikey: key, "Content-Type": "application/json" };

    // reachable?
    try {
      const r = await fetch(base + "/rest/v1/", { headers: head });
      add(r.ok || r.status === 404, "Project reachable",
        r.ok || r.status === 404 ? "Supabase answered." : "Answered with " + r.status + ".");
      if (!r.ok && r.status === 401) {
        add(false, "Anon key accepted", "The key was rejected. Check you copied the anon / public key.");
        return out;
      }
    } catch (e) {
      add(false, "Project reachable",
        "Could not reach it. Check the URL, and that this page's address is set as the Site URL in Supabase.");
      return out;
    }

    // tables present?
    for (const t of ["clubs", "profiles", "sessions", "practices"]) {
      try {
        const r = await fetch(base + "/rest/v1/" + t + "?select=id&limit=1", { headers: head });
        if (r.status === 404) {
          add(false, "Table: " + t, "Missing. Run supabase/migrations/0001_init.sql in the SQL editor.");
        } else if (r.status === 401 || r.status === 403 || r.ok) {
          // 401/403 here is a good sign: the table exists and RLS is refusing anonymous reads
          add(true, "Table: " + t, r.ok ? "Present." : "Present and protected.");
        } else {
          add(false, "Table: " + t, "Unexpected response " + r.status + ".");
        }
      } catch (_) {
        add(false, "Table: " + t, "Could not check it.");
      }
    }

    // RLS actually on? An anonymous read that returns rows means it is not.
    try {
      const r = await fetch(base + "/rest/v1/sessions?select=id&limit=1", { headers: head });
      if (r.ok) {
        const rows = await r.json();
        add(Array.isArray(rows) && rows.length === 0, "Row-level security",
          Array.isArray(rows) && rows.length === 0
            ? "On - anonymous requests see nothing."
            : "OFF. Anonymous requests can read sessions. Re-run 0001_init.sql.");
      } else {
        add(true, "Row-level security", "On - anonymous requests are refused.");
      }
    } catch (_) {
      add(false, "Row-level security", "Could not check it.");
    }

    // club row seeded?
    try {
      const r = await fetch(base + "/rest/v1/clubs?select=id&limit=1", { headers: head });
      add(r.status !== 404, "Club row",
        r.status === 404 ? "Missing. Run 0002_seed_club.sql."
                         : "Ready (its contents are protected, which is correct).");
    } catch (_) {
      add(false, "Club row", "Could not check it.");
    }

    return out;
  }

  return { apply, saved, store, clear, diagnose };
})();

Setup.apply();

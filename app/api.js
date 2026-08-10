/* ============================================================================
   LVFC Session Planner - backend client
   Talks to Supabase Auth (GoTrue) and PostgREST directly over fetch.
   No SDK, no build step, no dependencies.

   Everything here assumes row-level security is doing the real access control.
   The UI hides what a coach may not touch; the database is what enforces it.
   ========================================================================== */
"use strict";

const API = (function () {
  const CFG = window.LVFC_CONFIG || {};
  const BASE = (CFG.supabaseUrl || "").replace(/\/+$/, "");
  const ANON = CFG.supabaseAnonKey || "";
  const SKEY = "lvfc.auth";

  const configured = () => Boolean(BASE && ANON);

  /* ------------------------------------------------------------ session -- */
  let sess = null;
  try {
    sess = JSON.parse(localStorage.getItem(SKEY) || "null");
  } catch (_) {
    sess = null;
  }

  function store(s) {
    sess = s;
    try {
      if (s) localStorage.setItem(SKEY, JSON.stringify(s));
      else localStorage.removeItem(SKEY);
    } catch (_) {}
  }

  const expired = () =>
    !sess || !sess.expires_at || Date.now() > sess.expires_at * 1000 - 60000;

  /* -------------------------------------------------------------- fetch -- */
  async function raw(path, opts = {}, useAuth = true) {
    if (!configured()) throw new Error("Backend is not configured yet.");
    const headers = Object.assign(
      { apikey: ANON, "Content-Type": "application/json" },
      opts.headers || {}
    );
    if (useAuth && sess && sess.access_token) {
      headers.Authorization = "Bearer " + sess.access_token;
    }
    const res = await fetch(BASE + path, Object.assign({}, opts, { headers }));
    const text = await res.text();
    let body = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch (_) {
        body = text;
      }
    }
    if (!res.ok) {
      const msg =
        (body && (body.error_description || body.msg || body.message || body.error)) ||
        ("Request failed (" + res.status + ")");
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return body;
  }

  /* Refresh the access token when it is close to expiry, then retry once. */
  async function req(path, opts, useAuth = true) {
    if (useAuth && sess && expired() && sess.refresh_token) {
      try {
        await refresh();
      } catch (_) {
        store(null);
      }
    }
    return raw(path, opts, useAuth);
  }

  function adopt(s) {
    if (s && s.access_token) {
      if (!s.expires_at && s.expires_in) {
        s.expires_at = Math.floor(Date.now() / 1000) + s.expires_in;
      }
      store(s);
    }
    return s;
  }

  async function refresh() {
    const s = await raw(
      "/auth/v1/token?grant_type=refresh_token",
      { method: "POST", body: JSON.stringify({ refresh_token: sess.refresh_token }) },
      false
    );
    return adopt(s);
  }

  /* --------------------------------------------------------------- auth -- */
  async function signUp(email, password, fullName, joinCode) {
    const s = await raw(
      "/auth/v1/signup",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          data: { full_name: fullName || "", join_code: joinCode || "" }
        })
      },
      false
    );
    // When email confirmation is on, no token comes back and that is fine.
    if (s && s.access_token) adopt(s);
    return s;
  }

  async function signIn(email, password) {
    const s = await raw(
      "/auth/v1/token?grant_type=password",
      { method: "POST", body: JSON.stringify({ email, password }) },
      false
    );
    return adopt(s);
  }

  async function signOut() {
    try {
      if (sess) await raw("/auth/v1/logout", { method: "POST" });
    } catch (_) {
      /* the local session goes either way */
    }
    store(null);
  }

  async function resetPassword(email) {
    return raw(
      "/auth/v1/recover",
      { method: "POST", body: JSON.stringify({ email }) },
      false
    );
  }

  const signedIn = () => Boolean(sess && sess.access_token);

  /* ------------------------------------------------------------- PostgREST */
  const q = (params) =>
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v))
      .join("&");

  async function me() {
    const rows = await req(
      "/rest/v1/profiles?" + q({ select: "id,club_id,full_name,role", limit: 1 })
    );
    return rows && rows[0];
  }

  async function club() {
    const rows = await req(
      "/rest/v1/clubs?" + q({ select: "id,name,slug,settings", limit: 1 })
    );
    return rows && rows[0];
  }

  async function saveClubSettings(clubId, settings) {
    return req("/rest/v1/clubs?" + q({ id: "eq." + clubId }), {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ settings })
    });
  }

  /* ------------------------------------------------------------ sessions -- */
  async function listSessions(opts = {}) {
    const params = {
      select:
        "id,title,age_group,session_date,month,week_block,cycle_day,total_mins,shared,owner_id,updated_at",
      order: "updated_at.desc",
      limit: opts.limit || 100
    };
    if (opts.mineOnly) params.owner_id = "eq." + (sess && sess.user && sess.user.id);
    if (opts.sharedOnly) params.shared = "is.true";
    if (opts.age) params.age_group = "eq." + opts.age;
    return req("/rest/v1/sessions?" + q(params));
  }

  async function getSession(id) {
    const rows = await req(
      "/rest/v1/sessions?" + q({ id: "eq." + id, select: "*", limit: 1 })
    );
    return rows && rows[0];
  }

  function sessionRow(S, profile) {
    const total = (S.drills || []).reduce((a, d) => a + (+d.mins || 0), 0);
    return {
      owner_id: profile.id,
      club_id: profile.club_id,
      title: S.title || "Untitled session",
      age_group: S.age,
      session_date: S.date || null,
      month: S.month,
      week_block: S.block,
      cycle_day: S.day,
      total_mins: total,
      shared: Boolean(S.shared),
      plan: S
    };
  }

  async function createSession(S, profile) {
    const rows = await req("/rest/v1/sessions", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(sessionRow(S, profile))
    });
    return rows && rows[0];
  }

  async function updateSession(id, S, profile) {
    const rows = await req("/rest/v1/sessions?" + q({ id: "eq." + id }), {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(sessionRow(S, profile))
    });
    return rows && rows[0];
  }

  async function deleteSession(id) {
    return req("/rest/v1/sessions?" + q({ id: "eq." + id }), { method: "DELETE" });
  }

  async function setShared(id, shared) {
    return req("/rest/v1/sessions?" + q({ id: "eq." + id }), {
      method: "PATCH",
      body: JSON.stringify({ shared: Boolean(shared) })
    });
  }

  /* ----------------------------------------------------------- practices -- */
  async function listPractices(opts = {}) {
    const params = {
      select: "id,name,tag,mins,rolling,principles,shared,official,owner_id,detail,updated_at",
      order: "updated_at.desc",
      limit: opts.limit || 200
    };
    if (opts.mineOnly) params.owner_id = "eq." + (sess && sess.user && sess.user.id);
    if (opts.clubOnly) params.shared = "is.true";
    return req("/rest/v1/practices?" + q(params));
  }

  async function createPractice(p, profile) {
    const rows = await req("/rest/v1/practices", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        owner_id: profile.id,
        club_id: profile.club_id,
        name: p.name,
        tag: p.tag || "",
        mins: p.mins || 15,
        rolling: p.rolling || 70,
        principles: p.prin || [],
        shared: Boolean(p.shared),
        detail: p
      })
    });
    return rows && rows[0];
  }

  async function deletePractice(id) {
    return req("/rest/v1/practices?" + q({ id: "eq." + id }), { method: "DELETE" });
  }

  return {
    configured,
    signedIn,
    user: () => (sess && sess.user) || null,
    signUp,
    signIn,
    signOut,
    resetPassword,
    me,
    club,
    saveClubSettings,
    listSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
    setShared,
    listPractices,
    createPractice,
    deletePractice
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = API;

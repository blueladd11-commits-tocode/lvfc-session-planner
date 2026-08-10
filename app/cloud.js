/* ============================================================================
   Auth gate, cloud sync and the club library.

   Design rules:
     * the planner works signed out. Offline mode is a first-class path, not a
       failure state - a coach with no signal at a pitch can still plan.
     * nothing here is a security control. The database policies decide what a
       coach may read or write; this file only decides what to show.
   ========================================================================== */
"use strict";

(function () {
  const $ = (id) => document.getElementById(id);
  const CFGW = window.LVFC_CONFIG || {};
  const P = window.Planner;

  let profile = null;
  let clubRow = null;
  let currentId = null; // row id of the session being edited, when signed in
  let offline = false;
  let saveTimer = null;

  /* ------------------------------------------------------------- helpers -- */
  function msg(text, kind) {
    const el = $("gateMsg");
    el.textContent = text || "";
    el.hidden = !text;
    el.className = "gate-msg" + (kind ? " " + kind : "");
  }

  function showApp() {
    $("gate").hidden = true;
    $("app").hidden = false;
  }
  function showGate() {
    $("gate").hidden = false;
    $("app").hidden = true;
  }

  function setWho() {
    const bar = $("who");
    if (offline || !API.signedIn()) {
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    const u = API.user();
    const name = (profile && profile.full_name) || (u && u.email) || "Signed in";
    $("whoName").textContent =
      name + (profile && profile.role === "admin" ? " (admin)" : "");
  }

  /* ------------------------------------------------------- club settings -- */
  // Club settings live on the server, so changing them reaches every coach at
  // their next load. Admins write; coaches read.
  async function pullClub() {
    try {
      clubRow = await API.club();
    } catch (_) {
      clubRow = null;
    }
    if (!clubRow) return;
    const s = Object.assign({}, clubRow.settings || {});
    // a coach is locked out of editing club settings; an admin is not
    s.locked = !(profile && profile.role === "admin");
    s.club = s.club || clubRow.name || "LVFC";
    P.setCFG(s);
  }

  async function pushClub(cfg) {
    if (!API.signedIn() || !clubRow) return;
    if (!profile || profile.role !== "admin") return;
    const out = Object.assign({}, cfg);
    delete out.locked; // never persist the UI lock flag
    try {
      await API.saveClubSettings(clubRow.id, out);
      P.toast("Club settings saved for every coach");
    } catch (e) {
      P.toast("Could not save settings: " + e.message);
    }
  }

  /* -------------------------------------------------------- session sync -- */
  function queueSave(S) {
    if (offline || !API.signedIn() || !profile) return;
    // Don't put an untouched draft in the library. Once a coach has drawn or
    // written anything it saves itself from then on, without them pressing Save.
    if (!currentId && !P.hasContent()) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => void pushSession(S), 1200);
  }

  async function pushSession(S) {
    // a session always reaches the library with a name it earned
    if (!(S.title || "").trim()) S.title = P.autoTitle();
    try {
      if (currentId) {
        await API.updateSession(currentId, S, profile);
      } else {
        const row = await API.createSession(S, profile);
        if (row) currentId = row.id;
      }
    } catch (e) {
      // a failed sync must never lose work - localStorage already has it
      P.toast("Saved on this device. Cloud sync failed: " + e.message);
    }
  }

  /* ------------------------------------------------------------ library --- */
  async function openLibrary() {
    if (offline || !API.signedIn()) {
      P.toast("Sign in to use the club library");
      return;
    }
    P.openModal("Library", "Your sessions, and everything shared with the club.",
      '<p class="sel-none">Loading&hellip;</p>');
    let mine = [], club = [];
    try {
      const all = await API.listSessions({});
      const uid = API.user() && API.user().id;
      mine = all.filter((r) => r.owner_id === uid);
      club = all.filter((r) => r.owner_id !== uid && r.shared);
    } catch (e) {
      $("modalBody").innerHTML =
        '<p class="sel-none">Could not load the library: ' + esc(e.message) + "</p>";
      return;
    }

    const card = (r, own) => `
      <div class="libcard" data-open="${r.id}">
        <div class="libtop">
          <b>${esc(r.title || "Untitled session")}</b>
          <span class="libmins">${r.total_mins || 0}'</span>
        </div>
        <em>${esc(r.age_group || "")}${r.session_date ? " &middot; " + esc(r.session_date) : ""}${
          r.cycle_day ? " &middot; " + esc(r.cycle_day) : ""}</em>
        <div class="libacts">
          <button class="btn ghost" data-load="${r.id}">Open</button>
          ${own ? `<button class="btn ghost" data-share="${r.id}" data-on="${r.shared ? 1 : 0}">${
            r.shared ? "Shared with club" : "Share with club"}</button>
                   <button class="btn ghost danger" data-del="${r.id}">Delete</button>` : ""}
        </div>
      </div>`;

    $("modalBody").innerHTML =
      `<p class="pal-title">Your sessions (${mine.length})</p>
       <div class="libgrid">${mine.map((r) => card(r, true)).join("") ||
         '<p class="sel-none">Nothing saved yet.</p>'}</div>
       <p class="pal-title" style="margin-top:16px">Shared with the club (${club.length})</p>
       <div class="libgrid">${club.map((r) => card(r, false)).join("") ||
         '<p class="sel-none">No shared sessions yet.</p>'}</div>`;

    wireLibraryActions();
  }

  function wireLibraryActions() {
    const b = $("modalBody");
    b.querySelectorAll("[data-load]").forEach((el) => {
      el.onclick = async () => {
        try {
          const row = await API.getSession(el.dataset.load);
          if (!row) return;
          P.setS(row.plan || {});
          currentId = row.owner_id === (API.user() || {}).id ? row.id : null;
          P.closeModal();
          P.toast(currentId ? "Session opened" : "Opened a copy - saving creates your own");
        } catch (e) {
          P.toast("Could not open: " + e.message);
        }
      };
    });
    b.querySelectorAll("[data-share]").forEach((el) => {
      el.onclick = async () => {
        const on = el.dataset.on === "1";
        try {
          await API.setShared(el.dataset.share, !on);
          openLibrary();
        } catch (e) {
          P.toast("Could not change sharing: " + e.message);
        }
      };
    });
    b.querySelectorAll("[data-del]").forEach((el) => {
      el.onclick = async () => {
        try {
          await API.deleteSession(el.dataset.del);
          if (currentId === el.dataset.del) currentId = null;
          openLibrary();
          P.toast("Session deleted");
        } catch (e) {
          P.toast("Could not delete: " + e.message);
        }
      };
    });
  }

  function esc(t) {
    return String(t).replace(/[&<>"']/g, (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  /* --------------------------------------------------------------- gate --- */
  let mode = "in";

  function setMode(next) {
    mode = next;
    document.querySelectorAll("#gateTabs button").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.tab === next)));
    document.querySelectorAll(".gate-only-up").forEach((el) => (el.hidden = next !== "up"));
    $("gateGo").textContent = next === "up" ? "Create account" : "Sign in";
    $("gPass").setAttribute("autocomplete", next === "up" ? "new-password" : "current-password");
    msg("");
  }

  async function afterAuth() {
    profile = await API.me();
    if (!profile) {
      msg("Signed in, but no coach profile was found. Ask your admin to check the club setup.", "bad");
      return;
    }
    if (!profile.club_id) {
      msg("Your account is not linked to a club yet. Ask your Head of Coaching for the join code.", "bad");
    }
    await pullClub();
    setWho();
    showApp();
    P.render();
  }

  function wireGate() {
    document.querySelectorAll("#gateTabs button").forEach((b) => {
      b.onclick = () => setMode(b.dataset.tab);
    });

    $("gateForm").onsubmit = async (e) => {
      e.preventDefault();
      const email = $("gEmail").value.trim();
      const pass = $("gPass").value;
      const go = $("gateGo");
      go.disabled = true;
      msg("");
      try {
        if (mode === "up") {
          const r = await API.signUp(email, pass, $("gName").value.trim(), $("gCode").value.trim());
          if (!API.signedIn()) {
            msg("Account created. Check your email to confirm it, then sign in.", "ok");
            setMode("in");
            return;
          }
        } else {
          await API.signIn(email, pass);
        }
        await afterAuth();
      } catch (err) {
        msg(err.message || "That did not work. Try again.", "bad");
      } finally {
        go.disabled = false;
      }
    };

    $("gateForgot").onclick = async () => {
      const email = $("gEmail").value.trim();
      if (!email) return msg("Enter your email first, then press Forgot password.", "bad");
      try {
        await API.resetPassword(email);
        msg("If that email has an account, a reset link is on its way.", "ok");
      } catch (err) {
        msg(err.message, "bad");
      }
    };

    $("gateOffline").onclick = () => {
      offline = true;
      setWho();
      showApp();
      P.toast("Offline mode - sessions save to this device only");
    };

    $("gateSetup").onclick = openConnect;
  }

  /* ------------------------------------------------------------- connect -- */
  // Lets an admin paste the two Supabase values and checks the project before
  // any coach ever sees a sign-in box.
  function openConnect() {
    const cur = Setup.saved() || {};
    P.openModal(
      "Connect a backend",
      "Paste the two values from Supabase: Project Settings, then API.",
      `<div class="field"><label for="suUrl">Project URL</label>
         <input id="suUrl" placeholder="https://yourproject.supabase.co" value="${esc(cur.url || "")}"/></div>
       <div class="field" style="margin-top:10px"><label for="suKey">Anon / public key</label>
         <input id="suKey" placeholder="eyJ..." value="${esc(cur.key || "")}"/>
         <p class="gate-hint">This key is meant to be public. Never paste the service_role key here.</p></div>
       <div class="arow" style="margin-top:14px">
         <button class="btn primary" id="suTest">Check and save</button>
         <button class="btn" id="suClear">Forget it</button>
       </div>
       <div id="suOut"></div>`
    );

    $("suClear").onclick = () => {
      Setup.clear();
      P.toast("Backend settings cleared - reload to start over");
    };

    $("suTest").onclick = async () => {
      const url = $("suUrl").value.trim();
      const key = $("suKey").value.trim();
      const btn = $("suTest");
      btn.disabled = true;
      $("suOut").innerHTML = '<p class="sel-none">Checking&hellip;</p>';
      const rows = await Setup.diagnose(url, key);
      const allOk = rows.every((r) => r.ok);
      $("suOut").innerHTML =
        '<div class="diag">' +
        rows
          .map(
            (r) => `<div class="diagrow ${r.ok ? "ok" : "no"}"><span class="dot"></span>
              <span><b>${esc(r.label)}</b><em>${esc(r.detail)}</em></span></div>`
          )
          .join("") +
        "</div>" +
        (allOk
          ? '<p class="gate-msg ok" style="margin-top:12px">Everything checks out. Saved &mdash; reload and sign in.</p>'
          : '<p class="gate-msg bad" style="margin-top:12px">Fix the items above, then check again. ' +
            "Nothing was saved.</p>");
      if (allOk) Setup.store(url, key);
      btn.disabled = false;
    };
  }

  /* ---------------------------------------------------------------- boot -- */
  async function boot() {
    $("gCodeHint").textContent = CFGW.joinCodeHint || "";
    wireGate();
    setMode("in");

    // hooks from the planner
    P.hooks.onSave = queueSave;
    P.hooks.onCfgSaved = pushClub;

    $("btnSignOut").onclick = async () => {
      await API.signOut();
      profile = null; clubRow = null; currentId = null;
      P.reset();
      setWho();
      // always hand the next person a clean Sign in form, never a half-filled
      // Create account form left over from the last visit
      setMode("in");
      $("gPass").value = "";
      $("gName").value = "";
      $("gCode").value = "";
      msg("");
      showGate();
    };
    $("btnLibrary").onclick = openLibrary;

    // the header Open button becomes the cloud library when signed in
    const openBtn = $("btnLoad");
    if (openBtn) {
      const original = openBtn.onclick;
      openBtn.onclick = (e) => {
        if (!offline && API.signedIn()) return openLibrary();
        return original && original(e);
      };
    }
    // saving a new session under a new name should create a new cloud row
    const saveBtn = $("btnSave");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        if (!offline && API.signedIn()) void pushSession(P.getS());
      });
    }

    if (!API.configured()) {
      // no backend wired up yet - run offline, no sign-in wall
      offline = true;
      showApp();
      return;
    }
    if (API.signedIn()) {
      try {
        await afterAuth();
        return;
      } catch (_) {
        /* token no longer valid - fall through to the gate */
      }
    }
    showGate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

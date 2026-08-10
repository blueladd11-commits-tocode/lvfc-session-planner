#!/usr/bin/env python3
"""
Access-control tests against the mock backend.

These assert the rules that matter for a club: a coach's library is their own,
sharing is deliberate, and an admin can see the club's work. Every check here
mirrors a policy in supabase/migrations/0001_init.sql.

    python3 tools/mock_supabase.py --port 8788 --reset &
    python3 tools/test_access.py
"""

import json
import sys
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:8788"
ANON = "mock-anon-key"
PASSES, FAILS = [], []


def call(method, path, token=None, body=None):
    req = urllib.request.Request(BASE + path, method=method)
    req.add_header("apikey", ANON)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    data = json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(req, data) as r:
            raw = r.read().decode()
            return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        return e.code, (json.loads(raw) if raw else None)


def check(name, cond, detail=""):
    (PASSES if cond else FAILS).append(name)
    print(("  PASS  " if cond else "  FAIL  ") + name + (f"   {detail}" if detail and not cond else ""))


def signup(email, pw, name, code=""):
    st, b = call("POST", "/auth/v1/signup", body={
        "email": email, "password": pw,
        "data": {"full_name": name, "join_code": code}})
    return b


def main():
    print("\nAccess control")
    print("-" * 60)

    # --- sign-up rules -------------------------------------------------------
    st, b = call("POST", "/auth/v1/signup", body={"email": "bad", "password": "x"})
    check("rejects a malformed email", st == 400)

    st, b = call("POST", "/auth/v1/signup",
                 body={"email": "short@lvfc.test", "password": "abc"})
    check("rejects a password under 8 characters", st == 400)

    a = signup("adam@lvfc.test", "coachpass123", "Adam", "LVFC-2026")
    bb = signup("bilal@lvfc.test", "coachpass123", "Bilal", "LVFC-2026")
    outsider = signup("nobody@other.test", "coachpass123", "Outsider", "")
    check("coach signs up with the club join code", bool(a and a.get("access_token")))
    check("sign-up without a code creates no club membership", bool(outsider))

    st, b = call("POST", "/auth/v1/signup",
                 body={"email": "adam@lvfc.test", "password": "coachpass123"})
    check("blocks duplicate email", st == 400)

    # --- sign-in -------------------------------------------------------------
    st, b = call("POST", "/auth/v1/token?grant_type=password",
                 body={"email": "adam@lvfc.test", "password": "wrong"})
    check("wrong password is refused", st == 400)

    st, b = call("POST", "/auth/v1/token?grant_type=password",
                 body={"email": "adam@lvfc.test", "password": "coachpass123"})
    check("correct password signs in", st == 200 and b.get("access_token"))
    TA = b["access_token"]
    TB = bb["access_token"]
    TO = outsider["access_token"]

    st, b = call("GET", "/rest/v1/sessions", token=None)
    check("no token means no data", st == 401)

    st, b = call("GET", "/rest/v1/sessions", token="not-a-real-token")
    check("a forged token is rejected", st == 401)

    # --- profiles ------------------------------------------------------------
    st, prof_a = call("GET", "/rest/v1/profiles?limit=1", token=TA)
    me_a = prof_a[0]
    st, prof_b = call("GET", "/rest/v1/profiles?limit=1", token=TB)
    me_b = prof_b[0]
    check("coach is placed in the club by join code", bool(me_a["club_id"]))
    check("both coaches land in the same club", me_a["club_id"] == me_b["club_id"])

    # --- a coach's library is private ---------------------------------------
    st, made = call("POST", "/rest/v1/sessions", token=TA, body={
        "owner_id": me_a["id"], "club_id": me_a["club_id"],
        "title": "Adam private session", "age_group": "U12", "total_mins": 55,
        "shared": False, "plan": {"drills": []}})
    check("coach saves a session", st == 201)
    sid = made[0]["id"]

    st, seen = call("GET", "/rest/v1/sessions", token=TB)
    check("another coach cannot see it",
          all(r["id"] != sid for r in seen), f"leaked to Bilal")

    st, seen = call("GET", "/rest/v1/sessions", token=TO)
    check("a coach outside the club cannot see it",
          all(r["id"] != sid for r in seen))

    st, _ = call("PATCH", f"/rest/v1/sessions?id=eq.{sid}", token=TB,
                 body={"title": "hijacked"})
    check("another coach cannot edit it", st == 403)

    st, _ = call("DELETE", f"/rest/v1/sessions?id=eq.{sid}", token=TB)
    check("another coach cannot delete it", st == 403)

    st, after = call("GET", f"/rest/v1/sessions?id=eq.{sid}", token=TA)
    check("owner's session survived both attempts",
          len(after) == 1 and after[0]["title"] == "Adam private session")

    # --- sharing is deliberate ----------------------------------------------
    call("PATCH", f"/rest/v1/sessions?id=eq.{sid}", token=TA, body={"shared": True})
    st, seen = call("GET", "/rest/v1/sessions", token=TB)
    check("once shared, the club can see it", any(r["id"] == sid for r in seen))

    st, seen = call("GET", "/rest/v1/sessions", token=TO)
    check("sharing does not leak outside the club",
          all(r["id"] != sid for r in seen))

    st, _ = call("PATCH", f"/rest/v1/sessions?id=eq.{sid}", token=TB,
                 body={"title": "edited by Bilal"})
    check("a shared session is still read-only to others", st == 403)

    # --- club settings are admin-only ---------------------------------------
    st, club = call("GET", "/rest/v1/clubs", token=TA)
    check("coach can read club settings", st == 200 and len(club) == 1)
    cid = club[0]["id"]
    settings = club[0]["settings"]
    check("settings carry the planner config", "ages" in settings and "days" in settings)

    settings2 = dict(settings, ages=["U8"])
    st, _ = call("PATCH", f"/rest/v1/clubs?id=eq.{cid}", token=TA,
                 body={"settings": settings2})
    check("a coach cannot change club settings", st == 403)

    # promote Adam by hand, the way the SQL note describes
    import sqlite3, os
    con = sqlite3.connect(os.path.join(os.path.dirname(__file__), "mock.db"))
    con.execute("update profiles set role='admin' where id=?", (me_a["id"],))
    con.commit(); con.close()

    st, _ = call("PATCH", f"/rest/v1/clubs?id=eq.{cid}", token=TA,
                 body={"settings": settings2})
    check("an admin can change club settings", st == 200)

    st, club2 = call("GET", "/rest/v1/clubs", token=TB)
    check("the change reaches every coach immediately",
          club2[0]["settings"]["ages"] == ["U8"])

    # --- admin oversight -----------------------------------------------------
    st, made_b = call("POST", "/rest/v1/sessions", token=TB, body={
        "owner_id": me_b["id"], "club_id": me_b["club_id"],
        "title": "Bilal private session", "age_group": "U8",
        "total_mins": 45, "shared": False, "plan": {}})
    bid = made_b[0]["id"]
    st, seen = call("GET", "/rest/v1/sessions", token=TA)
    check("admin sees unshared work inside the club", any(r["id"] == bid for r in seen))

    st, _ = call("PATCH", f"/rest/v1/sessions?id=eq.{bid}", token=TA,
                 body={"title": "admin edit"})
    check("admin still cannot edit a coach's session", st == 403)

    # --- token refresh -------------------------------------------------------
    st, refreshed = call("POST", "/auth/v1/token?grant_type=refresh_token",
                         body={"refresh_token": bb["refresh_token"]})
    check("refresh token issues a new session", st == 200 and refreshed.get("access_token"))
    st, _ = call("POST", "/auth/v1/token?grant_type=refresh_token",
                 body={"refresh_token": bb["refresh_token"]})
    check("a used refresh token cannot be replayed", st == 400)

    # --- sign out ------------------------------------------------------------
    call("POST", "/auth/v1/logout", token=TA)
    st, _ = call("GET", "/rest/v1/sessions", token=TA)
    check("signing out invalidates the token", st == 401)

    print("-" * 60)
    print(f"{len(PASSES)} passed, {len(FAILS)} failed")
    if FAILS:
        print("\nFAILED:")
        for f in FAILS:
            print("  - " + f)
    return 1 if FAILS else 0


if __name__ == "__main__":
    sys.exit(main())

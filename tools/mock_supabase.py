#!/usr/bin/env python3
"""
Mock Supabase for local development and testing.

Implements the subset of GoTrue (/auth/v1/*) and PostgREST (/rest/v1/*) that the
planner actually calls, and mirrors the row-level security policies from
supabase/migrations/0001_init.sql in Python so that access rules can be tested
without a live Postgres.

This is a development tool. It is NOT a security boundary and must never be used
to serve real data: tokens are opaque random strings and passwords are hashed
with a single round of SHA-256 purely so the file contains no plaintext.

    python3 tools/mock_supabase.py --port 8788

Then point app/config.js at http://localhost:8788 with any non-empty anon key.
"""

import argparse
import hashlib
import json
import os
import re
import secrets
import sqlite3
import time
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

DB_PATH = os.path.join(os.path.dirname(__file__), "mock.db")
ANON_ROLE = "anon"


# --------------------------------------------------------------------- store --
def db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def init_db(reset=False):
    if reset and os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    con = db()
    con.executescript(
        """
        create table if not exists users(
          id text primary key, email text unique, pw text, meta text, created_at real);
        create table if not exists tokens(
          access text primary key, refresh text, user_id text, expires_at real);
        create table if not exists clubs(
          id text primary key, name text, slug text unique, join_code text, settings text);
        create table if not exists profiles(
          id text primary key, club_id text, full_name text, role text);
        create table if not exists sessions(
          id text primary key, owner_id text, club_id text, title text, age_group text,
          session_date text, month integer, week_block text, cycle_day text,
          total_mins integer, shared integer default 0, plan text, updated_at real);
        create table if not exists practices(
          id text primary key, owner_id text, club_id text, name text, tag text,
          mins integer, rolling integer, principles text, shared integer default 0,
          official integer default 0, detail text, updated_at real);
        """
    )
    cur = con.execute("select count(*) c from clubs")
    if cur.fetchone()["c"] == 0:
        con.execute(
            "insert into clubs values(?,?,?,?,?)",
            (
                uid(),
                "Lahore Virgil Football Club",
                "lvfc",
                "LVFC-2026",
                json.dumps(
                    {
                        "club": "LVFC",
                        "quarterAnchor": 1,
                        "ages": ["U8", "U10", "U12", "13+"],
                        "days": ["mon-thu", "tue-fri", "wed-sat"],
                        "practices": None,
                        "autoPosition": True,
                        "allowOverride": True,
                        "lockDurations": False,
                        "requireFields": False,
                    }
                ),
            ),
        )
    con.commit()
    con.close()


def uid():
    return secrets.token_hex(16)


def hashpw(p):
    return hashlib.sha256(("mock$" + p).encode()).hexdigest()


# ----------------------------------------------------------------- policies --
# Mirrors the RLS policies. Kept deliberately close to the SQL so the two can be
# read side by side.
def visible_rows(con, table, me):
    """Rows `me` may SELECT, per the read policy for that table."""
    rows = con.execute(f"select * from {table}").fetchall()
    out = []
    for r in rows:
        own = r["owner_id"] == me["id"]
        shared_in_club = r["shared"] and r["club_id"] and r["club_id"] == me["club_id"]
        admin_in_club = me["role"] == "admin" and r["club_id"] == me["club_id"]
        if own or shared_in_club or admin_in_club:
            out.append(r)
    return out


def may_write(con, table, row_id, me):
    """Only the owner may UPDATE or DELETE their own row."""
    r = con.execute(f"select * from {table} where id=?", (row_id,)).fetchone()
    if not r:
        return False
    return r["owner_id"] == me["id"]


# ----------------------------------------------------------------- handler --
class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *a):
        pass  # quiet

    # ---- plumbing ----
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "authorization,apikey,content-type,prefer")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS")
        self.send_header("Access-Control-Expose-Headers", "content-range")

    def _send(self, code, payload=None):
        body = b"" if payload is None else json.dumps(payload).encode()
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if body:
            self.wfile.write(body)

    def _err(self, code, msg):
        self._send(code, {"message": msg, "error": msg, "msg": msg})

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        if not n:
            return {}
        try:
            return json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return {}

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.send_header("Content-Length", "0")
        self.end_headers()

    # ---- auth ----
    def _caller(self, con):
        auth = self.headers.get("Authorization") or ""
        m = re.match(r"Bearer\s+(.+)", auth)
        if not m:
            return None
        t = con.execute("select * from tokens where access=?", (m.group(1),)).fetchone()
        if not t or t["expires_at"] < time.time():
            return None
        return con.execute("select * from profiles where id=?", (t["user_id"],)).fetchone()

    def _issue(self, con, user_id):
        access, refresh = uid() + uid(), uid()
        exp = time.time() + 3600
        con.execute("insert into tokens values(?,?,?,?)", (access, refresh, user_id, exp))
        con.commit()
        u = con.execute("select * from users where id=?", (user_id,)).fetchone()
        return {
            "access_token": access,
            "refresh_token": refresh,
            "token_type": "bearer",
            "expires_in": 3600,
            "expires_at": int(exp),
            "user": {"id": user_id, "email": u["email"]},
        }

    # ---- routes ----
    def do_POST(self):
        path = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(path.query)
        con = db()
        try:
            b = self._body()

            if path.path == "/auth/v1/signup":
                email = (b.get("email") or "").strip().lower()
                pw = b.get("password") or ""
                if not email or "@" not in email:
                    return self._err(400, "A valid email address is required.")
                if len(pw) < 8:
                    return self._err(400, "Password must be at least 8 characters.")
                if con.execute("select 1 from users where email=?", (email,)).fetchone():
                    return self._err(400, "That email is already registered.")
                meta = b.get("data") or {}
                u = uid()
                con.execute(
                    "insert into users values(?,?,?,?,?)",
                    (u, email, hashpw(pw), json.dumps(meta), time.time()),
                )
                # mirrors handle_new_user(): resolve the join code to a club
                club = None
                code = (meta.get("join_code") or "").strip()
                if code:
                    c = con.execute("select id from clubs where join_code=?", (code,)).fetchone()
                    club = c["id"] if c else None
                con.execute(
                    "insert into profiles values(?,?,?,?)",
                    (u, club, meta.get("full_name", ""), "coach"),
                )
                con.commit()
                return self._send(200, self._issue(con, u))

            if path.path == "/auth/v1/token":
                grant = (qs.get("grant_type") or [""])[0]
                if grant == "password":
                    email = (b.get("email") or "").strip().lower()
                    row = con.execute("select * from users where email=?", (email,)).fetchone()
                    if not row or row["pw"] != hashpw(b.get("password") or ""):
                        return self._err(400, "Wrong email or password.")
                    return self._send(200, self._issue(con, row["id"]))
                if grant == "refresh_token":
                    t = con.execute(
                        "select * from tokens where refresh=?", (b.get("refresh_token"),)
                    ).fetchone()
                    if not t:
                        return self._err(400, "Session expired. Sign in again.")
                    con.execute("delete from tokens where refresh=?", (t["refresh"],))
                    con.commit()
                    return self._send(200, self._issue(con, t["user_id"]))
                return self._err(400, "Unsupported grant type.")

            if path.path == "/auth/v1/logout":
                auth = self.headers.get("Authorization") or ""
                m = re.match(r"Bearer\s+(.+)", auth)
                if m:
                    con.execute("delete from tokens where access=?", (m.group(1),))
                    con.commit()
                return self._send(204)

            if path.path == "/auth/v1/recover":
                return self._send(200, {})

            if path.path.startswith("/rest/v1/"):
                me = self._caller(con)
                if not me:
                    return self._err(401, "Not signed in.")
                table = path.path.split("/rest/v1/")[1]
                if table not in ("sessions", "practices"):
                    return self._err(404, "No such table.")
                rid = uid()
                b["id"] = rid
                b["updated_at"] = time.time()
                if b.get("owner_id") != me["id"]:
                    return self._err(403, "You can only create rows you own.")
                cols = [c[1] for c in con.execute(f"pragma table_info({table})")]
                vals = []
                for c in cols:
                    v = b.get(c)
                    if isinstance(v, (dict, list)):
                        v = json.dumps(v)
                    if isinstance(v, bool):
                        v = int(v)
                    vals.append(v)
                con.execute(
                    f"insert into {table} values({','.join('?' * len(cols))})", vals
                )
                con.commit()
                row = con.execute(f"select * from {table} where id=?", (rid,)).fetchone()
                return self._send(201, [dict(row)])

            return self._err(404, "Unknown endpoint.")
        finally:
            con.close()

    def do_GET(self):
        path = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(path.query)
        con = db()
        try:
            if not path.path.startswith("/rest/v1/"):
                return self._err(404, "Unknown endpoint.")
            me = self._caller(con)
            if not me:
                return self._err(401, "Not signed in.")
            table = path.path.split("/rest/v1/")[1]

            if table == "profiles":
                rows = con.execute("select * from profiles").fetchall()
                out = [
                    dict(r)
                    for r in rows
                    if r["id"] == me["id"] or (r["club_id"] and r["club_id"] == me["club_id"])
                ]
                out.sort(key=lambda r: r["id"] != me["id"])  # self first
                return self._send(200, out[: int((qs.get("limit") or [100])[0])])

            if table == "clubs":
                rows = [
                    dict(r)
                    for r in con.execute("select * from clubs").fetchall()
                    if r["id"] == me["club_id"]
                ]
                for r in rows:
                    r["settings"] = json.loads(r["settings"] or "{}")
                return self._send(200, rows)

            if table in ("sessions", "practices"):
                rows = [dict(r) for r in visible_rows(con, table, me)]
                # the handful of PostgREST filters the client actually uses
                for key, vals in qs.items():
                    v = vals[0]
                    if key in ("select", "order", "limit", "offset"):
                        continue
                    if v.startswith("eq."):
                        rows = [r for r in rows if str(r.get(key)) == v[3:]]
                    elif v == "is.true":
                        rows = [r for r in rows if r.get(key)]
                for r in rows:
                    for jcol in ("plan", "detail", "principles"):
                        if jcol in r and isinstance(r[jcol], str):
                            try:
                                r[jcol] = json.loads(r[jcol])
                            except Exception:
                                pass
                    if "shared" in r:
                        r["shared"] = bool(r["shared"])
                rows.sort(key=lambda r: r.get("updated_at") or 0, reverse=True)
                return self._send(200, rows[: int((qs.get("limit") or [100])[0])])

            return self._err(404, "No such table.")
        finally:
            con.close()

    def do_PATCH(self):
        path = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(path.query)
        con = db()
        try:
            me = self._caller(con)
            if not me:
                return self._err(401, "Not signed in.")
            table = path.path.split("/rest/v1/")[1]
            b = self._body()
            idf = (qs.get("id") or [""])[0]
            rid = idf[3:] if idf.startswith("eq.") else None
            if not rid:
                return self._err(400, "An id filter is required.")

            if table == "clubs":
                if me["role"] != "admin" or rid != me["club_id"]:
                    return self._err(403, "Only a club admin may change settings.")
                con.execute(
                    "update clubs set settings=? where id=?",
                    (json.dumps(b.get("settings") or {}), rid),
                )
                con.commit()
                r = dict(con.execute("select * from clubs where id=?", (rid,)).fetchone())
                r["settings"] = json.loads(r["settings"])
                return self._send(200, [r])

            if table in ("sessions", "practices"):
                if not may_write(con, table, rid, me):
                    return self._err(403, "You can only change your own rows.")
                sets, vals = [], []
                cols = [c[1] for c in con.execute(f"pragma table_info({table})")]
                for k, v in b.items():
                    if k not in cols or k in ("id", "owner_id"):
                        continue
                    if isinstance(v, (dict, list)):
                        v = json.dumps(v)
                    if isinstance(v, bool):
                        v = int(v)
                    sets.append(f"{k}=?")
                    vals.append(v)
                sets.append("updated_at=?")
                vals.append(time.time())
                vals.append(rid)
                con.execute(f"update {table} set {','.join(sets)} where id=?", vals)
                con.commit()
                row = dict(con.execute(f"select * from {table} where id=?", (rid,)).fetchone())
                return self._send(200, [row])

            return self._err(404, "No such table.")
        finally:
            con.close()

    def do_DELETE(self):
        path = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(path.query)
        con = db()
        try:
            me = self._caller(con)
            if not me:
                return self._err(401, "Not signed in.")
            table = path.path.split("/rest/v1/")[1]
            idf = (qs.get("id") or [""])[0]
            rid = idf[3:] if idf.startswith("eq.") else None
            if not rid or not may_write(con, table, rid, me):
                return self._err(403, "You can only delete your own rows.")
            con.execute(f"delete from {table} where id=?", (rid,))
            con.commit()
            return self._send(204)
        finally:
            con.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8788)
    ap.add_argument("--reset", action="store_true")
    a = ap.parse_args()
    init_db(reset=a.reset)
    srv = ThreadingHTTPServer(("127.0.0.1", a.port), Handler)
    print(f"mock supabase on http://127.0.0.1:{a.port}  (db: {DB_PATH})")
    srv.serve_forever()


if __name__ == "__main__":
    main()

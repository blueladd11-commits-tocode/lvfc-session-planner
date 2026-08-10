/* ============================================================================
   Backend connection settings.

   Fill these in from your Supabase project:
     Project Settings -> API -> Project URL, and the "anon / public" key.

   The anon key is designed to be public and safe to ship in the browser. It
   grants no access on its own - every read and write is checked against the
   row-level security policies in supabase/migrations/0001_init.sql.

   NEVER put the service_role key here. It bypasses all security.

   Left empty, the planner runs offline and saves to this browser only.
   For local development against tools/mock_supabase.py use:
     supabaseUrl: "http://127.0.0.1:8788", supabaseAnonKey: "mock-anon-key"
   ========================================================================== */
window.LVFC_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  joinCodeHint: "Ask your Head of Coaching for the club join code."
};

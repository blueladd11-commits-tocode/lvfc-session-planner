/* ============================================================================
   Backend connection settings.

   These two values are safe in the browser and safe in a public repository.
   The anon key grants no access on its own - every read and write is checked
   against the row-level security policies in supabase/migrations/0001_init.sql.

   NEVER put the service_role or sb_secret key here. Those bypass all security
   and belong only on a server you control.

   Left empty, the planner runs offline and saves to this browser only.
   For local development against tools/mock_supabase.py use:
     supabaseUrl: "http://127.0.0.1:8788", supabaseAnonKey: "mock-anon-key"
   ========================================================================== */
window.LVFC_CONFIG = {
  supabaseUrl: "https://azmcfhyefalibgeeninz.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bWNmaHllZmFsaWJnZWVuaW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTk4OTQsImV4cCI6MjEwMTkzNTg5NH0.GSdH3bQQQYGq0qS-7rSrc5kwugXbalxe4Oyfw3lnDXk",
  joinCodeHint: "Ask your Head of Coaching for the club join code."
};

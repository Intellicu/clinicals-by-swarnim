
## Base44 dev environment
- Run: `docker compose -f docker-compose.base44.yml up -d` (Vite dev on host port 3000).
- Frontend-only SPA. Backend is chosen by env vars (see src/api/client.js):
  Base44 (`VITE_BASE44_APP_ID` + `VITE_BASE44_APP_BASE_URL`) or Supabase
  (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`). With none set, the UI renders
  but all data/auth calls 404.
- Placeholders live in `.env.base44-defaults`; real values come from /run/base44/app.env.

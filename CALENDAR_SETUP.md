# My Calendar — create/edit tool

Adds a "My Calendar" panel to the CS site (`website/index.html`) backed by a Vercel serverless
function (`api/gcal.py`). It can **list, create, and edit** events on your Google Calendar's
`primary` calendar, acting as you via a **Calendar-only** OAuth token.

Access is controlled by **Vercel Deployment Protection** — the whole site sits behind your
Vercel login, so the panel has no separate password.

```
website/index.html  (My Calendar panel)
   │ POST /api/gcal  { action, ... }
   ▼
api/gcal.py  → refresh-token → Google Calendar API
```

> ⚠️ **Security depends on Vercel Deployment Protection staying ON.** If you disable it to make
> the site public, this endpoint becomes open — anyone could create/edit your events. Re-add a
> password gate before making the site public.

## 1. Set the environment variables in Vercel
Project → **Settings → Environment Variables** (Production). Names below; the **values** are in
`C:\Users\monar\.config\gws-website-calendar\vercel-env.txt` (kept outside the repo on purpose —
never commit them).

| Variable | What it is |
|---|---|
| `GOOGLE_CAL_CLIENT_ID` | OAuth client id (Claude GWS project) |
| `GOOGLE_CAL_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_CAL_REFRESH_TOKEN` | Calendar-only refresh token (secret) |

(`CAL_ADMIN_PASSWORD` is no longer used and can be deleted.)

## 2. Publish the OAuth app (important)
The OAuth app must be in **Production**, not Testing — otherwise Google expires the refresh
token after ~7 days and the panel stops working. Cloud Console →
`https://console.cloud.google.com/auth/audience?project=claude-gws-500214` → **Publish app**.

## 3. Deploy
Push to the **momoazm/CS** GitHub repo; Vercel serves `website/` (per root `vercel.json`) and
auto-detects `api/gcal.py` at `/api/gcal`. `api/requirements.txt` is empty on purpose so the
function stays standard-library-only (it does **not** pull in pinecone/google-genai from the
project-root `requirements.txt`).

## 4. Use it
Open the site (logged into Vercel) → scroll to **My Calendar**. Upcoming events load
automatically; create a new event or click **Edit** on one. Times use your browser's time zone.

## Notes
- The function holds a **Calendar-only** scope — even if the token leaked it cannot touch Gmail,
  Drive, etc.
- Secrets live only in Vercel env vars, never in the repo or the page.
- The endpoint can only `list`, `create`, and `update` events on `primary`. It cannot delete.

## Local testing (optional)
```bash
# from the repo root, with the three GOOGLE_CAL_* vars exported into your shell:
python -c "import http.server,sys; sys.path.insert(0,'api'); import gcal; \
  http.server.HTTPServer(('127.0.0.1',8801), gcal.handler).serve_forever()"
# then POST {"action":"list"} to http://127.0.0.1:8801/
```

## Endpoint reference (`POST /api/gcal`)
```jsonc
{ "action": "list" }
{ "action": "create",
  "summary": "Title", "start": "2026-06-23T15:00", "end": "2026-06-23T16:00",
  "timeZone": "Africa/Cairo", "location": "(optional)", "description": "(optional)" }
{ "action": "update", "id": "<eventId>", "summary": "...", "start": "...", "end": "..." }
```
Responses are JSON: `{ "events": [...] }` for list, `{ "message": "...", "event": {...} }` for
create/update, or `{ "error": "..." }` with a 4xx/5xx status on failure.

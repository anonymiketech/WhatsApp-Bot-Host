# ANONYMIKETECH — Pterodactyl Deployment Guide

This folder contains everything needed to run ANONYMIKETECH on a Pterodactyl panel.

## Requirements

- **Node.js 20+** (use a Node.js egg in Pterodactyl)
- **PostgreSQL** database (Railway, Supabase, Neon, or your own)
- A domain pointed at your Pterodactyl server

---

## Quick Setup

### 1. Set up the database

Create a PostgreSQL database and run the schema:

```bash
psql -h your-host -U your-user -d your-db -f schema.sql
```

Or paste the contents of `schema.sql` into your database admin panel (pgAdmin, Supabase SQL editor, etc.)

---

### 2. Configure environment variables

In your Pterodactyl egg, add these environment variables:

| Variable | Description |
|---|---|
| `PORT` | Port number (e.g. `3000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `ADMIN_EMAILS` | Comma-separated admin email addresses |
| `PTERODACTYL_URL` | Your Pterodactyl panel URL |
| `PTERODACTYL_API_KEY` | Pterodactyl Application API key (`ptla_...`) |
| `RESEND_API_KEY` | Resend API key for email |
| `PAYFLOW_ACCOUNT_ID` | Payflow account ID (M-Pesa) |
| `PAYFLOW_API_KEY` | Payflow API key |
| `PAYFLOW_API_SECRET` | Payflow API secret |
| `SERVE_STATIC` | Set to `true` |
| `NODE_ENV` | Set to `production` |

See `.env.example` for the full list.

---

### 3. Set up OAuth Apps

**GitHub:**
1. Go to https://github.com/settings/applications/new
2. Homepage URL: `https://yourdomain.com`
3. Callback URL: `https://yourdomain.com/api/auth/github/callback`

**Google:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URI: `https://yourdomain.com/api/auth/google/callback`

---

### 4. Startup command for Pterodactyl egg

```
npm install --production && node server.mjs
```

Or if you want a clean install each time:

```
npm ci --production && node server.mjs
```

---

## File Structure

```
server.mjs              — Main server (serves API + frontend)
public/                 — Built React frontend (static files)
pino-*.mjs              — Logging worker files
thread-stream-worker.mjs
package.json            — Runtime dependencies
schema.sql              — Database setup SQL
.env.example            — Environment variable template
```

---

## Pterodactyl Egg Settings

- **Image**: `ghcr.io/parkervcp/yolks:nodejs_20` (or any Node.js 20 image)
- **Startup**: `npm install --production && node server.mjs`
- **Stop command**: `^C`
- **Port**: Match your `PORT` environment variable

---

## Admin Panel

After logging in with an email listed in `ADMIN_EMAILS`, visit `/1admin1` to access the admin panel where you can manage users, bots, coins, and catalog settings.

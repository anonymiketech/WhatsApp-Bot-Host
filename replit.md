# Workspace

## Overview

**ANONYMIKETECH** — WhatsApp Bot Hosting Platform. Users log in with Replit Auth, pair their WhatsApp externally, save their session ID, and start/stop bots. Coin-based system (50 coins per 24h of bot runtime). New users receive 100 coins.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)
- **Auth**: Multi-provider — Email/Password (scrypt), GitHub OAuth, Google OIDC, Replit OIDC (all via `openid-client` + `crypto`)
- **WhatsApp**: Baileys (`@whiskeysockets/baileys`)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── anonymiketech/      # React + Vite frontend (ANONYMIKETECH UI)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── replit-auth-web/    # Browser auth hook (useAuth) for Replit OIDC
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

### `users` table
- `id` (varchar PK, uuid) — also used as Replit OIDC sub
- `replit_id` (varchar unique) — Replit user ID
- `email`, `first_name`, `last_name`, `profile_image_url`
- `coins` (integer, default 100) — usage credits
- `created_at`, `updated_at`

### `sessions` table
- Used by Replit Auth for session storage

### `bots` table
- `id` (varchar PK, uuid)
- `user_id` (varchar) — references users.id
- `name` (varchar)
- `session_id` (varchar) — WhatsApp pairing session ID (hidden from API)
- `status` (text: "running" | "stopped")
- `expires_at` (timestamp) — set to now+24h when started
- `created_at`, `updated_at`

## API Routes

All routes prefixed with `/api`:

### Auth (Replit OIDC)
- `GET /auth/user` — current user
- `GET /login` — initiate OIDC login
- `GET /callback` — OIDC callback
- `GET /logout` — logout

### Bots
- `POST /bots/save-session` — save a bot (requires auth)
- `GET /bots/my-bots` — list user's bots
- `POST /bots/start-bot` — start bot (costs 50 coins, runs 24h)
- `POST /bots/stop-bot` — stop bot

### Users
- `GET /users/me` — profile + coin balance
- `POST /users/add-coins` — add coins (testing)

## Bot Engine

Located at `artifacts/api-server/src/services/botEngine.ts`:
- Maintains `runningBots` map of active instances
- Uses Baileys `makeWASocket` with session stored per-bot in `./bot-sessions/<botId>/`
- Auto-reconnects on disconnect (unless logged out)
- Auto-stop check runs every 60 seconds for expired bots

## Key Commands

```bash
# Run API server dev
pnpm --filter @workspace/api-server run dev

# Run frontend dev
pnpm --filter @workspace/anonymiketech run dev

# Push DB schema
pnpm --filter @workspace/db run push

# Run OpenAPI codegen
pnpm --filter @workspace/api-spec run codegen
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all lib packages as project references.

## Proxy & Routing

- Frontend served at `/` (port 20391 internally)
- API server at `/api` (port 8080 internally)
- Global reverse proxy routes by path

## Packages

### `artifacts/api-server` (`@workspace/api-server`)
- Routes in `src/routes/` — health, auth, bots, users
- Middleware in `src/middlewares/` — authMiddleware
- Services in `src/services/` — botEngine
- Lib in `src/lib/` — auth (session management), logger
- Depends on: `@workspace/db`, `@workspace/api-zod`, `openid-client`, `@whiskeysockets/baileys`

### `artifacts/anonymiketech` (`@workspace/anonymiketech`)
- React + Vite frontend
- Pages: Landing (unauthenticated), Dashboard (authenticated)
- Auth via `@workspace/replit-auth-web` (`useAuth()`)
- Depends on: `@workspace/api-client-react`, `@workspace/replit-auth-web`

### `lib/replit-auth-web`
- `useAuth()` hook for browser authentication state
- Calls `GET /api/auth/user`, `login()` redirects to `/api/login`

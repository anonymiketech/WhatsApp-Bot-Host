# Workspace

## Overview

**ANONYMIKETECH** — WhatsApp Bot Hosting Platform. Users log in (Email/Password, GitHub, Google, Replit), pair their WhatsApp, save their session ID, and deploy bots. Coin-based system — 30 coins/day most bots, 50 coins/day Atassa Cloud. New users receive 100 free coins + welcome notification.

**Pages**: `/` (Landing), `/bots` (Marketplace), `/pricing` (Pricing), `/dashboard`, `/profile`, `/partners`, `/contact` (Contact page — WhatsApp +254782829321, admin@anonymiketech.online, support@anonymiketech.online)

**Notifications**: Bell visible on both desktop and mobile (top navbar). Users can mark read, mark all read, dismiss individual, or clear all. API endpoints: GET, POST (read), DELETE (single/all). Welcome notification sent on email/GitHub/Google signup.

**Pricing page** (`/pricing`): Free tier banner, 4 coin packages (Starter 100c/KES50, Popular 300c/KES100, Value 700c/KES200, Mega 2000c/KES500), bot costs table, how-it-works, features list, FAQ accordion.

**Bot catalog** (`bots-catalog.ts`): 9 bots, all with real `sessionLink` (pairing site), `githubRepo`, and `docsUrl` (now pointing to GitHub repos).

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
- `PUT /users/profile` — update firstName, lastName, profileImageUrl (with notification)
- `POST /users/add-coins` — add coins (testing)

### Notifications
- `GET /notifications` — list notifications (unread first, max 50)
- `POST /notifications/:id/read` — mark one as read
- `POST /notifications/read-all` — mark all as read

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
- Pages: Landing, Bots marketplace, Dashboard, Partners (/partners), Profile (/profile), NotFound
- Components: Navbar (bell icon + avatar → /profile), NotificationsBell (dropdown, 30s polling), Footer
- Auth via `@workspace/replit-auth-web` (`useAuth()`)
- Hooks: `use-notifications` (useNotifications, useMarkRead, useMarkAllRead), `use-users` (useGetMe, useUpdateProfile, useAddCoins)
- PWA manifest at `/manifest.json`, theme-color #00e599
- Intro spiral loader on every page; SectionLoader for dashboard sections
- Depends on: `@workspace/api-client-react`, `@workspace/replit-auth-web`

### `lib/replit-auth-web`
- `useAuth()` hook for browser authentication state
- Calls `GET /api/auth/user`, `login()` redirects to `/api/login`

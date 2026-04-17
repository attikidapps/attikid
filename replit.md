# Workspace

## Overview

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
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Project: WAVSTREAM

Independent music streaming web app with public site + secure admin dashboard.

### Architecture
- **Frontend**: React + Vite (`artifacts/music-app`) — dark-mode only, electric violet accent (`--primary: 258 90% 66%`)
- **Backend**: Express API server (`artifacts/api-server`) on port 8080
- **Database**: PostgreSQL with `mixtapes`, `songs`, `plays`, `comments`, `admins` tables
- **API Client**: Orval-generated React Query hooks in `lib/api-client-react`
- **Vite Proxy**: `/api` routes proxied to `localhost:8080`

### Public Pages
- `/` — Home (hero, trending tracks, mixtapes grid)
- `/library` — Music library (search, genre filters, tabs for mixtapes/songs)
- `/trending` — Top 10 tracks this week
- `/mixtapes/:id` — Mixtape detail with tracklist + Play All
- `/songs/:id` — Song detail with math CAPTCHA comments + share

### Admin Pages (protected, login: admin/admin123)
- `/admin` — Dashboard with stats + trending/top song charts
- `/admin/upload` — Upload MP3/WAV songs with mixtape assignment
- `/admin/songs` — Songs table with inline edit + delete
- `/admin/mixtapes` — Mixtape cards with cover upload + CRUD
- `/admin/comments` — Comment moderation table with delete
- `/admin/analytics` — Play analytics with bar charts

### Key Features
- Persistent bottom music player (HTML5 Audio, play queue, volume/seek controls)
- Play tracking: 15s OR 50% threshold, sessionId dedup (30min window)
- Math CAPTCHA for comments (server-side validated)
- Cookie-based admin sessions (express-session + bcrypt)
- File uploads stored in `artifacts/api-server/uploads/`

### Default Credentials
- Admin: `admin` / `admin123`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

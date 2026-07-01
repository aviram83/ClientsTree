# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Full-stack monorepo with a `client/` (React 18 + Vite + TypeScript) and `server/` (Express + TypeScript) split. PostgreSQL database accessed via Prisma ORM. Authentication is JWT-based with tokens stored in localStorage.

**Key data flow:** User logs in → JWT stored in AuthContext → TreeContext fetches all nodes for the user → TreeVisualizer renders the tree graph using @xyflow/react with Dagre layout.

## Commands

All commands must be run from the respective subdirectory (`client/` or `server/`).

```bash
# Install
cd server && npm install
cd client && npm install

# Start dev servers (run both simultaneously)
cd server && npm run dev    # Express on :3000 (nodemon + dotenv .env.development)
cd client && npm run dev    # Vite on :5173

# Build for production
cd server && npm run build  # tsc → dist/
cd client && npm run build  # Vite → dist/

# Lint (client only — no test scripts configured)
cd client && npm run lint   # ESLint, max-warnings 0

# Database (run from server/)
npm run prisma -- migrate dev --name <name>   # Dev migration
npm run prisma -- generate                    # Regenerate Prisma client
npm run prisma:prod -- migrate deploy         # Production deploy
```

Start the PostgreSQL container before running the server:
```bash
docker-compose up   # starts Postgres using .env DB_USER/DB_PASSWORD/DB_NAME
```

## Environment Variables

**server/.env.development** (required):
- `DATABASE_URL` — PostgreSQL connection string
- `PORT` — defaults to 3000
- `CLIENT_URL` — for CORS (defaults to `http://localhost:5173`)
- `JWT_SECRET`

**client/.env** (optional):
- `VITE_API_URL` — API base URL (defaults to `http://localhost:3000`)

## Frontend Structure

- **State:** Two React Contexts — `AuthContext` (user/token) and `TreeContext` (tree CRUD). No Redux or Zustand.
- **API layer:** `client/src/api/api.ts` — axios instance with request interceptor (injects Bearer token) and response interceptor (handles 401 → logout). Functions in `client/src/api/index.ts`.
- **Routing:** React Router v6 in `client/src/Router.tsx`. `/dashboard` is protected by `ProtectedRoute`.
- **Tree visualization:** `TreeVisualizer.tsx` uses `@xyflow/react` + `dagre` for hierarchical layout. Nodes are non-draggable. Children sorted descending by `createdAt`.
- **Node shapes** (defined in `CustomNode.tsx`): CLIENT = circle, CLIENT_VIP = diamond, DISTRIBUTOR = hexagon, SUPERVISOR = square.
- **Status config:** `client/src/config/statusConfig.ts` — single source of truth for `ClientStatus` enum, labels (Hebrew), and Tailwind color classes.
- **UI language:** Partially Hebrew (RTL search bar placeholder, status legend labels).

## Backend Structure

- **Routes:** `server/src/routes/` → `auth.routes.ts` (`/api/auth`) and `tree.routes.ts` (`/api/tree`, JWT-protected).
- **Auth middleware:** `server/src/middleware/auth.ts` — validates JWT and attaches user to request.
- **Database:** `server/prisma/schema.prisma` — `User` and `TreeNode` models. `TreeNode` is self-referential (parentId) for hierarchy. Cascading deletes are configured.
- **XSS:** Server uses the `xss` library for sanitization.

## Key Patterns

- **Tree mutations refetch the full tree** — `TreeContext` calls `fetchTree()` after every add/update/delete (no optimistic updates).
- **Double-fetch prevention:** `TreeContext` uses a `useRef` flag to avoid double-fetch in React StrictMode.
- **API circular-dependency avoidance:** The axios instance receives `logout` and `showError` callbacks via injection rather than importing contexts directly.
- **Prisma adapter:** Uses `@prisma/adapter-pg` with a `pg` connection pool (not the default Prisma engine).

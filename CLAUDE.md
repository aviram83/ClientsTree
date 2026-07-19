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

# Test
cd server && npm run test   # Vitest (node environment)
cd client && npm run test   # Vitest (jsdom + Testing Library)

# Lint (client only)
cd client && npm run lint   # ESLint, max-warnings 0

# Database (run from server/)
npm run prisma -- db push     # Dev: sync local Postgres schema from schema.prisma
npm run prisma -- generate    # Regenerate Prisma client
npm run prisma:push           # Prod: sync Neon schema from schema.prisma (uses .env.production)
```

Start the PostgreSQL container before running the server:
```bash
docker-compose up   # starts Postgres using .env DB_USER/DB_PASSWORD/DB_NAME
```

## Updating the Production Database (Neon)

This project uses `prisma db push`, not versioned migrations — there is no `prisma/migrations/` folder. To apply schema changes to production after editing `server/prisma/schema.prisma`, use the `/db-push prod` skill (`.claude/skills/db-push/SKILL.md`), or manually:

1. Confirm `server/.env.production`'s `DATABASE_URL` points to the correct Neon project.
2. (Optional but recommended) Create a Neon branch/snapshot as a rollback point before pushing — `db push` has no down-migration.
3. From `server/`, run: `npm run prisma:push`
4. Verify the change synced correctly (check command output, or inspect via `npm run prisma:prod -- studio`).

Destructive changes (dropped/renamed columns) can lose data — back up first; Prisma will warn if a change looks destructive.

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

## Responsive Design (Mobile + Desktop)

The app must work on both mobile and desktop web browsers. Every new component should be built mobile-first and adapted for larger screens, not built at a fixed size:

- Use Tailwind's default responsive breakpoints (`sm:` 640px, `md:` 768px, `lg:` 1024px, `xl:` 1280px — no custom breakpoints are configured) to change sizing/layout per viewport, rather than hardcoding one fixed size.
- Full-screen overlays (side menus, modals) should size relative to the viewport on mobile (e.g. `w-3/4`) but be capped with a `max-w-*` utility on larger screens (e.g. `md:max-w-sm`) so they don't stretch edge-to-edge on desktop.
- Prefer flexbox/grid + relative units (`%`, `w-full`, `max-w-*`) over fixed pixel widths/heights for containers; fixed pixel sizing is acceptable for small atomic elements (icons, avatars, tree nodes) but not for page-level layout regions.

## Backend Structure

- **Routes:** `server/src/routes/` → `auth.routes.ts` (`/api/auth`) and `tree.routes.ts` (`/api/tree`, JWT-protected).
- **Auth middleware:** `server/src/middleware/auth.ts` — validates JWT and attaches user to request.
- **Database:** `server/prisma/schema.prisma` — `User` and `TreeNode` models. `TreeNode` is self-referential (parentId) for hierarchy. Cascading deletes are configured.
- **XSS:** Server uses the `xss` library for sanitization.

## Code Organization

- **Client** (`client/src/`):
  - `hooks/` — extracted stateful/business logic (e.g. `useAuthLogic`, `useTreeLogic`), testable via `renderHook` without deep component rendering.
  - `lib/` — pure functions/data transforms with no React dependency (e.g. `treeLayout.ts`).
  - `context/` — thin Provider wrappers that call a hook and expose its return value via `Provider value={...}`; no logic lives here directly.
  - `components/` — presentational/JSX components.
  - `api/` — HTTP layer (axios instance + endpoint functions).
  - `config/` — static config/enums (e.g. `statusConfig.ts`).
- **Server** (`server/src/`):
  - `controllers/` — route handler business logic (no service layer in this codebase — controllers call Prisma directly).
  - `utils/` — pure helpers with no Express dependency (e.g. `validation.ts`), extracted out of controllers so they're unit-testable in isolation.
  - `middleware/` — Express middleware (e.g. `auth.ts`).
  - `routes/` — path-to-controller wiring only, no logic.
- **Rule of thumb:** if code touches `req`/`res` or JSX, it stays in `controllers/`/`components/`; if it's a pure function/transform, it belongs in `utils/`/`lib/` so it can be unit-tested without mocking a framework boundary.

## Testing

- Test files are colocated as `*.test.ts` next to the source they test (not a separate `tests/`/`__tests__/` folder).
- Client: logic tests target `hooks/` (via `renderHook`) and `lib/` (pure function tests). No component-render (JSX) tests currently.
- Server: `utils/` helpers get direct unit tests; controllers are tested by calling them directly with hand-built mock `req`/`res` objects and a mocked Prisma client (`vi.mock('../db')`) — no real Postgres, no `supertest`/HTTP layer.
- Both sides: no integration tests against a real database — that's a deliberate scope boundary, not an oversight.

## Key Patterns

- **Tree mutations refetch the full tree** — `TreeContext` calls `fetchTree()` after every add/update/delete (no optimistic updates).
- **Double-fetch prevention:** `TreeContext` uses a `useRef` flag to avoid double-fetch in React StrictMode.
- **API circular-dependency avoidance:** The axios instance receives `logout` and `showError` callbacks via injection rather than importing contexts directly.
- **Prisma adapter:** Uses `@prisma/adapter-pg` with a `pg` connection pool (not the default Prisma engine).

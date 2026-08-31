# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Full-stack monorepo with a `client/` (React 18 + Vite + TypeScript) and `server/` (Express + TypeScript) split. PostgreSQL database accessed via Prisma ORM. Authentication is JWT-based with tokens stored in localStorage.

**Key data flow:** User logs in → JWT stored in `authStore` → `treeStore` fetches all nodes for the user → TreeVisualizer renders the tree graph using @xyflow/react with Dagre layout.

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

**server/.env.development** (additional, required for the password-reset email flow):
- `BREVO_API_KEY` — API key for [Brevo](https://www.brevo.com), used by `EmailService` to send password-reset emails over HTTPS (SMTP is not used — cloud hosts like Render commonly block outbound SMTP ports)
- `EMAIL_FROM` — the sender address verified in Brevo via Single Sender Verification (no custom domain required)

## Frontend Structure

- **State:** Zustand stores — `authStore` (user/token), `treeStore` (tree CRUD), `profileStore` (profile). No React Context, no Redux. Components read state via selectors (e.g. `useAuthStore(s => s.token)`) so they only re-render when the slice they use changes.
- **API layer:** `client/src/api/api.ts` — axios instance with request interceptor (injects Bearer token) and response interceptor (handles 401 → logout). Functions in `client/src/api/index.ts`.
- **Routing:** React Router v6 in `client/src/Router.tsx`. `/dashboard`, `/houses/clients`, `/houses/supervisors`, and `/settings` are protected by `ProtectedRoute`.
- **Nav config:** `client/src/config/navConfig.ts` — `NAV_ITEMS` is a `NavEntry[]` union of flat `NavItem` (labelKey/path/icon) and `NavGroup` (labelKey/icon/children: `NavItem[]`), disambiguated by `isNavGroup()`. `UserSideMenu.tsx` renders groups as an expandable submenu. Labels are i18next keys (`nav.tree`, `nav.houses` grouping `nav.personalHouse` and `nav.supervisorHouse`, `nav.settings`) resolved via `useTranslation()`; the strings themselves live in `client/src/i18n/locales/{he,en}.json`. `SettingsPage.tsx` (`/settings`) shows the user's name/email (read-only) and a language dropdown backed by `profileStore.updateLanguage()`, which calls `PATCH /api/auth/me` and saves the returned profile.
- **Tree visualization:** `TreeVisualizer.tsx` uses `@xyflow/react` + `dagre` for hierarchical layout. Nodes are non-draggable. Children sorted descending by `createdAt`.
- **Node shapes** (defined in `CustomNode.tsx`): CLIENT = circle, CLIENT_VIP = diamond, DISTRIBUTOR = hexagon, SUPERVISOR = square.
- **Status config:** `client/src/config/statusConfig.ts` — single source of truth for `ClientStatus` enum, i18next `labelKey`s (`status.CLIENT`, `status.CLIENT_VIP`, `status.DISTRIBUTOR`, `status.SUPERVISOR`), and Tailwind color classes.
- **i18n:** `react-i18next`, wired up in `client/src/i18n/index.ts` (`lng`/`fallbackLng` both `'he'`). Translation strings live in `client/src/i18n/locales/{he,en}.json`; components call `useTranslation()` and resolve `labelKey`/`t()` keys rather than hardcoding text. `client/src/lib/applyProfileLanguage.ts` applies the user's saved `profileStore` language on login and falls back to `'he'` on logout, so a previous user's language choice doesn't leak into the login screen on a shared device. The app is i18n-driven end to end (default Hebrew) — not hardcoded-Hebrew-in-some-spots.
- **House views:** `ClientsHouse/HouseView.tsx` is the shared read-only visualization of tree data as a house — a roof (full-price clients) plus a 2x2 grid of rooms for each `PercentageLevel` discount tier, laid out by `client/src/lib/houseLayout.ts` and drawn by `HouseBackground.tsx`. Room/roof fill colors use an ascending-lightness scale keyed by `PercentageLevel` (roof darkest, higher discount levels progressively lighter), defined in `client/src/config/percentageConfig.ts`. Every client renders as an identical black-bordered square via `HouseNode.tsx` (unlike `CustomNode.tsx`'s per-status shapes) with its name split across two lines; nodes are non-interactive (no drag, no click, no React Flow Handles). `flattenVisibleHouseNodes` in `houseLayout.ts` filters out clients that are inactive or whose `percentageLevel` is unset/hidden (`LEVEL_6`); an optional `HouseMembershipFilter` further restricts which visible nodes are included, based on whether a SUPERVISOR ancestor sits above the node. Two pages consume `HouseView`: `ClientsHouseView.tsx` (route `/houses/clients`, "ניקוד אישי" / Personal House) uses `isClientsHouseMember` — every SUPERVISOR (any depth) plus every non-supervisor client with no SUPERVISOR ancestor; `SupervisorHouseView.tsx` (route `/houses/supervisors`, "ניקוד מפקחים" / Supervisor House) uses `isSupervisorHouseMember` — every SUPERVISOR plus every non-supervisor client that has a SUPERVISOR ancestor. Both filters put every SUPERVISOR in the 50% (`LEVEL_4`) room; an inactive supervisor doesn't count as an ancestor, so its active clients fall back to the Personal House rather than disappearing. `NodeForm.tsx` locks the discount `<select>` to `LEVEL_4` and disables it the moment `SUPERVISOR` status is selected, mirroring the server-side `isSupervisorLevelValid()` rule client-side.

## Responsive Design (Mobile + Desktop)

The app must work on both mobile and desktop web browsers. Every new component should be built mobile-first and adapted for larger screens, not built at a fixed size:

- Use Tailwind's default responsive breakpoints (`sm:` 640px, `md:` 768px, `lg:` 1024px, `xl:` 1280px — no custom breakpoints are configured) to change sizing/layout per viewport, rather than hardcoding one fixed size.
- Full-screen overlays (side menus, modals) should size relative to the viewport on mobile (e.g. `w-3/4`) but be capped with a `max-w-*` utility on larger screens (e.g. `md:max-w-sm`) so they don't stretch edge-to-edge on desktop.
- Prefer flexbox/grid + relative units (`%`, `w-full`, `max-w-*`) over fixed pixel widths/heights for containers; fixed pixel sizing is acceptable for small atomic elements (icons, avatars, tree nodes) but not for page-level layout regions.

## Backend Structure

- **Routes:** `server/src/routes/` → `auth.routes.ts` (`/api/auth`, includes public `POST /forgot-password` and `POST /reset-password`, plus JWT-protected `GET /me` and `PATCH /me` for reading/updating the profile's language preference) and `tree.routes.ts` (`/api/tree`, JWT-protected).
- **Auth middleware:** `server/src/middleware/auth.ts` — validates JWT and attaches user to request.
- **Services:** `server/src/services/` — thin wrappers around third-party integrations, injected as a singleton (e.g. `email.service.ts` exports `emailService: EmailService`, backed by the Brevo HTTP API, used by `auth.controller.ts` to send password-reset links).
- **Database:** `server/prisma/schema.prisma` — `User` and `TreeNode` models. `TreeNode` is self-referential (parentId) for hierarchy. Cascading deletes are configured. `User` also carries `resetTokenHash`/`resetTokenExpiresAt` for the password-reset flow (the raw token is never stored, only its hash).
- **XSS:** Server uses the `xss` library for sanitization.
- **Validation rules:** `server/src/utils/validation.ts` also exports `isValidLanguage()`, checking against `SUPPORTED_LANGUAGES` (`'he' | 'en'`), enforced by `updateProfile` in `auth.controller.ts` on `PATCH /api/auth/me`. It couples `ClientStatus.SUPERVISOR` to `PercentageLevel.LEVEL_4` — a SUPERVISOR node's discount level is not independently editable. `isSupervisorLevelValid()` is enforced in `tree.controller.ts` on both `addNode` and `updateNode` (the latter reads the existing row to compute the effective status/level before validating, since either field alone may be omitted from the PATCH body). A one-time backfill for rows that predate this rule lives at `server/scripts/backfill-supervisor-level.ts`, run via `npm run backfill:supervisor-level:dev` / `npm run backfill:supervisor-level:prod` from `server/`; it's idempotent (`WHERE status = SUPERVISOR AND percentageLevel != LEVEL_4`).
- **Ownership scoping:** `server/src/utils/tree.ts` exports `findOwnedNode(id, userId)` — a shared `prisma.treeNode.findFirst({ where: { id, userId } })` lookup used by `addNode`, `updateNode`, and `deleteNode` in `tree.controller.ts` (`addNode` calls it to validate a supplied `parentId` belongs to the caller; `updateNode`/`deleteNode` call it in place of `findUnique` to load the target node). "Found but belongs to another user" is treated identically to "not found" — always a 404, never a distinguishable 403 — so a caller can't use response codes to confirm a node id exists under a different account. Any new handler that looks up a `TreeNode` by id should go through `findOwnedNode` rather than `prisma.treeNode.findUnique`/`findFirst` directly.

## Code Organization

- **Client** (`client/src/`):
  - `store/` — Zustand stores (`authStore`, `treeStore`, `profileStore`) holding app-wide state and the actions that mutate it; testable directly via `getState()`/`setState()` without rendering.
  - `lib/` — pure functions/data transforms with no React dependency (e.g. `treeLayout.ts`).
  - `components/` — presentational/JSX components.
  - `api/` — HTTP layer (axios instance + endpoint functions).
  - `config/` — static config/enums (e.g. `statusConfig.ts`).
- **Server** (`server/src/`):
  - `controllers/` — route handler business logic; controllers call Prisma directly (no data-access layer), but third-party integrations are wrapped in `services/` (e.g. `auth.controller.ts` calls `emailService.sendPasswordResetEmail(...)` rather than using Brevo directly).
  - `services/` — singleton wrappers around third-party integrations (e.g. `email.service.ts`), so controllers stay Prisma/Express-focused and integrations are swappable/mockable in tests.
  - `utils/` — pure helpers with no Express dependency (e.g. `validation.ts`), extracted out of controllers so they're unit-testable in isolation.
  - `middleware/` — Express middleware (e.g. `auth.ts`).
  - `routes/` — path-to-controller wiring only, no logic.
- **Rule of thumb:** if code touches `req`/`res` or JSX, it stays in `controllers/`/`components/`; if it's a pure function/transform, it belongs in `utils/`/`lib/` so it can be unit-tested without mocking a framework boundary.

## Testing

- Test files are colocated as `*.test.ts` next to the source they test (not a separate `tests/`/`__tests__/` folder).
- Client: logic tests target `store/` (calling actions and asserting on `getState()`, no `renderHook` needed) and `lib/` (pure function tests). No component-render (JSX) tests currently.
- Server: `utils/` helpers get direct unit tests; controllers are tested by calling them directly with hand-built mock `req`/`res` objects and a mocked Prisma client (`vi.mock('../db')`) — no real Postgres, no `supertest`/HTTP layer.
- Both sides: no integration tests against a real database — that's a deliberate scope boundary, not an oversight.

## Key Patterns

- **Tree mutations refetch the full tree** — `treeStore` calls `fetchTree()` after every add/update/delete (no optimistic updates).
- **API circular-dependency avoidance:** The axios instance receives `logout` and `showError` callbacks via injection (`injectLogout`/`injectShowErrorModal` in `api/api.ts`) rather than importing the stores directly; `authStore` wires these up at module load.
- **Prisma adapter:** Uses `@prisma/adapter-pg` with a `pg` connection pool (not the default Prisma engine).

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Deliver an approved plan end-to-end, unattended, ending in a PR (implement → test → ship, open issues noted rather than blocking) → invoke /deliver
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec

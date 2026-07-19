# ClientsTree

A full-stack client hierarchy management app — React + Express + PostgreSQL.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the local database)
- npm (bundled with Node)

---

## First-time setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd ClientsTree

cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Create the root `.env` file

Create a `.env` file in the project root (next to `docker-compose.yml`). This file is gitignored and supplies credentials to the local Postgres container:

```
DB_USER=admin
DB_PASSWORD=password
DB_NAME=clientstree
```

> `server/.env.development` is already configured to match these credentials.

---

## Running locally

You need **two terminals** running simultaneously.

### Terminal 1 — Database + Server

```bash
# Start Postgres (Docker)
docker-compose up -d

# Start the Express server (port 3000)
cd server && npm run dev
```

### Terminal 2 — Client

```bash
# Start the Vite dev server (port 5173)
cd client && npm run dev
```

Open http://localhost:5173 in your browser.

---

## Running tests

Both `client/` and `server/` use [Vitest](https://vitest.dev/). Test files are colocated as `*.test.ts` next to the file they test — there's no separate `tests/`/`__tests__/` folder.

```bash
# Client (jsdom environment + Testing Library)
cd client && npm run test         # run once
cd client && npm run test:watch   # watch mode

# Server (node environment)
cd server && npm run test         # run once
cd server && npm run test:watch   # watch mode
```

---

## Environment variables

### Root `.env` — Docker Compose credentials

| Variable | Description |
|---|---|
| `DB_USER` | Postgres username |
| `DB_PASSWORD` | Postgres password |
| `DB_NAME` | Postgres database name |

### `server/.env.development` — Server config

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full Postgres connection string |
| `JWT_SECRET` | Secret for signing JWT tokens (any string locally) |
| `PORT` | Server port (default: `3000`) |
| `CLIENT_URL` | CORS origin (default: `http://localhost:5173`) |

### `client/.env` — Client config (optional)

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL (default: `http://localhost:3000`) |

---

## Database migrations

Migrations are **not** part of normal startup. Run them only when you change `server/prisma/schema.prisma`:

```bash
cd server
npm run prisma -- migrate dev --name <describe-your-change>
```

To regenerate the Prisma client after schema changes:

```bash
npm run prisma -- generate
```

---

## Design System

The client uses **Tailwind CSS v4** + **shadcn/ui** as its design system.

### Changing the color scheme

All colors are defined as CSS custom properties in [`client/src/index.css`](client/src/index.css).  
Edit the HSL values under `:root` — every component updates automatically:

```css
/* Status colors */
--status-client:      48 96% 53%;   /* yellow */
--status-client-vip:  213 94% 68%;  /* blue   */
--status-distributor: 0 91% 71%;    /* red    */
--status-supervisor:  142 69% 58%;  /* green  */

/* Brand colors (shadcn palette) */
--primary: 221.2 83.2% 53.3%;
```

### Adding a new shadcn component

```bash
cd client
npx shadcn@latest add <component-name>
# e.g. npx shadcn@latest add dialog tooltip badge
```

Components are installed into `src/components/ui/`.

### Using status colors in new components

```tsx
/* Tailwind utility class (preferred for most cases) */
<div className="bg-status-client text-white" />

/* Inline style (needed for clip-path nodes in the tree) */
<div style={{ backgroundColor: `hsl(var(--status-client))` }} />
```

### Utility: `cn()`

Use `cn()` from `@/lib/utils` for all conditional class merging:

```tsx
import { cn } from '@/lib/utils'

<div className={cn('base-class', isActive && 'active-class', className)} />
```

---

## Other commands

```bash
# Lint (client only)
cd client && npm run lint

# Test (both — see "Running tests" above)
cd client && npm run test
cd server && npm run test

# Production build
cd server && npm run build
cd client && npm run build

# Stop the database container
docker-compose down
```

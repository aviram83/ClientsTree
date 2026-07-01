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

## Other commands

```bash
# Lint (client only)
cd client && npm run lint

# Production build
cd server && npm run build
cd client && npm run build

# Stop the database container
docker-compose down
```

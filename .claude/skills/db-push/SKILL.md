---
name: db-push
description: Sync the Prisma schema (server/prisma/schema.prisma) to a database via `prisma db push`. Use when the user asks to push schema changes to dev or production (Neon), e.g. "update the production DB", "push schema to prod", "sync prisma to Neon". Takes an argument of `dev` or `prod` (defaults to `dev`).
---

# db-push

This project has **no `prisma/migrations/` folder** — schema changes are applied with `prisma db push`, not `migrate dev`/`migrate deploy`. This skill runs that safely against the requested environment.

## Determine the target environment

Read the argument passed to this skill:
- `prod` → target is production (Neon), using `server/.env.production`'s `DATABASE_URL`, via `npm run prisma:push`.
- `dev` or no argument → target is local dev, using `server/.env.development`, via `npm run prisma -- db push`.

## Steps

1. **If target is `prod`**, stop and do the following safety checks before running anything:
   - Read `server/.env.production` and confirm the `DATABASE_URL` host looks like the intended Neon project (don't print the full connection string/credentials — just confirm the host looks right, e.g. via a quick visual check with the user if ambiguous).
   - Look at the diff/recent changes to `server/prisma/schema.prisma` (`git log -p` or `git diff`) and check whether the change is purely additive (new column, new optional/defaulted field) or potentially destructive (dropped column, renamed column/table, changed type). If destructive, warn the user explicitly and confirm before proceeding — `db push` can drop data with no down-migration.
   - Recommend (but don't require) the user take a Neon branch/snapshot first, since this is a shared production database with no rollback path via Prisma itself.

2. Run the push command from `server/`:
   - Prod: `npm run prisma:push`
   - Dev: `npm run prisma -- db push`

3. Report the CLI output back to the user verbatim (or summarized) — confirm it printed a success message ("Your database is now in sync with your Prisma schema") or surface the error if it failed.

4. Optionally verify the change landed, e.g. by running `npm run prisma:prod -- studio` (prod) or `npm run prisma -- studio` (dev) and checking the affected table/column, or a targeted query.

## Important

- Never run the `prod` path without the user explicitly invoking `/db-push prod` (or clearly asking to update the production DB) — this touches a live shared database.
- Do not silently skip the destructive-change check for `prod` even if the user seems in a hurry.

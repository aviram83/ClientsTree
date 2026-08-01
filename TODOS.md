# TODOS

## Frontend

### Fix pre-existing `tsc --noEmit` errors

**What:** Five TypeScript errors surface under `tsc --noEmit` on `client/`, present on `main` (not introduced by any recent branch). The project currently ships without running this check (Vite/esbuild transpile-only), so they've been silently accumulating.

**Why:** At least one is a real type-narrowing gap, not noise: `HouseBackground.tsx` reads `HOUSE_SLOT_BOUNDS[PercentageLevel.LEVEL_0]`, but `HOUSE_SLOT_BOUNDS` is typed only over `ROOM_LEVELS` (`LEVEL_1`-`LEVEL_4`), so the type checker can't see that access is safe. Left unresolved, `tsc --noEmit` can't be added to CI/lint without a large, unrelated cleanup blocking unrelated PRs.

**Context:** Errors found while reviewing `feature/clients-house-unified-icons` (2026-08-01), confirmed present via `git stash` against both that branch's base commit and `origin/main` directly:
- `client/src/components/ClientsHouse/ClientsHouseView.tsx:73` — `Node` type not assignable to `Node<HouseNodeData | Record<string, never>>`
- `client/src/components/ClientsHouse/HouseBackground.tsx` — `Property 'LEVEL_0' does not exist` on the `HOUSE_SLOT_BOUNDS` record type
- `client/src/main.tsx:6` — `.tsx` extension import not allowed under current `tsconfig` settings
- `client/src/store/treeStore.test.ts:80,88` — test fixtures missing required `TreeNode` fields (`status`, `userId`, `parentId`, `active`, `createdAt`)

Once fixed, consider adding `tsc --noEmit` to `npm run lint` or CI so these can't silently reappear.

**Effort:** S
**Priority:** P3
**Depends on:** None

## Backend

### Validate non-empty `name` on tree node create/update

**What:** `server/src/controllers/tree.controller.ts` destructures `name` from `req.body` and writes it straight to Prisma with no non-empty check, unlike `auth.controller.ts` which validates `!email || !password` before proceeding.

**Why:** An empty or whitespace-only name currently passes validation and renders as a blank, unlabeled box in both the Tree view and the Clients House view — no way to identify the client from the UI (title tooltip is empty too). Cheap guard, real edge case.

**Context:** Found during adversarial review of `feature/clients-house-unified-icons` (2026-08-01). Not introduced by that branch — the old single-line label rendering had the identical blank-render behavior, this is a pre-existing gap surfaced while reviewing the new two-line name split.

**Effort:** S
**Priority:** P2
**Depends on:** None

## Completed

### Document the Clients House feature in CLAUDE.md

**What:** CLAUDE.md has no mention of the Clients House feature — `PercentageLevel`, the roof/room house layout, `HouseNode`/`HouseBackground` rendering conventions, or how it differs from the Tree view.

**Why:** The feature shipped in an earlier PR (`feature/clients-house-percentage-levels`) and was never wired into the architecture doc, so `CLAUDE.md`'s "Frontend Structure" and "Node shapes" sections only describe the Tree view. Future agent sessions working on Clients House start from zero context.

**Context:** Noted during `/design-review` and `/review` passes on `feature/clients-house-unified-icons` (2026-08-01) — the doc staleness check found no *stale* content to fix (nothing describes House and needs updating), but flagged the gap itself. Good candidate for `/document-release` or `/document-generate`.

**Effort:** S
**Priority:** P3
**Depends on:** None
**Completed:** v0.0.1.0 (2026-08-01)

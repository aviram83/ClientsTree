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

## Security

### Harden `register()` duplicate-email handling

**What:** Registration handling of an already-registered email needs to change once a proper password-recovery path exists.

**Why:** Current behavior around duplicate-email registration should not remain the only path to account recovery once issue #20 ships a real one.

**Context:** Full technical details tracked privately via GitHub Security Advisory (not detailed here — public repo). See the advisory for reproduction and fix options.

**Effort:** M
**Priority:** P1
**Depends on:** #20 (forgot-password/reset flow) — do not close this without a working legitimate reset path in place, or users lose their only password-recovery mechanism.

### Session invalidation on password reset

**What:** Existing authenticated sessions should be invalidated when a user changes their password.

**Why:** A session established before a password change should not silently remain valid after it.

**Context:** Full technical details tracked privately via GitHub Security Advisory (not detailed here — public repo). See the advisory for reproduction and fix options.

**Effort:** M
**Priority:** P2
**Depends on:** None

## Backend

### Validate non-empty `name` on tree node create/update

**What:** `server/src/controllers/tree.controller.ts` destructures `name` from `req.body` and writes it straight to Prisma with no non-empty check, unlike `auth.controller.ts` which validates `!email || !password` before proceeding.

**Why:** An empty or whitespace-only name currently passes validation and renders as a blank, unlabeled box in both the Tree view and the Clients House view — no way to identify the client from the UI (title tooltip is empty too). Cheap guard, real edge case.

**Context:** Found during adversarial review of `feature/clients-house-unified-icons` (2026-08-01). Not introduced by that branch — the old single-line label rendering had the identical blank-render behavior, this is a pre-existing gap surfaced while reviewing the new two-line name split.

**Effort:** S
**Priority:** P2
**Depends on:** None

### Detect async Brevo send failures (sender rejected after 201)

**What:** `server/src/services/email.service.ts` logs `EMAIL_INFO: ... sent successfully` as soon as `client.transactionalEmails.sendTransacEmail()` resolves (HTTP 201). Brevo's API accepts the request synchronously even when the send is later rejected — e.g. an unverified sender — and only reports that failure asynchronously via its event log / webhooks, not as a rejected promise.

**Why:** Confirmed directly while integrating Brevo: two real test sends both returned `201` from the API but were rejected moments later per `GET /v3/smtp/statistics/events`, reason `"Sending has been rejected because the sender you used ... is not valid."` Our app has no way to see that rejection today, so a misconfigured `EMAIL_FROM` (unverified sender, revoked domain auth, etc.) would silently log success while password-reset emails never actually deliver.

**Context:** Found while migrating from Resend to Brevo for password-reset emails (`fix/smtp-resend-migration`, 2026-08-04). Fix likely needs a Brevo webhook endpoint (their `event` webhook posts `delivered`/`error`/etc. per messageId) wired into the server, or a periodic poll of `/v3/smtp/statistics/events`, to catch async failures and alert/log properly.

**Effort:** M
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

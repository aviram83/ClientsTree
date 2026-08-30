---
name: deliver
description: Deliver an approved plan end-to-end, unattended, ending in a PR — implement, test, fix, ship via gstack's /ship, and note any remaining review findings as open issues in the PR rather than blocking. Runs in the background so the foreground session stays free. Takes an optional argument narrowing the scope to deliver from the plan (e.g. "just the backend validation piece"); with no argument, delivers the whole plan. Use when the user says things like "deliver this", "build and ship the plan", "implement and open a PR for X", or names /deliver directly.
---

# deliver

Turns an approved plan into a shipped PR without babysitting it: implements the requested scope, runs tests, ships via gstack's `/ship`, and — unlike a normal interactive `/ship` run — never blocks on unresolved review findings or waits on `AskUserQuestion`. It runs in an isolated background subagent so the user's foreground session and working tree stay free while it works.

## Step 1 — Locate the plan

Find the most recently modified file under `~/.claude/plans/` (on this machine, `C:\Users\avira\.claude\plans\`). If the user named a specific plan/path, use that instead. If it's ambiguous which plan is intended (e.g. several recently touched), ask the user before proceeding — this is the one thing worth a quick foreground check, since guessing the wrong plan wastes an entire background run.

Read the plan file in full.

## Step 2 — Determine scope for this run

The skill's argument text is the source of truth for *what to build right now*:

- **No argument** → scope is the entire plan.
- **Argument given** (e.g. `/deliver just the backend validation piece`) → scope is only that part. The rest of the plan is background context for how this piece fits into the larger feature, not additional work to do in this run.

## Step 3 — Launch the background delivery agent

Launch one `Agent` call:
- `subagent_type: "general-purpose"`
- `isolation: "worktree"` — so the user's main working tree stays untouched and usable while this runs, and so a half-finished delivery never lands on their active branch.
- `run_in_background: true` (the default — do not set `false`; the whole point is the foreground session stays free)
- A **self-contained prompt** built from the plan content, the determined scope, and the briefing in Step 4. The agent has no memory of this conversation, so include the full plan text and the exact scope description directly in the prompt — do not just reference "the plan I found" or a file path from your session's perspective without also pasting its content, since the agent starts in a fresh worktree.

Then tell the user, in one or two sentences: it's running in the background, and they'll get a notification with the PR link (or a blocker report) when it's done. Do not wait on it.

## Step 4 — What to put in the subagent's prompt

The prompt you write must instruct the subagent to:

1. **Implement the requested scope.** Break the scope (not necessarily the entire plan) into a task list and implement it, following this repo's `CLAUDE.md` conventions — reuse existing patterns, respect the client/server/store/lib organization, no premature abstraction, no unrequested scope creep beyond what's needed for this piece.

2. **Run local verification.** Run the relevant test suite(s) and lint per `CLAUDE.md`'s Commands section (`cd client && npm run test`/`npm run lint`, `cd server && npm run test`, as applicable to what changed). Fix failures and re-run until green. **Failing tests are a hard stop** — do not proceed to shipping with red tests; stop and report instead.

3. **Invoke gstack's `/ship` skill** (via the Skill tool, skill name `ship`) to handle the rest: merge base branch, coverage/scope-drift audits, pre-landing review with its Fix-First loop, VERSION/CHANGELOG, commit, push, and PR creation.

4. **Override `/ship`'s two interactive/blocking behaviors, explicitly, because this run is unattended:**
   - **Never call `AskUserQuestion`.** Where `/ship`'s Fix-First loop would normally ask about an ASK-tier finding, resolve it conservatively instead (prefer the safer option; skip a speculative change rather than guess) and record both the finding and the decision made in an `## Open Issues` list you're building up.
   - **Never hard-stop because review findings didn't converge after 3 Fix-First cycles.** Continue through commit/push/PR regardless, and add every remaining finding (file/line, severity, one-line description) to the same `## Open Issues` section of the PR body.
   - **Still hard-stop** on failing tests or any CRITICAL security finding — these are genuine blockers, not open issues. Stop and report rather than shipping broken or unsafe code.

5. **Compose the PR body** using `/ship`'s normal template/sections, plus an added `## Open Issues` section listing anything unresolved (empty/omitted if nothing remains open).

6. **Final report.** The subagent's last message must state, clearly: the PR URL (or, on a hard stop, exactly what blocked and where things were left), a short summary of what was implemented, and the full open-issues list if any. This message is what the user sees in their completion notification, so it needs to stand alone.

## Notes

- This skill deliberately does not reimplement `/ship`'s test/review/PR logic — it wraps it. If `/ship`'s behavior changes upstream (in the shared gstack plugin), this skill's overrides in Step 4 may need revisiting.
- Because delivery happens in an isolated worktree, the user can keep editing/running things in their normal working directory while `/deliver` runs — the two won't conflict until the subagent pushes its branch and opens the PR.

# Changelog

All notable changes to this project are documented here.

## [0.5.0.0] - 2026-08-31

### Added
- You can now move a client (and everyone under them) to a different parent, instead of the only option being to delete and manually recreate the whole subtree elsewhere. Open the edit form on any non-root client and press "Move...": pick a new parent from the full tree (the client itself and anyone already under it are greyed out — you can't move a branch under itself or into its own descendants), see how many clients will move with it, and — when it crosses a supervisor boundary — how many will switch between the Personal House and the Supervisor House. Moving a supervisor itself never changes anyone's house.

### Fixed
- Failed actions (add/edit/delete/move a client, or any other server request) now always show an error message instead of sometimes failing silently — this previously only happened for expired-login errors. A lost connection to the server (e.g. it waking up from being idle) now also shows a message instead of hanging with no feedback.
- Creating a client with no parent selected while you already have a root client is now rejected, instead of silently creating a second, unreachable root.

## [0.4.3.0] - 2026-08-31

### Fixed
- Closed a security gap where a signed-in user could view, edit, or delete another user's tree nodes by guessing or observing a node's ID. Editing and deleting a client, distributor, or supervisor now always checks that it actually belongs to you.

## [0.4.2.0] - 2026-08-26

### Changed
- Switching to English now also mirrors the app's layout to left-to-right — the side menu, forms, login page, and search bar flip direction along with the text instead of staying laid out for Hebrew. The tree graph and house views keep their existing layout in both languages for now (that's a separate, larger project).

## [0.4.1.0] - 2026-08-24

### Changed
- Switching the language to English in Settings now actually translates the app — nav menu, status legend, house views, the client form, login/register/password pages, and the "server waking up" splash all switch with it. Previously only the Settings page itself and the language dropdown responded to the setting; everything else stayed Hebrew regardless.

### Fixed
- Logging out now resets the app's language back to the default. Previously a signed-out session on a shared device could keep showing the login screen in the last user's chosen language instead of the app default.

### Added
- Internal: skill-routing guidance added to the project's contributor docs (no user-facing change).

## [0.4.0.0] - 2026-08-23

### Added
- New "הגדרות" (Settings) page, reachable from the side menu, showing your name and email and a language dropdown (עברית / English). Changing the language and pressing "שמור" (Save) saves the preference and reloads the page.

## [0.3.0.0] - 2026-08-17

### Added
- New "ניקוד מפקחים" (Supervisor House) view, reachable from a "בתים" (Houses) menu group alongside the renamed "ניקוד אישי" (Personal House). Every SUPERVISOR now appears in the 50% room of both houses; a supervisor's clients appear only in the Supervisor House. An inactive supervisor no longer counts toward this — its active clients stay in the Personal House instead of silently disappearing with no visible supervisor to explain why.
- The node create/edit form now locks the discount field to 50% automatically the moment you select the Supervisor status, so it can't be saved at a mismatched percentage.

### Changed
- The nav menu is now partially Hebrew: "עץ לקוחות" (was "Clients Tree"), and both house links are right-aligned with icons to match RTL text.

## [0.2.2.0] - 2026-08-15

### Added
- SUPERVISOR clients are now always locked to the 50% discount tier — the server rejects creating or editing a SUPERVISOR node at any other discount level. A one-time backfill script (`npm run backfill:supervisor-level:dev`/`:prod` in `server/`) corrects any existing SUPERVISOR rows that predate this rule. First half of the upcoming Supervisor House view; no UI changes in this release.

## [0.2.1.0] - 2026-08-13

### Fixed
- Tree view node action buttons (add/edit/delete) are now always visible. They were revealed on hover on larger screens, which left them permanently unreachable on touch tablets like iPad (wide enough to trigger the hover-only styling, but unable to hover).
- Tree layout no longer opens large empty gaps under a parent whose children each have their own children. The graph layout (Dagre) was replaced with a true tree layout (d3-hierarchy / Reingold–Tilford) that packs siblings tightly; sibling spacing is also configurable.

## [0.2.0.0] - 2026-08-11

### Added
- Graceful "server is waking up" screen: on the free-tier host the server sleeps after 15 minutes of inactivity and takes up to a minute to wake. The app now detects a cold start on load, shows a branded splash with a spinner and reassurance copy that escalates as the wait passes ~30s, polls the server under the hood, and loads normally once it responds. A warm server shows nothing extra (no flash), and if the server never wakes within the cap the user gets a clear retry button instead of a hang.

## [0.1.1.0] - 2026-08-04

### Fixed
- Password-reset emails now send reliably in production. Gmail SMTP was replaced with Brevo's HTTP email API, since Render's free tier blocks outbound SMTP ports (25/465/587) entirely, which made emails fail no matter what DNS/network fix was applied.

## [0.1.0.0] - 2026-08-03

### Added
- Forgot-password flow: users who forget their password can now request a reset link by email from the login page, instead of having to re-register to recover access.
- Reset-password page: clicking the emailed link takes users to a page where they can set a new password; links expire after 50 minutes, and requesting a new link invalidates any earlier one.

### Changed
- Password confirmation validation on the Register page now shares its logic with the new Reset Password page instead of duplicating it.

## [0.0.1.1] - 2026-08-01

### Fixed
- Clients House view: node label font size now scales with tile size instead of staying fixed, so client names no longer truncate to "..." on small tiles.
- Clients House view: node border thinned from 3px to 2px.

## [0.0.1.0] - 2026-08-01

### Changed
- Clients House view: every client now renders as a consistent black-bordered square with the name split across two lines, instead of a shape/color that varied by client status.
- Clients House view: room and roof backgrounds now use an ascending-lightness color scale (roof darkest, discount rooms progressively lighter) in both light and dark mode.
- Inactive clients no longer appear in the Clients House view.

### Fixed
- Client names no longer overflow their badge border when many clients are packed into one room.
- Client badge background is now theme-aware, fixing near-invisible text in dark mode.
- Room backgrounds render their intended color instead of a near-black default (a pre-existing rendering bug exposed while implementing the new color scale).

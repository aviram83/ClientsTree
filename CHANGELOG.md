# Changelog

All notable changes to this project are documented here.

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

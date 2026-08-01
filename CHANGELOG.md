# Changelog

All notable changes to this project are documented here.

## [0.0.1.0] - 2026-08-01

### Changed
- Clients House view: every client now renders as a consistent black-bordered square with the name split across two lines, instead of a shape/color that varied by client status.
- Clients House view: room and roof backgrounds now use an ascending-lightness color scale (roof darkest, discount rooms progressively lighter) in both light and dark mode.
- Inactive clients no longer appear in the Clients House view.

### Fixed
- Client names no longer overflow their badge border when many clients are packed into one room.
- Client badge background is now theme-aware, fixing near-invisible text in dark mode.
- Room backgrounds render their intended color instead of a near-black default (a pre-existing rendering bug exposed while implementing the new color scale).

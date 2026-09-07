# design-sync notes — ClientsTree

Repo-specific gotchas for future syncs. Read this before re-running.

## Shape and entry

- `client/` is a Vite **application**, not a published library: no `main`/`module`/
  `exports`, and `vite build` emits an app bundle. The converter therefore runs
  against a hand-written entry, **`client/.ds-entry.tsx`** (committed), passed as
  `--entry`. Adding a component to the design system means adding a line there
  *and* a `componentSrcMap` pin in `config.json`.
- The entry must live **inside `client/`**. The converter walks up from
  `dirname(--entry)` looking for the first `package.json` with a `name`; the repo
  root has none, so an entry at `.design-sync/` resolves `PKG_DIR` to
  `.design-sync` and the build dies on a missing `package.json`.
- Ten components are **default exports** (`TreeVisualizer`, `CustomNode`,
  `HouseView`, `ClientsHouseView`, `SupervisorHouseView`, `HouseNode`,
  `HouseBackground`, `SearchBar`, `LegendContent`, `FloatingToolbar`). The
  converter's synthesized entry uses `export *`, which drops defaults — that is
  the whole reason the explicit entry exists.

## Stylesheet

- Tailwind v4 is CSS-first (`client/src/index.css`), so there is no static
  stylesheet to point `cssEntry` at. `cfg.buildCmd` compiles one to
  **`client/.ds-styles.css`** (gitignored) from `.design-sync/tailwind-entry.css`,
  which imports the app's own entry and adds `@source` lines for
  `client/src` *and* `.design-sync/previews`.
- **Always run `cfg.buildCmd` before `preview-rebuild.mjs`.** Tailwind only emits
  utilities it has seen in scanned source, so a class used *only* in a new preview
  (`size-3`, `max-h-56`) is missing until the sheet is recompiled — the preview
  renders and passes the render check while looking silently unstyled. This cost
  two debug cycles: legend swatches rendered invisible, and a Select popup refused
  to cap its height.
- No fonts are shipped or referenced; the app uses Tailwind's default system
  stack, so `[FONT_MISSING]` should never fire. If it does, something added a
  brand font — wire it via `cfg.extraFonts`.

## Preview harness (`.design-sync/provider.tsx`)

- `DesignSyncProvider` supplies `dir="rtl" lang="he"`, `I18nextProvider`,
  `MemoryRouter` and `ReactFlowProvider`, and seeds `useTreeStore` /
  `useProfileStore` with `DEMO_TREE` at module load.
- **`token` is deliberately left `null`.** `treeStore.fetchTree()` early-returns
  without a token, so no preview ever attempts a network call and the seeded tree
  survives. `signInDemoUser()` / `signOutDemoUser()` exist for the one preview
  that needs a session.
- **A preview must not import a context-providing library directly.** Importing
  `react-router-dom` in `previews/ProtectedRoute.tsx` bundles a *second* copy into
  that preview's IIFE; its Router context is unrelated to the harness's, so
  `<Routes>` matches nothing and the cell renders blank with no error. Anything
  that needs the same instance is composed in `provider.tsx` and exported —
  that is what `ProtectedRouteExample` is for.
- The Zustand stores are module singletons shared by every cell on a card, so two
  cells can never show two different store states side by side. `ProtectedRoute`
  therefore previews only the authenticated branch and describes the other.

## Grouping

- Groups come from the src directory when it is not generic, otherwise from the
  `category` frontmatter in `.design-sync/docs/<Name>.md` (frontmatter-only stubs,
  so `.prompt.md` still gets the synthesized props/examples body). `ui/` and
  `components/` are generic, hence `primitives` / `shell` / `tree` via stubs;
  `ClientsHouse/` is not, so those five land in `clientshouse` no matter what the
  stub says — the stubs there were aligned to reality rather than fighting it.

## Known render warns

- `[GRID_OVERFLOW]` on portal-rendering components (`Popover`, `PopoverTrigger`,
  `Select`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectSeparator`,
  `SelectScrollUpButton`, `SelectScrollDownButton`, `WakeGate`) is expected and
  already remedied with `cardMode: "single"` + `primaryStory` in `config.json`.
- Radix popups only render while open; every open-state preview uses `defaultOpen`.

## Product findings surfaced by the previews (not sync problems)

- `TreeNode` renders the raw status enum (`CLIENT_VIP`) instead of a translated
  label, exposes its actions only on hover, and passes hardcoded English modal
  titles ("Add Node" / "Edit Node") — the only un-i18n'd strings in the set. The
  preview shows it faithfully rather than dressing it up.
- `SelectScrollUpButton` / `SelectScrollDownButton` are rendered by `SelectContent`
  itself; an app author never places them.

## Re-sync risks

- **`DEMO_TREE` in `provider.tsx` is an inlined copy of the `TreeNode` shape.** If
  `client/src/api/types.ts` gains or renames a field, the seed goes stale silently
  — the previews will still render, just wrong. Check it whenever the type changes.
- **`client/.ds-styles.css` is generated and gitignored.** A fresh clone must run
  `cfg.buildCmd` before anything else, or the bundle ships an empty stylesheet.
- `client/.ds-entry.tsx` and `componentSrcMap` are a manual pair. A component added
  to `client/src/components/` appears in neither automatically and will be missing
  from the sync with no warning.
- The playwright version is pinned by what is in the local browser cache
  (`chromium-1234` → `playwright@1.62.0`). On another machine, re-derive it from
  `playwright-core/browsers.json` rather than assuming this version.
- `WakeGate` previews the cold-start splash because no server answers `/health` in
  a preview. If the harness ever gains a mocked health endpoint, that cell would
  flip to rendering its children instead.

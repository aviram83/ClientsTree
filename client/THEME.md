# Theme Guide

This app uses [shadcn/ui](https://ui.shadcn.com/) conventions on top of Tailwind CSS v4. The entire color palette is driven by CSS variables — no component should ever use a raw Tailwind palette class (`bg-blue-500`, `text-gray-700`, hex codes, etc.).

## How it works

- `src/index.css` defines HSL color variables in `:root` (light mode) and `.dark` (dark mode), e.g. `--primary`, `--secondary`, `--background`, `--card`, `--muted`, `--destructive`, `--border`.
- The `@theme` block in the same file maps those variables to Tailwind utility colors: `--color-primary: hsl(var(--primary))`, etc. This is what makes `bg-primary`, `text-muted-foreground`, `border-border` work as Tailwind classes.
- `components.json` holds shadcn's own scaffolding settings (`style`, `baseColor`, `cssVariables`) — see below.
- Tailwind v4 has no `tailwind.config.js`; all configuration is CSS-based (`@import "tailwindcss"` + `@theme` in `index.css`).

Current brand palette: **teal primary** (`--primary: 173 80% 32%`), **neutral slate secondary** (`--secondary: 215 16% 90%`). Status-specific colors (`--status-client`, `--status-client-vip`, `--status-distributor`, `--status-supervisor`, `--status-inactive`) are separate tokens used only by `TreeVisualizer`/`CustomNode`/`StatusLegend` — don't reuse them for generic UI chrome.

## Changing the primary/secondary color

Edit the HSL values in `src/index.css` only, in both `:root` and `.dark`:

```css
:root {
  --primary: 173 80% 32%;
  --primary-foreground: 0 0% 100%;
  --secondary: 215 16% 90%;
  --secondary-foreground: 215 25% 20%;
  --ring: 173 80% 32%;   /* keep in sync with --primary */
}
.dark {
  --primary: 173 70% 45%;
  --secondary: 217.2 32.6% 20%;
  /* ... */
}
```

Rules of thumb:
- `--ring` should normally match `--primary` (focus rings use the brand color).
- Check contrast of `--*-foreground` against its paired background in both light and dark mode (aim for WCAG AA, 4.5:1 for text).
- Never hardcode a color in a component. If you need a new semantic color (e.g. a "warning" state), add a variable here and map it in `@theme`, the same way `--status-*` tokens were added.

## Changing shadcn's base style or base color

`components.json` controls shadcn's scaffolding defaults — it does **not** control your actual brand colors (those live in `index.css` and are independent).

```json
{
  "style": "default",       // or "new-york"
  "tailwind": { "baseColor": "slate" }  // slate | zinc | gray | neutral | stone
}
```

- **`baseColor`** only affects the *default* HSL values shadcn generates for new/regenerated components — it has no effect once you've customized `index.css` yourself.
- **`style`** (`default` vs `new-york`) changes component markup/spacing/sizing conventions (e.g. border radius defaults, padding), baked into each component file at generation time.

To adopt a new style or base color later:
1. Update the field(s) in `components.json`.
2. Re-generate affected components: `npx shadcn@latest add <component> --overwrite` (run from `client/`), one at a time, or re-add all components currently in `src/components/ui/`.
3. Diff the regenerated files against your customizations before committing — regeneration overwrites any manual edits to those files.
4. Your `index.css` color variables are untouched by this process; re-apply the brand palette above if the CLI touches `index.css`.

## Rule for new components

Always use semantic tokens: `bg-primary`, `bg-secondary`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `text-destructive`, `border-border`, etc. Never use raw Tailwind palette classes (`bg-blue-600`, `text-gray-500`) or literal hex/`bg-white`/`bg-black` — this keeps future retheming a one-file edit in `index.css`.

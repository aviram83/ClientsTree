## Building with ClientsTree (Poligon)

A Hebrew, **right-to-left** client-tree app. Every screen is RTL: put `dir="rtl" lang="he"`
on the root element you render into, write UI copy in Hebrew, and use logical
utilities (`ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end`) rather than
`pl-*`/`left-*`, which the components themselves already do.

### Styling idiom: Tailwind v4 utilities over a themed palette

There is no prop-based styling API and no CSS-in-JS. Components take `className`
and merge it (tailwind-merge), so overriding a utility works. Compose your own
layout with the same utilities. Colors come from the theme below — never
hard-code a hex, and never reach for `blue-500`/`gray-700` where a semantic
family exists.

| Family | Utilities | Use for |
|---|---|---|
| Surface | `bg-background` `text-foreground` `bg-card` `text-card-foreground` `bg-popover` `text-popover-foreground` | page, panel and popup grounds |
| Action | `bg-primary` `text-primary-foreground` `bg-secondary` `text-secondary-foreground` `bg-destructive` `text-destructive-foreground` | buttons and emphasis — primary is the brand teal |
| Quiet | `bg-muted` `text-muted-foreground` `bg-accent` `text-accent-foreground` | secondary text, hover fills |
| Lines | `border-border` `border-input` `ring-ring` | borders, field outlines, focus rings |
| Client status | `bg-status-client` `bg-status-client-vip` `bg-status-distributor` `bg-status-supervisor` `bg-status-inactive` | anything that encodes a client's status |
| Discount level | `bg-percentage-level-0` … `bg-percentage-level-4` | house rooms; an ascending-lightness scale, 0 = full price |
| Brand | `text-brand-primary` `text-brand-secondary` `text-brand-slate` | the logo and splash chrome only |

Radii map to the theme: `rounded-sm` / `rounded-md` / `rounded-lg`.

**Status has a shape vocabulary too**, and it is load-bearing: CLIENT = circle,
CLIENT_VIP = diamond, DISTRIBUTOR = hexagon, SUPERVISOR = square. Keep it
consistent with `CustomNode` if you draw clients yourself.

### What each component needs around it

Most `primitives` (Button, Input, Label, Textarea, Checkbox, Switch, Select,
Popover, Card, Avatar, Separator, PasswordInput) render standalone — no setup.
Everything else reads ambient state, and renders blank or throws without it:

- **i18next** — every `shell`, `tree` and `clientshouse` component calls
  `useTranslation()`. Wrap in `I18nextProvider` with an initialized instance.
- **react-router** — `ProtectedRoute` and `UserSideMenu` need a Router above them.
- **React Flow** — `TreeVisualizer`, `HouseView`, `ClientsHouseView`,
  `SupervisorHouseView` and `CustomNode` render a canvas; give them a parent with
  an explicit height, and mount `CustomNode`/`HouseNode` only inside a `ReactFlow`.
- **Zustand stores** — `HouseView`, `ClientsHouseView`, `SupervisorHouseView` and
  `TreeNode` read the tree from the store rather than from props, so they show an
  empty state until it is populated. `TreeVisualizer` and `NodeForm` take theirs
  as props instead.

### Where the truth is

Read `_ds/<folder>/styles.css` and its imports for the full token set, and each
component's `<Name>.prompt.md` (props, variants, examples) before styling around it.

### Idiomatic snippet

```jsx
<div dir="rtl" lang="he" className="min-h-screen bg-background text-foreground p-6">
  <Card className="max-w-md">
    <CardHeader>
      <CardTitle>דנה שפירא</CardTitle>
      <CardDescription>לקוח VIP · 42% הנחה</CardDescription>
    </CardHeader>
    <CardContent className="flex items-center gap-2 text-sm">
      <span className="size-3 rounded-full bg-status-client-vip" />
      <span className="text-muted-foreground">שלושה לקוחות מתחת</span>
    </CardContent>
    <CardFooter className="gap-2">
      <Button>ערוך</Button>
      <Button variant="outline">הצג בעץ</Button>
    </CardFooter>
  </Card>
</div>
```

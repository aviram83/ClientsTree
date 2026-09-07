/**
 * design-sync bundle entry (lives here so the converter resolves client/package.json as the package root).
 *
 * `client/` is an application, not a published library, so there is no dist
 * entry to bundle. This file is that entry: it names every component the design
 * system exposes. It exists because the converter's synthesized entry uses
 * `export *`, which silently drops the ten components ClientsTree exports as
 * defaults (TreeVisualizer, HouseView, CustomNode, ...) — they would be missing
 * from `window.ClientsTree` and every card for them would fail to mount.
 *
 * Adding a component to the design system = adding a line here (and a
 * `componentSrcMap` pin in .design-sync/config.json).
 */

// ── Primitives (shadcn/ui) ──
export * from './src/components/ui/avatar';
export * from './src/components/ui/button';
export * from './src/components/ui/card';
export * from './src/components/ui/checkbox';
export * from './src/components/ui/input';
export * from './src/components/ui/label';
export * from './src/components/ui/password-input';
export * from './src/components/ui/popover';
export * from './src/components/ui/select';
export * from './src/components/ui/separator';
export * from './src/components/ui/switch';
export * from './src/components/ui/textarea';

// ── Shell ──
export { Logo } from './src/components/Logo';
export { Modal } from './src/components/Modal';
export { UserSideMenu } from './src/components/UserSideMenu';
export { WakeGate } from './src/components/WakeGate';
export { ProtectedRoute } from './src/components/ProtectedRoute';

// ── Tree ──
export { default as TreeVisualizer } from './src/components/TreeVisualizer';
export { default as CustomNode } from './src/components/CustomNode';
export { TreeNode } from './src/components/TreeNode';
export { default as FloatingToolbar } from './src/components/FloatingToolbar';
export { default as SearchBar } from './src/components/SearchBar';
export { default as LegendContent } from './src/components/LegendContent';
export { NodeForm } from './src/components/NodeForm';
export { MoveNodePicker } from './src/components/MoveNodePicker';

// ── House ──
export { default as HouseView } from './src/components/ClientsHouse/HouseView';
export { default as ClientsHouseView } from './src/components/ClientsHouse/ClientsHouseView';
export { default as SupervisorHouseView } from './src/components/ClientsHouse/SupervisorHouseView';
export { default as HouseNode } from './src/components/ClientsHouse/HouseNode';
export { default as HouseBackground } from './src/components/ClientsHouse/HouseBackground';

// ── Preview harness (not product surface; see provider.tsx) ──
export {
  DesignSyncProvider,
  ProtectedRouteExample,
  DEMO_TREE,
  DEMO_NODE,
  signInDemoUser,
  signOutDemoUser,
} from '../.design-sync/provider';

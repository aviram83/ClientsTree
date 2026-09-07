/**
 * Preview harness for design-sync (claude.ai/design).
 *
 * Every preview card is wrapped in `DesignSyncProvider`, which supplies the four
 * ambient things ClientsTree components read from context — i18next, the router,
 * React Flow, and RTL direction — plus seeded Zustand state so store-backed
 * components render a real tree instead of an empty state.
 *
 * Not application code: nothing here ships to users, and `client/src` is untouched.
 */
import * as React from 'react';
import { I18nextProvider } from 'react-i18next';
import { ReactFlowProvider } from '@xyflow/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import i18n from '../client/src/i18n';
import { ProtectedRoute } from '../client/src/components/ProtectedRoute';
import { useTreeStore } from '../client/src/store/treeStore';
import { useAuthStore } from '../client/src/store/authStore';
import { useProfileStore } from '../client/src/store/profileStore';
import { ClientStatus } from '../client/src/config/statusConfig';
import { PercentageLevel } from '../client/src/config/percentageConfig';
import type { TreeNode } from '../client/src/api/types';

const USER_ID = 'design-sync-user';

const node = (
  id: string,
  name: string,
  status: ClientStatus,
  percentageLevel: PercentageLevel,
  parentId: string | null,
  children: TreeNode[] = [],
  extra: Partial<TreeNode> = {},
): TreeNode => ({
  id,
  name,
  status,
  percentageLevel,
  userId: USER_ID,
  parentId,
  active: true,
  createdAt: '2026-01-05T09:00:00.000Z',
  children,
  ...extra,
});

/**
 * A small but representative tree: one root, a depth-1 supervisor with clients
 * beneath it (so the Supervisor House has members), a distributor sub-branch,
 * one inactive client, and at least one client at every discount level so both
 * house views fill their roof and all four rooms.
 */
export const DEMO_TREE: TreeNode[] = [
  node('n-root', 'פוליגון', ClientStatus.DISTRIBUTOR, PercentageLevel.LEVEL_0, null, [
    node('n-sup', 'אבי כהן', ClientStatus.SUPERVISOR, PercentageLevel.LEVEL_4, 'n-root', [
      node('n-sup-a', 'מיכל לוי', ClientStatus.CLIENT, PercentageLevel.LEVEL_2, 'n-sup'),
      node('n-sup-b', 'יוסי מזרחי', ClientStatus.CLIENT_VIP, PercentageLevel.LEVEL_1, 'n-sup'),
      node('n-sup-c', 'תמר בן דוד', ClientStatus.CLIENT, PercentageLevel.LEVEL_4, 'n-sup'),
    ], { description: 'מפקח אזור המרכז — אחראי על שמונה לקוחות' }),
    node('n-vip', 'דנה שפירא', ClientStatus.CLIENT_VIP, PercentageLevel.LEVEL_1, 'n-root', [], {
      description: 'לקוחה ותיקה, מזמינה כל רבעון',
    }),
    node('n-dist', 'עמית פרץ', ClientStatus.DISTRIBUTOR, PercentageLevel.LEVEL_2, 'n-root', [
      node('n-dist-a', 'נועה גל', ClientStatus.CLIENT, PercentageLevel.LEVEL_3, 'n-dist'),
      node('n-dist-b', 'איתי רוזן', ClientStatus.CLIENT, PercentageLevel.LEVEL_4, 'n-dist'),
    ]),
    node('n-client', 'שירה אזולאי', ClientStatus.CLIENT, PercentageLevel.LEVEL_0, 'n-root'),
    node('n-client-2', 'רון ברקוביץ', ClientStatus.CLIENT, PercentageLevel.LEVEL_3, 'n-root'),
    node('n-inactive', 'ליאור אדרי', ClientStatus.CLIENT, PercentageLevel.LEVEL_2, 'n-root', [], {
      active: false,
    }),
  ]),
];

/** The supervisor branch on its own — handy for pickers and single-node previews. */
export const DEMO_NODE: TreeNode = DEMO_TREE[0].children[0];

// Seeded once at module load. `token` is deliberately left null: treeStore.fetchTree
// early-returns without a token, so a mounted preview never attempts a network call
// and the seeded tree survives.
useTreeStore.setState({ tree: DEMO_TREE, isLoading: false });
useProfileStore.setState({
  profile: {
    id: USER_ID,
    email: 'demo@poligon.co.il',
    firstName: 'אבירם',
    lastName: 'סלמון',
    language: 'he',
  },
  isLoading: false,
});

/**
 * Wraps every preview card. The `dir="rtl"` element is not decoration — the app
 * ships `dir="rtl" lang="he"` on <html>, so a preview rendered LTR would show
 * spacing and icon placement the real product never produces.
 */
/**
 * Auth-state helpers for the two previews that branch on a session
 * (ProtectedRoute). Call them at module scope in a preview, never during render.
 * `token` stays null by default so treeStore.fetchTree() never reaches the
 * network from a preview.
 */
export const signInDemoUser = () => useAuthStore.setState({ token: 'design-sync-preview' });
export const signOutDemoUser = () => useAuthStore.setState({ token: null });

/**
 * Route composition for the ProtectedRoute preview. It lives here, not in the
 * preview file, because a preview that imports react-router-dom gets its own
 * copy of the library — a second Router context that shares nothing with the
 * harness's, so <Routes> there matches no location and renders nothing.
 * Anything that needs the SAME router instance has to be composed in this file.
 */
export const ProtectedRouteExample = ({ children }: { children: React.ReactNode }) => (
  <Routes>
    <Route element={<ProtectedRoute />}>
      <Route path="*" element={<>{children}</>} />
    </Route>
  </Routes>
);

export const DesignSyncProvider = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/dashboard']}>
    <I18nextProvider i18n={i18n}>
      <ReactFlowProvider>
        <div dir="rtl" lang="he" className="bg-background text-foreground">
          {children}
        </div>
      </ReactFlowProvider>
    </I18nextProvider>
  </MemoryRouter>
);

export default DesignSyncProvider;

import * as React from 'react';
import { ProtectedRouteExample, signInDemoUser } from 'client';

// ProtectedRouteExample mounts the real ProtectedRoute as a layout route inside
// the harness's own router. Composing the routes here instead would bundle a
// second copy of react-router-dom into this preview, whose Router context is
// unrelated to the harness's — the cell would render nothing at all.
signInDemoUser();

/**
 * ProtectedRoute renders no markup of its own. With a token in the auth store it
 * renders the nested route's `<Outlet />` — shown here; without one it renders
 * `<Navigate to="/login" replace />` instead, so the protected screen never
 * mounts. Use it as a layout route around every authenticated screen:
 *
 *     <Route element={<ProtectedRoute />}>
 *       <Route path="/dashboard" element={<DashboardPage />} />
 *     </Route>
 */
export const Authenticated = () => (
  <ProtectedRouteExample>
    <div className="p-8 text-sm">
      <p className="font-medium">עץ הלקוחות</p>
      <p className="text-muted-foreground">תוכן מוגן — מוצג רק כשקיים טוקן בחנות ה־auth.</p>
    </div>
  </ProtectedRouteExample>
);

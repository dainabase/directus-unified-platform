---
name: multi-portal-architecture
description: Architecture React multi-portails pour dashboards role-based — SuperAdmin/CEO, Client, Prestataire, Revendeur portals avec RBAC, layout routes, et shared component patterns. Ce skill doit être utilisé quand l'utilisateur travaille sur les portails, le routing, l'authentification, ou les layouts multi-rôles.
---

# Multi-Portal React Architecture

## Routing Structure (React Router v6)
```jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<RoleBasedRoute allowedRoles={['superadmin']}><AdminLayout /></RoleBasedRoute>}>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/projects" element={<ProjectsPage />} />
    <Route path="/admin/finance" element={<FinancePage />} />
  </Route>
  <Route element={<RoleBasedRoute allowedRoles={['client']}><ClientLayout /></RoleBasedRoute>}>
    <Route path="/client" element={<ClientDashboard />} />
    <Route path="/client/invoices" element={<InvoicesPage />} />
  </Route>
  <Route element={<RoleBasedRoute allowedRoles={['prestataire']}><PrestataireLayout /></RoleBasedRoute>}>
    <Route path="/prestataire" element={<PrestataireDashboard />} />
  </Route>
  <Route element={<RoleBasedRoute allowedRoles={['revendeur']}><RevendeurLayout /></RoleBasedRoute>}>
    <Route path="/revendeur" element={<RevendeurDashboard />} />
  </Route>
</Routes>
```

## RoleBasedRoute Component
```jsx
export const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return children;
};
```

## State Management
- **Zustand**: Client state (portal selection, UI preferences, theme)
- **TanStack Query**: Server/API state (Directus data, refetchInterval pour real-time)

## Portal Layouts
- **SuperAdmin**: Full sidebar + navbar + analytics + all controls + multi-company selector
- **Client**: Simplified sidebar + projets + factures + tickets support
- **Prestataire**: Tasks + timesheets + disponibilité + documents
- **Revendeur**: Commissions + acquisition clients + catalogue produits

## Code-Splitting
```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'portal-admin': ['./src/portals/admin/index.jsx'],
        'portal-client': ['./src/portals/client/index.jsx'],
        'portal-prestataire': ['./src/portals/prestataire/index.jsx'],
        'portal-revendeur': ['./src/portals/revendeur/index.jsx'],
      }
    }
  }
}
```

## Tabler.io Integration
- CSS via CDN: `@tabler/core@1.0.0-beta20`
- Icons: `@tabler/icons-react` via npm
- TOUJOURS utiliser les classes Tabler existantes avant d'écrire du CSS custom

## Forms
- React Hook Form + Zod resolver pour validation type-safe

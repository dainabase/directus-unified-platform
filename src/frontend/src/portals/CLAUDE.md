# Portails Multi-Roles

## Structure
- `/superadmin/` — SuperAdmin/CEO : acces complet, multi-company selector
- `/client/` — Client : projets, factures, tickets
- `/prestataire/` — Prestataire : tasks, timesheets, disponibilite
- `/revendeur/` — Revendeur : commissions, acquisition, catalogue

## Conventions
- Chaque portail a son propre layout (AdminLayout, ClientLayout, etc.)
- RBAC via `RoleBasedRoute` component
- State client: Zustand / State serveur: TanStack Query
- UI: Tailwind CSS classes en priorite, CSS custom en dernier recours
- Code-splitting: un chunk par portail via Vite manualChunks

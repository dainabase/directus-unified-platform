---
name: ceo-dashboard-designer
description: Patterns dashboard CEO/SuperAdmin exécutif — KPI cards, visualisations Recharts, effets glassmorphism, données real-time avec TanStack Query, intégration layout Tabler.io. Ce skill doit être utilisé quand l'utilisateur travaille sur le dashboard SuperAdmin, les graphiques, ou les composants KPI.
---

# CEO Dashboard Designer

## KPI Card Component
```jsx
export const KpiCard = ({ title, value, delta, trend, icon }) => (
  <div className="card" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px' }}>
    <div className="card-body">
      <div className="d-flex align-items-center">
        <div className="subheader">{title}</div>
      </div>
      <div className="h1 mb-0">{value}</div>
      <div className={`text-${delta >= 0 ? 'success' : 'danger'}`}>
        {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
      </div>
      <ResponsiveContainer width="100%" height={40}>
        <AreaChart data={trend}><Area type="monotone" dataKey="value" stroke="#206bc4" fill="rgba(32,107,196,0.1)" /></AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
```

## Chart Patterns (Recharts)
- `<ComposedChart>` : Revenue bars + trend line
- `<PieChart>` : Distribution portfolio
- `<BarChart>` stacked : Par portail/entreprise
- `<LineChart>` : Avec auto-refresh via TanStack Query `refetchInterval`
- TOUJOURS wrapper dans `<ResponsiveContainer width="100%" height={300}>`

## Glassmorphism CSS
```css
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
@media (prefers-reduced-transparency: reduce) {
  .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: none; }
}
```

## Layout Structure (Tabler.io)
- `navbar` → Top navigation avec company selector
- `navbar-aside` → Sidebar avec navigation modules
- `page-header` → Titre page + breadcrumbs + alertes
- `page-body` → Grid de cards et composants
- UTILISER les classes CSS Tabler (`card`, `row`, `col-md-6`, etc.)

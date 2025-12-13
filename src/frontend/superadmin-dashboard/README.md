# SuperAdmin Dashboard

A modern, feature-rich SuperAdmin Dashboard for the Directus Unified Platform.

## Features

- **Complete ERP System**: 14 integrated modules for comprehensive business management
- **Real-time Analytics**: Live dashboards with interactive charts and KPIs
- **Modern UI**: Beautiful glassmorphism design with smooth animations
- **TypeScript**: Full type safety and IntelliSense support
- **State Management**: Zustand for global state, React Query for server state
- **Authentication**: Secure login with role-based access control
- **Multi-company**: Support for managing multiple companies from one dashboard

## Modules

1. **Dashboard** - Real-time overview and analytics
2. **Projects** - Project management with Kanban view
3. **Finance** - Invoicing and payment tracking
4. **Accounting** - General ledger and financial statements
5. **CRM** - Customer relationship management
6. **HR** - Human resources and employee management
7. **Legal** - Contract and compliance management
8. **Collection** - Debt collection workflows
9. **Marketing** - Campaign and lead management
10. **Support** - Customer support ticketing
11. **Logistics** - Inventory and supply chain
12. **Compliance** - Regulatory compliance tracking
13. **Workflows** - Business process automation
14. **Settings** - System configuration

## Tech Stack

- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Zustand for state management
- React Query for data fetching
- React Router v6 for routing
- Recharts for data visualization
- Lucide React for icons
- Date-fns for date handling

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your Directus API URL in `.env`:
```
VITE_DIRECTUS_URL=http://localhost:8055
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:3001 in your browser

## Default Login

- Email: `admin@directus.io`
- Password: `admin`

## Build

To build for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── core/           # Core functionality
│   ├── api/       # API client and endpoints
│   ├── auth/      # Authentication logic
│   ├── routing/   # Route configuration
│   └── store/     # Global state management
├── shared/         # Shared resources
│   ├── components/# Reusable components
│   ├── hooks/     # Custom React hooks
│   ├── utils/     # Utility functions
│   └── types/     # TypeScript types
└── modules/       # Business modules
    ├── dashboard/ # Dashboard module
    ├── projects/  # Projects module
    ├── finance/   # Finance module
    └── ...        # Other modules
```

## Architecture

- **Modular Design**: Each business module is self-contained
- **Lazy Loading**: Modules are loaded on-demand for performance
- **Type Safety**: Comprehensive TypeScript coverage
- **API Integration**: Centralized API client with interceptors
- **Error Handling**: Global error handling with toast notifications
- **Responsive**: Mobile-first design that works on all devices

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Add proper types for API responses
4. Keep components small and focused
5. Use the shared utilities and components
6. Test thoroughly before submitting

## License

Copyright 2024 - All rights reserved
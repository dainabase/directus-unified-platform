# Directus Unified Platform

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![pnpm](https://img.shields.io/badge/pnpm-9.15.1-orange.svg)

## 🚀 Overview

Directus Unified Platform is a comprehensive enterprise management system built on modern web technologies. It provides a unified interface for managing multiple business operations through a single, cohesive platform.

## 🏗️ Architecture

```
├── apps/                    # Application modules
│   ├── web/                # Main web application
│   └── super-admin/        # Super admin dashboard
├── packages/               # Shared packages
│   └── ui/                # Design system (v1.3.0)
├── docs/                   # Documentation
│   ├── api/               # API documentation
│   ├── current/           # Current documentation
│   └── archive/           # Archived documentation
└── scripts/               # Utility scripts
```

## 🛠️ Tech Stack

### Backend
- **Directus CMS** - Headless CMS with 62+ collections
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **Node.js 18+** - Runtime environment

### Frontend
- **React 18.2** - UI framework
- **Vite 5.0** - Build tool
- **TypeScript 5.2** - Type safety
- **Tailwind CSS 3.3** - Styling
- **Radix UI** - Component primitives

### Design System
- **@dainabase/ui** - Complete design system with 50+ components
- **Storybook 8.1** - Component documentation
- **Chromatic** - Visual testing

## 📦 Installation

### Prerequisites
- Node.js 18+
- pnpm 9.15.1
- PostgreSQL 15+
- Redis

### Setup

```bash
# Clone the repository
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Run database migrations
pnpm migrate

# Start development servers
pnpm dev
```

## 🔧 Development

```bash
# Start all services
pnpm dev

# Run specific app
pnpm dev:web           # Web application
pnpm dev:admin         # Admin dashboard

# Build for production
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format
```

## 📚 Documentation

- [Getting Started](./docs/current/getting-started.md)
- [API Reference](./docs/api/README.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## 🏢 Multi-Company Support

The platform supports 5 companies:
- HYPERVISUAL
- DAINAMICS
- LEXAIA
- ENKI REALTY
- TAKEOUT

## 🔐 Security

- OAuth 2.0 authentication
- Role-based access control
- API key management
- JWT token authentication

## 🧪 Testing

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Visual regression tests
pnpm test:visual
```

## 📈 Performance

- Lighthouse score: 95+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 300KB (gzipped)

## 🤝 Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/dainabase/directus-unified-platform)
- [Documentation](https://docs.dainabase.com)
- [Issues](https://github.com/dainabase/directus-unified-platform/issues)
- [Discussions](https://github.com/dainabase/directus-unified-platform/discussions)

## 👥 Team

Maintained by the Dainabase team.

---

*Built with ❤️ using modern web technologies*

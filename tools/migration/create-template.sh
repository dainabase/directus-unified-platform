#!/bin/bash

# Créer le repo (si tu as GitHub CLI)
echo "📦 Creating repository..."
gh repo create dainabase/ui-consumer-template --private --clone --description "Next.js 14 template consuming @dainabase/ui"

# Ou clone si déjà créé manuellement
# git clone git@github.com:dainabase/ui-consumer-template.git

cd ui-consumer-template

# Créer la structure
echo "📁 Creating directory structure..."
mkdir -p app/demo/{buttons,forms,data-grid,charts,layout}
mkdir -p scripts
mkdir -p .github/workflows

# Fichiers racine
echo "📄 Creating root files..."

cat > .npmrc << 'EOF'
@dainabase:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
EOF

cat > package.json << 'EOF'
{
  "name": "ui-consumer-template",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "postinstall": "node scripts/check-ui-installed.cjs"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@dainabase/ui": "^0.2.0",
    "lucide-react": "^0.460.0",
    "zod": "^3.23.8",
    "@hookform/resolvers": "^3.3.4",
    "react-hook-form": "^7.53.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.12",
    "typescript": "^5.5.4",
    "@types/node": "^20.11.30",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.5"
  }
}
EOF

cat > tsconfig.json << 'EOF'
{
  "extends": "next/tsconfig",
  "compilerOptions": {
    "strict": true,
    "baseUrl": "."
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

cat > next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};
export default nextConfig;
EOF

cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
EOF

cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";
import { tokens } from "@dainabase/ui/tokens";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./node_modules/@dainabase/ui/dist/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      colors: tokens.colors,
      borderRadius: tokens.radius,
      spacing: tokens.spacing,
      boxShadow: tokens.shadow,
      fontFamily: { sans: [tokens.font.sans as any, "sans-serif"] }
    }
  },
  plugins: []
} satisfies Config;
EOF

cat > .eslintrc.js << 'EOF'
module.exports = {
  extends: ["next/core-web-vitals"]
};
EOF

cat > .dockerignore << 'EOF'
node_modules
.next/cache
.git
Dockerfile
docker-compose.yml
EOF

cat > Dockerfile << 'EOF'
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package.json .
COPY .npmrc .
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm install --prod --frozen-lockfile
EXPOSE 3000
CMD ["pnpm", "start"]
EOF

cat > docker-compose.yml << 'EOF'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN}
EOF

# Scripts
cat > scripts/check-ui-installed.cjs << 'EOF'
#!/usr/bin/env node
try {
  require.resolve("@dainabase/ui");
  console.log("✅ @dainabase/ui detected.");
} catch (e) {
  console.warn("⚠️  @dainabase/ui not found yet. Run 'pnpm install' again after package is published.");
}
EOF

# App files
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  height: 100%;
}
EOF

cat > app/layout.tsx << 'EOF'
import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@dainabase/ui";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "UI Consumer Template",
  description: "Demo app consuming @dainabase/ui"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={montserrat.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
      </body>
    </html>
  );
}
EOF

cat > app/page.tsx << 'EOF'
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, Button, ThemeToggle, Icon } from "@dainabase/ui";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">UI Consumer Template</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline">
              <a href="https://github.com/dainabase/directus-unified-platform" target="_blank" rel="noreferrer">
                <Icon name="Github" className="mr-2" /> Repo DS
              </a>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle>Demo Pages</CardTitle></CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild><Link href="/demo/buttons">Buttons</Link></Button>
            <Button asChild variant="secondary"><Link href="/demo/forms">Forms</Link></Button>
            <Button asChild variant="ghost"><Link href="/demo/data-grid">Data Grid</Link></Button>
            <Button asChild variant="outline"><Link href="/demo/charts">Charts</Link></Button>
            <Button asChild variant="outline"><Link href="/demo/layout">Layout</Link></Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
EOF

# Demo pages
cat > app/demo/buttons/page.tsx << 'EOF'
import { Button, Card, CardHeader, CardTitle, CardContent, Icon } from "@dainabase/ui";

export default function ButtonsDemo() {
  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader><CardTitle>Button Variants</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <Button>
            <Icon name="Plus" className="mr-2" />
            With Icon
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
EOF

# CI Workflow
cat > .github/workflows/ci.yml << 'EOF'
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      
      - name: Configure npm for GitHub Packages
        run: |
          echo "@dainabase:registry=https://npm.pkg.github.com/" >> .npmrc
          echo "//npm.pkg.github.com/:_authToken=${{ secrets.GITHUB_TOKEN }}" >> .npmrc
      
      - run: pnpm install
      - run: pnpm build
EOF

# README
cat > README.md << 'EOF'
# UI Consumer Template

Next.js 14 app demonstrating @dainabase/ui Design System consumption from GitHub Packages.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- GitHub token with `read:packages` scope

### Setup

1. **Configure GitHub Packages access**
```bash
export GITHUB_TOKEN=your_github_token_here
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Run development server**
```bash
pnpm dev
```

4. **Open** http://localhost:3000

## 📁 Demo Pages

- `/demo/buttons` - Button variants and sizes
- `/demo/forms` - Form controls with validation
- `/demo/data-grid` - Advanced data grid with virtualization
- `/demo/charts` - Chart components
- `/demo/layout` - Layout patterns with AppShell

## 🐳 Docker
```bash
docker-compose up
```

## 📦 Package Info
This template consumes @dainabase/ui from GitHub Packages.

- Design System: https://github.com/dainabase/directus-unified-platform
- Package: @dainabase/ui@^0.2.0
EOF

# Git init and commit
git init
git add .
git commit -m "feat: initial consumer template (Next.js 14 + @dainabase/ui)"
git branch -M main
git remote add origin git@github.com:dainabase/ui-consumer-template.git
git push -u origin main

echo "✅ Template created and pushed!"
echo "📦 Once @dainabase/ui is published, run:"
echo "   pnpm install"
echo "   pnpm dev"
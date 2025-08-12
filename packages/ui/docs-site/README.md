# Dainabase UI Documentation Site

This is the official documentation site for the Dainabase UI Design System, built with [Docusaurus](https://docusaurus.io/).

## 🚀 Quick Start

### Development

```bash
# Navigate to docs site
cd packages/ui/docs-site

# Install dependencies
npm install

# Start development server
npm start
```

The documentation will be available at `http://localhost:3000`.

### Build

```bash
# Build for production
npm run build

# Test production build locally
npm run serve
```

## 📁 Project Structure

```
docs-site/
├── docs/                    # Documentation markdown files
│   ├── getting-started/     # Getting started guides
│   ├── components/          # Component documentation
│   ├── theming/            # Theming guides
│   ├── patterns/           # UI patterns and examples
│   ├── api/                # API reference
│   └── advanced/           # Advanced topics
├── src/
│   ├── components/         # React components for docs
│   ├── pages/             # Custom pages
│   └── css/               # Custom styles
├── static/                # Static assets
├── docusaurus.config.ts   # Docusaurus configuration
├── sidebars.js           # Sidebar navigation
└── package.json          # Dependencies and scripts
```

## 📝 Writing Documentation

### Component Documentation Template

When documenting a new component, use this template:

```markdown
---
id: component-name
title: Component Name
sidebar_position: 1
---

# Component Name

Brief description of the component and its purpose.

## Features
- Key feature 1
- Key feature 2

## Installation
\`\`\`bash
npm install @dainabase/ui
\`\`\`

## Usage
\`\`\`tsx
import { ComponentName } from '@dainabase/ui';

export function Example() {
  return <ComponentName />;
}
\`\`\`

## Examples
[Interactive examples with live code blocks]

## API Reference
[Props table and detailed API documentation]

## Accessibility
[Accessibility features and keyboard navigation]

## Best Practices
[Do's and Don'ts]

## Related Components
[Links to related components]
```

### Live Code Blocks

Use the `live` directive for interactive code examples:

````markdown
```jsx live
function Example() {
  const [count, setCount] = React.useState(0);
  
  return (
    <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  );
}
```
````

## 🎨 Customization

### Theme Configuration

Edit `docusaurus.config.ts` to customize:
- Site metadata
- Navigation links
- Footer content
- Color scheme

### Custom CSS

Add custom styles in `src/css/custom.css`:

```css
:root {
  --ifm-color-primary: #2563eb;
  --ifm-font-family-base: system-ui;
}
```

## 🌍 Internationalization

The documentation supports multiple languages:
- English (en)
- French (fr)
- German (de)
- Spanish (es)
- Italian (it)

### Adding Translations

```bash
# Write translation files
npm run write-translations -- --locale fr

# Start in French
npm run start -- --locale fr
```

## 🚀 Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment

```bash
# Build the site
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Custom Domain

To use a custom domain (docs.dainabase.dev):

1. Add a `CNAME` file to `static/` with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

## 🔍 Search

The documentation uses Algolia DocSearch for powerful search functionality.

### Configuration

Update the Algolia configuration in `docusaurus.config.ts`:

```js
themeConfig: {
  algolia: {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_API_KEY',
    indexName: 'dainabase-ui',
  },
}
```

## 📊 Analytics

Google Analytics is integrated for tracking documentation usage:

```js
gtag: {
  trackingID: 'G-XXXXXXXXXX',
  anonymizeIP: true,
}
```

## 🤝 Contributing

### Adding Documentation

1. Create a new `.md` file in the appropriate `docs/` subdirectory
2. Add frontmatter with `id`, `title`, and `sidebar_position`
3. Write comprehensive documentation following the template
4. Update `sidebars.js` if needed
5. Test locally with `npm start`
6. Submit a pull request

### Code Examples

- Always test code examples before adding them
- Use TypeScript for type safety
- Include both simple and complex examples
- Add comments for clarity

### Style Guide

- Use clear, concise language
- Write in present tense
- Use active voice
- Include visual examples where helpful
- Keep paragraphs short and scannable

## 🐛 Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clear cache and rebuild
npm run clear
npm run build
```

#### Port Already in Use

```bash
# Use a different port
npm start -- --port 3001
```

#### Search Not Working

- Verify Algolia credentials
- Check if index is populated
- Ensure API key has search permissions

## 📚 Resources

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [MDX Documentation](https://mdxjs.com/)
- [React Live Playground](https://github.com/FormidableLabs/react-live)
- [Algolia DocSearch](https://docsearch.algolia.com/)

## 📄 License

This documentation is part of the Dainabase UI project and is MIT licensed.

---

<div align="center">
  <strong>Built with ❤️ by the Dainabase Team</strong>
  <br />
  <a href="https://github.com/dainabase/directus-unified-platform">GitHub</a> •
  <a href="https://discord.gg/dainabase">Discord</a> •
  <a href="https://twitter.com/dainabase">Twitter</a>
</div>

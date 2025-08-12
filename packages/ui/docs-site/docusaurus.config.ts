import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Dainabase UI',
  tagline: 'A modern, accessible, and performant React component library',
  favicon: 'img/favicon.ico',
  url: 'https://docs.dainabase.dev',
  baseUrl: '/',
  organizationName: 'dainabase',
  projectName: 'directus-unified-platform',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'de', 'es', 'it'],
    localeConfigs: {
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
      fr: {
        label: 'Français',
        direction: 'ltr',
        htmlLang: 'fr-FR',
      },
      de: {
        label: 'Deutsch',
        direction: 'ltr',
        htmlLang: 'de-DE',
      },
      es: {
        label: 'Español',
        direction: 'ltr',
        htmlLang: 'es-ES',
      },
      it: {
        label: 'Italiano',
        direction: 'ltr',
        htmlLang: 'it-IT',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/dainabase/directus-unified-platform/tree/main/packages/ui/docs-site/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/dainabase/directus-unified-platform/tree/main/packages/ui/docs-site/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    '@docusaurus/theme-live-codeblock',
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        language: ["en", "fr", "de", "es", "it"],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/dainabase-social-card.jpg',
    navbar: {
      title: 'Dainabase UI',
      logo: {
        alt: 'Dainabase UI Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/playground',
          label: 'Playground',
          position: 'left',
        },
        {
          to: '/showcase',
          label: 'Showcase',
          position: 'left',
        },
        {
          href: 'https://storybook.dainabase.dev',
          label: 'Storybook',
          position: 'left',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/dainabase/directus-unified-platform',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started/installation',
            },
            {
              label: 'Components',
              to: '/docs/components/button',
            },
            {
              label: 'Theming',
              to: '/docs/theming/design-tokens',
            },
            {
              label: 'API Reference',
              to: '/docs/api/components',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/dainabase',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/dainabase',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/dainabase',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'NPM Package',
              href: 'https://www.npmjs.com/package/@dainabase/ui',
            },
            {
              label: 'Changelog',
              href: 'https://github.com/dainabase/directus-unified-platform/blob/main/packages/ui/CHANGELOG.md',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Dainabase. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['jsx', 'tsx', 'bash', 'json'],
    },
    liveCodeBlock: {
      playgroundPosition: 'bottom',
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'support_us',
      content:
        '🎉 <b>Dainabase UI v1.0.1-beta.2</b> is here! 93%+ test coverage achieved! <a target="_blank" rel="noopener noreferrer" href="https://github.com/dainabase/directus-unified-platform">⭐ Star us on GitHub</a>',
      backgroundColor: '#fafbfc',
      textColor: '#091E42',
      isCloseable: true,
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      '@docusaurus/plugin-pwa',
      {
        debug: true,
        offlineModeActivationStrategies: [
          'appInstalled',
          'standalone',
          'queryString',
        ],
        pwaHead: [
          {
            tagName: 'link',
            rel: 'icon',
            href: '/img/logo.png',
          },
          {
            tagName: 'link',
            rel: 'manifest',
            href: '/manifest.json',
          },
          {
            tagName: 'meta',
            name: 'theme-color',
            content: '#000',
          },
        ],
      },
    ],
  ],
};

export default config;

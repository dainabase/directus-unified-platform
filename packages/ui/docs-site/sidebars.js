/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/introduction',
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/typescript',
        'getting-started/migration-guide',
      ],
    },
    {
      type: 'category',
      label: 'Components',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Core',
          items: [
            'components/icon',
            'components/label',
            'components/separator',
          ],
        },
        {
          type: 'category',
          label: 'Layout',
          items: [
            'components/card',
            'components/resizable',
            'components/scroll-area',
            'components/collapsible',
          ],
        },
        {
          type: 'category',
          label: 'Forms',
          items: [
            'components/button',
            'components/input',
            'components/textarea',
            'components/select',
            'components/checkbox',
            'components/radio-group',
            'components/switch',
            'components/slider',
            'components/form',
            'components/date-picker',
            'components/date-range-picker',
            'components/file-upload',
            'components/color-picker',
          ],
        },
        {
          type: 'category',
          label: 'Data Display',
          items: [
            'components/table',
            'components/data-grid',
            'components/data-grid-advanced',
            'components/charts',
            'components/timeline',
            'components/badge',
          ],
        },
        {
          type: 'category',
          label: 'Navigation',
          items: [
            'components/tabs',
            'components/stepper',
            'components/pagination',
            'components/breadcrumbs',
            'components/navigation-menu',
            'components/menubar',
          ],
        },
        {
          type: 'category',
          label: 'Feedback',
          items: [
            'components/alert',
            'components/toast',
            'components/progress',
            'components/skeleton',
            'components/sonner',
            'components/rating',
          ],
        },
        {
          type: 'category',
          label: 'Overlays',
          items: [
            'components/dialog',
            'components/sheet',
            'components/popover',
            'components/dropdown-menu',
            'components/context-menu',
            'components/hover-card',
            'components/tooltip',
          ],
        },
        {
          type: 'category',
          label: 'Advanced',
          items: [
            'components/command-palette',
            'components/carousel',
            'components/accordion',
            'components/alert-dialog',
            'components/avatar',
            'components/calendar',
            'components/toggle',
            'components/toggle-group',
            'components/text-animations',
            'components/error-boundary',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Theming',
      items: [
        'theming/design-tokens',
        'theming/dark-mode',
        'theming/custom-themes',
        'theming/css-variables',
        'theming/tailwind-config',
      ],
    },
    {
      type: 'category',
      label: 'Patterns',
      items: [
        'patterns/forms',
        'patterns/data-tables',
        'patterns/dashboards',
        'patterns/authentication',
        'patterns/settings',
        'patterns/error-pages',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/components',
        'api/hooks',
        'api/utilities',
        'api/types',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/performance',
        'advanced/lazy-loading',
        'advanced/accessibility',
        'advanced/internationalization',
        'advanced/testing',
        'advanced/bundle-size',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      items: [
        'contributing/overview',
        'contributing/development-setup',
        'contributing/component-guidelines',
        'contributing/testing-guidelines',
        'contributing/documentation',
        'contributing/pull-requests',
      ],
    },
  ],
};

export default sidebars;

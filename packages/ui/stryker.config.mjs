// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: 'pnpm',
  reporters: [
    'html',
    'clear-text',
    'progress',
    'dashboard',
    'json'
  ],
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.config.ts',
    dir: 'src'
  },
  coverageAnalysis: 'perTest',
  mutate: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/types/**',
    '!src/**/*.d.ts'
  ],
  mutator: {
    name: 'typescript',
    excludedMutations: [
      'BlockStatement',
      'ArrayDeclaration'
    ]
  },
  dashboard: {
    project: 'github.com/dainabase/directus-unified-platform',
    version: 'main',
    module: 'ui',
    reportType: 'full'
  },
  thresholds: {
    high: 90,
    low: 80,
    break: 75
  },
  timeoutMS: 30000,
  timeoutFactor: 2,
  maxConcurrentTestRunners: 4,
  commandRunner: {
    command: 'pnpm test:unit'
  },
  plugins: [
    '@stryker-mutator/vitest-runner',
    '@stryker-mutator/typescript-checker',
    '@stryker-mutator/html-reporter',
    '@stryker-mutator/json-reporter'
  ],
  htmlReporter: {
    fileName: 'reports/mutation/index.html'
  },
  jsonReporter: {
    fileName: 'reports/mutation/report.json'
  },
  disableTypeChecks: false,
  warnings: true,
  allowConsoleColors: true,
  logLevel: 'info',
  fileLogLevel: 'debug',
  incremental: true,
  incrementalFile: '.stryker-incremental.json',
  force: false
};

export default config;
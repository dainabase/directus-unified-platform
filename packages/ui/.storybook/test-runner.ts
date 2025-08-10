import { TestRunnerConfig } from '@storybook/test-runner';
import { injectAxe, checkA11y, getViolations } from '@axe-core/playwright';

const config: TestRunnerConfig = {
  async preRender(page) {
    await injectAxe(page);
  },
  async postRender(page, context) {
    // Analyse a11y sur la zone de rendu des stories
    const violations = await getViolations(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });

    if (violations.length > 0) {
      // Affiche un résumé lisible dans les logs CI
      await checkA11y(page, '#storybook-root', {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
      throw new Error(
        `A11y violations (${violations.length}) in story: ${context.title} → ${context.name}`
      );
    }
  },
};

export default config;
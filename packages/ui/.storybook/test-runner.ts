import { getStoryContext } from '@storybook/test-runner';
import { injectAxe, checkA11y } from 'axe-playwright';

/*
 * See https://storybook.js.org/docs/writing-tests/test-runner#test-hook-api
 * to learn more about the test-runner hooks API.
 */
export default {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    
    // Skip a11y tests for certain stories
    const skipA11y = storyContext.parameters?.a11y?.disable;
    
    if (!skipA11y) {
      await checkA11y(page, '#storybook-root', {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
        // Configurez les règles axe ici si nécessaire
        axeOptions: {
          rules: {
            // Exemple : désactiver certaines règles si nécessaire
            // 'color-contrast': { enabled: false },
          },
        },
      });
    }
  },
};

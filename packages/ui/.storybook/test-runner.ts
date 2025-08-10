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

    // Budget a11y strict: échec si violations serious ou critical
    const criticalViolations = violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    const minorViolations = violations.filter(
      v => v.impact === 'minor' || v.impact === 'moderate'
    );

    // Log des violations pour debug
    if (violations.length > 0) {
      console.log(`\n📊 A11y Report for ${context.title} → ${context.name}:`);
      console.log(`  🔴 Critical/Serious: ${criticalViolations.length}`);
      console.log(`  ⚠️  Minor/Moderate: ${minorViolations.length}`);
      
      if (criticalViolations.length > 0) {
        console.log('\n🚨 Critical/Serious violations found:');
        criticalViolations.forEach(v => {
          console.log(`  - [${v.impact}] ${v.id}: ${v.description}`);
          console.log(`    Nodes affected: ${v.nodes.length}`);
        });
      }
    }

    // Échec strict si violations critical ou serious
    if (criticalViolations.length > 0) {
      // Génère le rapport détaillé
      await checkA11y(page, '#storybook-root', {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
      
      throw new Error(
        `🚨 A11y BUDGET EXCEEDED: ${criticalViolations.length} critical/serious violations in story: ${context.title} → ${context.name}`
      );
    }
    
    // Warning pour les violations mineures (ne fait pas échouer le test)
    if (minorViolations.length > 0) {
      console.warn(
        `⚠️  A11y warning: ${minorViolations.length} minor/moderate violations in story: ${context.title} → ${context.name}`
      );
    }
  },
};

// Export des critères du budget a11y pour documentation
export const A11Y_BUDGET = {
  critical: 0,  // Aucune violation critique tolérée
  serious: 0,   // Aucune violation sérieuse tolérée
  moderate: Infinity, // Violations modérées autorisées mais avec warning
  minor: Infinity,    // Violations mineures autorisées mais avec warning
};

export default config;

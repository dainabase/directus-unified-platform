import { test, expect } from '@playwright/test';

/**
 * Tests visuels Chromatic pour le Design System
 * Ces tests sont exécutés automatiquement par Chromatic
 */

// Configuration de base pour les tests visuels
test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Aller à Storybook
    await page.goto('http://localhost:6006');
    // Attendre que Storybook soit chargé
    await page.waitForSelector('[title="Storybook"]');
  });

  test('Button - tous les variants', async ({ page }) => {
    // Test chaque variant du bouton
    const variants = ['default', 'ghost', 'outline', 'link', 'destructive'];
    
    for (const variant of variants) {
      await page.goto(`http://localhost:6006/iframe.html?id=components-button--${variant}&viewMode=story`);
      await expect(page).toHaveScreenshot(`button-${variant}.png`);
    }
  });

  test('Card - états', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=components-card--default&viewMode=story');
    
    // État normal
    await expect(page).toHaveScreenshot('card-default.png');
    
    // État hover (si applicable)
    const card = page.locator('.card').first();
    if (await card.isVisible()) {
      await card.hover();
      await expect(page).toHaveScreenshot('card-hover.png');
    }
  });

  test('Form components', async ({ page }) => {
    const formComponents = [
      'input',
      'textarea',
      'select',
      'checkbox',
      'switch',
      'date-picker'
    ];
    
    for (const component of formComponents) {
      await page.goto(`http://localhost:6006/iframe.html?id=components-${component}--default&viewMode=story`);
      await expect(page).toHaveScreenshot(`form-${component}.png`);
    }
  });

  test('Dark mode', async ({ page }) => {
    // Tester le theme toggle
    await page.goto('http://localhost:6006/iframe.html?id=components-theme-toggle--default&viewMode=story');
    
    // Light mode
    await expect(page).toHaveScreenshot('theme-light.png');
    
    // Activer dark mode
    const toggle = page.locator('[role="switch"]').first();
    if (await toggle.isVisible()) {
      await toggle.click();
      await page.waitForTimeout(500); // Attendre la transition
      await expect(page).toHaveScreenshot('theme-dark.png');
    }
  });

  test('Responsive breakpoints', async ({ page }) => {
    const breakpoints = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1440, height: 900, name: 'desktop' }
    ];
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await page.goto('http://localhost:6006/iframe.html?id=components-app-shell--default&viewMode=story');
      await expect(page).toHaveScreenshot(`responsive-${breakpoint.name}.png`);
    }
  });

  test('Data Grid', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=components-data-grid--default&viewMode=story');
    
    // Capture initiale
    await expect(page).toHaveScreenshot('data-grid-initial.png');
    
    // Trier une colonne (si disponible)
    const sortButton = page.locator('[role="columnheader"] button').first();
    if (await sortButton.isVisible()) {
      await sortButton.click();
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('data-grid-sorted.png');
    }
  });

  test('Charts', async ({ page }) => {
    const chartTypes = ['line', 'bar', 'pie', 'area'];
    
    for (const chart of chartTypes) {
      const url = `http://localhost:6006/iframe.html?id=components-charts--${chart}&viewMode=story`;
      try {
        await page.goto(url);
        await page.waitForTimeout(1000); // Attendre le rendu du chart
        await expect(page).toHaveScreenshot(`chart-${chart}.png`);
      } catch {
        // Ignorer si le chart n'existe pas
        continue;
      }
    }
  });

  test('Animations et transitions', async ({ page }) => {
    // Tester les animations du dialog
    await page.goto('http://localhost:6006/iframe.html?id=components-dialog--default&viewMode=story');
    
    // Ouvrir le dialog
    const trigger = page.locator('button').first();
    if (await trigger.isVisible()) {
      await trigger.click();
      await page.waitForTimeout(300); // Attendre l'animation
      await expect(page).toHaveScreenshot('dialog-open.png');
      
      // Fermer le dialog
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('dialog-closed.png');
    }
  });

  test('Focus states', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=components-button--default&viewMode=story');
    
    // Tester le focus au clavier
    await page.keyboard.press('Tab');
    await expect(page).toHaveScreenshot('button-focused.png');
  });

  test('Error states', async ({ page }) => {
    // Tester les états d'erreur des formulaires
    await page.goto('http://localhost:6006/iframe.html?id=components-forms-demo--validation&viewMode=story');
    
    // Soumettre un formulaire vide pour déclencher les erreurs
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('form-errors.png');
    }
  });
});

// Tests spécifiques pour l'accessibilité visuelle
test.describe('Visual Accessibility', () => {
  test('High contrast mode', async ({ page }) => {
    // Simuler le mode contraste élevé
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    await page.goto('http://localhost:6006/iframe.html?id=components-button--default&viewMode=story');
    await expect(page).toHaveScreenshot('high-contrast.png');
  });

  test('Reduced motion', async ({ page }) => {
    // Simuler la préférence reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://localhost:6006/iframe.html?id=components-toast--default&viewMode=story');
    await expect(page).toHaveScreenshot('reduced-motion.png');
  });
});

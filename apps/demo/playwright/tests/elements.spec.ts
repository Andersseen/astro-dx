import { expect, test } from '@playwright/test';

test.describe('Elements — dx-show', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/elements');
  });

  test('dx-show element hides content when signal is false', async ({ page }) => {
    // Initial state hasItems might be visible if the page rendered before hydration
    const el = page.locator('dx-show[signal="hasItems"]');
    
    // Ensure cart is clear
    await page.locator('#btn-clear-cart').click();
    await page.waitForTimeout(200);
    await expect(el).toBeHidden();
    
    // Add product to make hasItems true
    await page.locator('#btn-add-product').click();
    await page.waitForTimeout(200);
    await expect(el).toBeVisible();

    // Clear cart again
    await page.locator('#btn-clear-cart').click();
    await page.waitForTimeout(200);
    await expect(el).toBeHidden();
  });
});

test.describe('Elements — dx-if', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/elements');
  });

  test('dx-if element clears innerHTML when false', async ({ page }) => {
    // Initial state isModalOpen is false
    const el = page.locator('dx-if[signal="isModalOpen"]');
    await expect(el).toBeEmpty();

    // Open modal
    await page.locator('#btn-open-modal').click();
    await expect(el).not.toBeEmpty();
  });

  test('dx-if element restores content when true', async ({ page }) => {
    await page.locator('#btn-open-modal').click();
    const el = page.locator('dx-if[signal="isModalOpen"]');
    await expect(el).not.toBeEmpty();

    // Close modal - it's inside the dx-if
    await page.locator('#btn-close-modal').click();
    await expect(el).toBeEmpty();
  });
});

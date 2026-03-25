import { expect, test } from '@playwright/test';

test.describe('Attributes — dx-show', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/attributes');
  });

  test('dx-show hides element when signal is false', async ({ page }) => {
    await page.locator('#btn-toggle-show').click();
    await expect(page.locator('[dx-show="isVisible"]')).toBeHidden();
  });

  test('dx-show shows element when signal becomes true', async ({ page }) => {
    await page.locator('#btn-toggle-show').click();
    await page.locator('#btn-toggle-show').click();
    await expect(page.locator('[dx-show="isVisible"]')).toBeVisible();
  });
});

test.describe('Attributes — dx-if', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/attributes');
  });

  test('dx-if removes element from DOM when false', async ({ page }) => {
    await page.locator('#btn-toggle-if').click();

    await expect(page.locator('[dx-if="isMounted"]')).toHaveCount(0);
  });

  test('dx-if re-adds element to DOM when true', async ({ page }) => {
    await page.locator('#btn-toggle-if').click();
    await page.locator('#btn-toggle-if').click();
    await expect(page.locator('[dx-if="isMounted"]')).toHaveCount(1);
  });
});

test.describe('Attributes — dx-for', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/attributes');
  });

  test('dx-for renders items reactively', async ({ page }) => {
    const input = page.locator('#input-item');

    await input.evaluate((el) => {
      (el as HTMLInputElement).value = 'Apple';
    });
    await page.locator('#btn-add-item').click();
    await page.waitForTimeout(100);

    await input.evaluate((el) => {
      (el as HTMLInputElement).value = 'Banana';
    });
    await page.locator('#btn-add-item').click();
    await page.waitForTimeout(100);

    const items = page.locator('ul[and-layout="vertical gap:xs"] > li');
    await expect(items).toHaveCount(2);
  });
});

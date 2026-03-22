import { test, expect } from "@playwright/test";

test.describe("Elements — dx-show", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo/elements");
  });

  test("dx-show element hides content when signal is false", async ({
    page,
  }) => {
    await page.locator("#btn-toggle-show").click();
    await expect(page.locator('dx-show[signal="isVisible"]')).toBeHidden();
  });
});

test.describe("Elements — dx-if", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo/elements");
  });

  test("dx-if element clears innerHTML when false", async ({ page }) => {
    await page.locator("#btn-toggle-if").click();
    const el = page.locator('dx-if[signal="isMounted"]');
    await expect(el).toBeEmpty();
  });

  test("dx-if element restores content when true", async ({ page }) => {
    await page.locator("#btn-toggle-if").click();
    await page.locator("#btn-toggle-if").click();
    const el = page.locator('dx-if[signal="isMounted"]');
    await expect(el).not.toBeEmpty();
  });
});

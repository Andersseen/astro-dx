import { test, expect } from "@playwright/test";

test.describe("Attributes — dx-show", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo/attributes");
  });

  test("dx-show hides element when signal is false", async ({ page }) => {
    // Assumes initial state is visible, toggle to hide
    await page.locator("#btn-toggle-show").click();
    await expect(page.locator('[dx-show="isVisible"]')).toBeHidden();
  });

  test("dx-show shows element when signal becomes true", async ({ page }) => {
    await page.locator("#btn-toggle-show").click(); // hide
    await page.locator("#btn-toggle-show").click(); // show again
    await expect(page.locator('[dx-show="isVisible"]')).toBeVisible();
  });
});

test.describe("Attributes — dx-if", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo/attributes");
  });

  test("dx-if removes element from DOM when false", async ({ page }) => {
    await page.locator("#btn-toggle-if").click();
    // Element should not exist in DOM at all — not just hidden
    await expect(page.locator('[dx-if="isMounted"]')).toHaveCount(0);
  });

  test("dx-if re-adds element to DOM when true", async ({ page }) => {
    await page.locator("#btn-toggle-if").click(); // remove
    await page.locator("#btn-toggle-if").click(); // re-add
    await expect(page.locator('[dx-if="isMounted"]')).toHaveCount(1);
  });
});

test.describe("Attributes — dx-for", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo/attributes");
  });

  test("dx-for renders items reactively", async ({ page }) => {
    await page.locator("#input-item").fill("Apple");
    await page.locator("#btn-add-item").click();
    await page.locator("#input-item").fill("Banana");
    await page.locator("#btn-add-item").click();

    const items = page.locator('[dx-for="listItems"] ~ *');
    await expect(items).toHaveCount(2);
  });
});

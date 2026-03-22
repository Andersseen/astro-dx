import { test, expect } from "@playwright/test";

test.describe("Services demo — cross-island state", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo/services");
  });

  test("cart total starts at 0", async ({ page }) => {
    await expect(page.locator("#cart-total")).toHaveText("0");
  });

  test("adding product updates total in separate island", async ({ page }) => {
    await page.locator(".product-btn").first().click();
    await expect(page.locator("#cart-total")).toHaveText("1");
  });

  test("adding multiple products updates total correctly", async ({ page }) => {
    const buttons = page.locator(".product-btn");
    await buttons.nth(0).click();
    await buttons.nth(1).click();
    await buttons.nth(2).click();
    await expect(page.locator("#cart-total")).toHaveText("3");
  });

  test("clearing cart resets total to 0", async ({ page }) => {
    await page.locator(".product-btn").first().click();
    await page.locator("#btn-clear").click();
    await expect(page.locator("#cart-total")).toHaveText("0");
  });
});

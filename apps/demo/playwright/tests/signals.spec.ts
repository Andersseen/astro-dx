import { test, expect } from "@playwright/test";

test.describe("Signals demo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo/signals");
  });

  test("counter starts at 0", async ({ page }) => {
    await expect(page.locator("#count-display")).toHaveText("0");
  });

  test("increment updates count", async ({ page }) => {
    await page.locator("#btn-inc").click();
    await expect(page.locator("#count-display")).toHaveText("1");
  });

  test("decrement updates count", async ({ page }) => {
    await page.locator("#btn-inc").click();
    await page.locator("#btn-dec").click();
    await expect(page.locator("#count-display")).toHaveText("0");
  });

  test("computed double updates reactively", async ({ page }) => {
    await page.locator("#btn-inc").click();
    await page.locator("#btn-inc").click();
    await expect(page.locator("#double-display")).toHaveText("4");
  });

  test("reset sets count back to 0", async ({ page }) => {
    await page.locator("#btn-inc").click();
    await page.locator("#btn-inc").click();
    await page.locator("#btn-reset").click();
    await expect(page.locator("#count-display")).toHaveText("0");
  });
});

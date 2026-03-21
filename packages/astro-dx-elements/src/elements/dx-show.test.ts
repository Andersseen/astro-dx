// packages/astro-dx-elements/src/elements/dx-show.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { signal } from "astro-dx";
import { register } from "../registry.ts";
import "../elements/dx-show.ts";

describe("dx-show", () => {
  beforeEach(() => {
    window.__dx__ = {};
    document.body.innerHTML = "";
  });

  it("hides element when signal is false", async () => {
    const isVisible = signal(false);
    register({ isVisible });

    document.body.innerHTML = `
      <dx-show signal="isVisible">
        <p>content</p>
      </dx-show>
    `;

    await new Promise((r) => requestAnimationFrame(r));
    const el = document.querySelector("dx-show")!;
    expect(el.hidden).toBe(true);
  });

  it("shows element when signal is true", async () => {
    const isVisible = signal(true);
    register({ isVisible });

    document.body.innerHTML = `
      <dx-show signal="isVisible">
        <p>content</p>
      </dx-show>
    `;

    await new Promise((r) => requestAnimationFrame(r));
    const el = document.querySelector("dx-show")!;
    expect(el.hidden).toBe(false);
  });

  it("reacts to signal changes", async () => {
    const isVisible = signal(true);
    register({ isVisible });

    document.body.innerHTML = `
      <dx-show signal="isVisible"><p>content</p></dx-show>
    `;

    await new Promise((r) => requestAnimationFrame(r));
    const el = document.querySelector("dx-show")!;

    isVisible.set(false);
    expect(el.hidden).toBe(true);

    isVisible.set(true);
    expect(el.hidden).toBe(false);
  });
});

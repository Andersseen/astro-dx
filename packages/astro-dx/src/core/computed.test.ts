// packages/astro-dx/src/core/computed.test.ts
import { describe, expect, it } from "vitest";
import { computed } from "./computed.ts";
import { signal } from "./signal.ts";

describe("computed", () => {
  it("recomputes when dependency signal changes", () => {
    const count = signal(1);
    const doubled = computed(() => count() * 2);

    expect(doubled()).toBe(2);
    count.set(3);
    expect(doubled()).toBe(6);
  });
});

// packages/astro-dx/src/core/signal.test.ts
import { describe, expect, it, vi } from "vitest";
import { signal } from "./signal.ts";

describe("signal", () => {
  it("reads initial value", () => {
    const count = signal(0);
    expect(count()).toBe(0);
  });

  it("updates with set()", () => {
    const count = signal(0);
    count.set(5);
    expect(count()).toBe(5);
  });

  it("updates with update()", () => {
    const count = signal(10);
    count.update((v) => v * 2);
    expect(count()).toBe(20);
  });

  it("notifies subscribers", () => {
    const count = signal(0);
    const spy = vi.fn();
    count.subscribe(spy);
    count.set(1);
    expect(spy.mock.calls.some(([value]) => value === 1)).toBe(true);
  });

  it("returns unsubscribe function", () => {
    const count = signal(0);
    const spy = vi.fn();
    const unsub = count.subscribe(spy);
    unsub();
    count.set(99);
    // spy may have been called once on subscribe (nanostores behavior) but not after unsub
    const callCount = spy.mock.calls.length;
    count.set(100);
    expect(spy.mock.calls.length).toBe(callCount); // no new calls
  });
});

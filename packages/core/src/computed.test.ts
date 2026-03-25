import { describe, expect, it, vi } from 'vitest';
import { computed } from './computed.ts';
import { effect } from './effect.ts';
import { signal } from './signal.ts';

describe('computed()', () => {
  it('returns initial value', () => {
    const count = signal(2);
    const doubled = computed(() => count() * 2);
    expect(doubled()).toBe(4);
  });

  it('recomputes when dependency changes', () => {
    const count = signal(1);
    const doubled = computed(() => count() * 2);

    expect(doubled()).toBe(2);
    count.set(3);
    expect(doubled()).toBe(6);
  });

  it('tracks multiple dependencies', () => {
    const a = signal(1);
    const b = signal(2);
    const sum = computed(() => a() + b());

    expect(sum()).toBe(3);
    a.set(10);
    expect(sum()).toBe(12);
    b.set(20);
    expect(sum()).toBe(30);
  });

  it('handles conditional dependencies', () => {
    const flag = signal(true);
    const a = signal(1);
    const b = signal(100);
    const result = computed(() => (flag() ? a() : b()));

    expect(result()).toBe(1);

    flag.set(false);
    expect(result()).toBe(100);

    a.set(999);
    expect(result()).toBe(100);

    b.set(200);
    expect(result()).toBe(200);
  });

  it('notifies subscribers on value change', () => {
    const count = signal(0);
    const doubled = computed(() => count() * 2);
    const spy = vi.fn();

    doubled.subscribe(spy);
    count.set(5);

    expect(spy).toHaveBeenCalledWith(10);
  });

  it('does NOT notify subscribers when value is equal', () => {
    const count = signal(5);
    const isPositive = computed(() => count() > 0);
    const spy = vi.fn();

    isPositive.subscribe(spy);
    const callsAfterSubscribe = spy.mock.calls.length;

    count.set(10);
    expect(spy.mock.calls.length).toBe(callsAfterSubscribe);

    count.set(-1);
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('can be used inside effect()', () => {
    const count = signal(1);
    const doubled = computed(() => count() * 2);
    const spy = vi.fn();

    effect(() => {
      spy(doubled());
    });

    count.set(5);
    expect(spy).toHaveBeenCalledWith(10);
  });

  it('computed of computed works', () => {
    const count = signal(2);
    const doubled = computed(() => count() * 2);
    const quadrupled = computed(() => doubled() * 2);

    expect(quadrupled()).toBe(8);
    count.set(3);
    expect(quadrupled()).toBe(12);
  });

  it('peek() reads value without creating dependency', () => {
    const count = signal(0);
    const doubled = computed(() => count() * 2);
    const other = signal(0);
    const spy = vi.fn();

    effect(() => {
      other();
      doubled.peek();
      spy();
    });

    count.set(5);
    expect(spy).toHaveBeenCalledTimes(1);

    other.set(1);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('subscribe returns unsubscribe function', () => {
    const count = signal(0);
    const doubled = computed(() => count() * 2);
    const spy = vi.fn();

    const unsub = doubled.subscribe(spy);
    const callsAfterSubscribe = spy.mock.calls.length;

    unsub();
    count.set(10);
    expect(spy.mock.calls.length).toBe(callsAfterSubscribe);
  });

  it("does not recompute if dependencies haven't changed", () => {
    const count = signal(0);
    const spy = vi.fn(() => count() * 2);
    const doubled = computed(spy);

    expect(doubled()).toBe(0);
    expect(spy).toHaveBeenCalledTimes(1);

    // Read again - should NOT recompute
    expect(doubled()).toBe(0);
    expect(spy).toHaveBeenCalledTimes(1);

    count.set(1);
    expect(doubled()).toBe(2);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('cleans up dependencies when it becomes unobserved', () => {
    const count = signal(0);
    const spy = vi.fn(() => count() * 2);
    const doubled = computed(spy);

    // Initial run (not observed)
    expect(doubled()).toBe(0);
    expect(spy).toHaveBeenCalledTimes(1);

    // Now observe it with an effect
    const stop = effect(() => {
      doubled();
    });
    expect(spy).toHaveBeenCalledTimes(1); // Already computed

    count.set(1);
    expect(spy).toHaveBeenCalledTimes(2);

    stop(); // Unobserved - should trigger onBecomeUnobserved

    count.set(2);
    // As unobserved, it shouldn't recompute until read again
    expect(spy).toHaveBeenCalledTimes(2);

    expect(doubled()).toBe(4);
    expect(spy).toHaveBeenCalledTimes(3);
  });
});

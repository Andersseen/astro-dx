import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computed } from './computed.ts';
import { signal } from './signal.ts';
import {
  clearSignalRegistry,
  createSignalKey,
  registerSignal,
  resolveSignal,
  unregisterSignal,
  waitForSignal,
} from './signalKey.ts';

beforeEach(() => {
  (globalThis as Record<string, unknown>).__dx_signals__ = new Map();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createSignalKey()', () => {
  it('creates a unique key with a name and symbol', () => {
    const key = createSignalKey<number>('count');
    expect(key.name).toBe('count');
    expect(typeof key.symbol).toBe('symbol');
  });

  it('creates same symbol for keys with same name (global registry)', () => {
    const key1 = createSignalKey<string>('name');
    const key2 = createSignalKey<string>('name');
    expect(key1.symbol).toBe(key2.symbol);
    expect(key1).not.toBe(key2);
  });

  it('creates different symbols for keys with different names', () => {
    const key1 = createSignalKey<string>('name1');
    const key2 = createSignalKey<string>('name2');
    expect(key1.symbol).not.toBe(key2.symbol);
  });
});

describe('registerSignal() / resolveSignal()', () => {
  it('registers and retrieves a signal', () => {
    const key = createSignalKey<number>('count');
    const sig = signal(0);
    registerSignal(key, sig);
    expect(resolveSignal(key)).toBe(sig);
  });

  it('returns undefined for unregistered key', () => {
    const key = createSignalKey<string>('missing');
    expect(resolveSignal(key)).toBeUndefined();
  });

  it('preserves type inference', () => {
    const key = createSignalKey<number>('typed');
    const sig = signal(42);
    registerSignal(key, sig);
    const resolved = resolveSignal(key);
    expect(resolved).toBeDefined();
    expect(resolved?.()).toBe(42);
  });

  it('works with computed signals', () => {
    const countKey = createSignalKey<number>('count');
    const doubleKey = createSignalKey<number>('double');
    const count = signal(5);
    const double = computed(() => count() * 2);

    registerSignal(countKey, count);
    registerSignal(doubleKey, double);

    expect(resolveSignal(countKey)?.()).toBe(5);
    expect(resolveSignal(doubleKey)?.()).toBe(10);
  });
});

describe('waitForSignal()', () => {
  it('calls callback immediately when signal is registered', () => {
    const key = createSignalKey<number>('ready');
    const sig = signal(100);
    registerSignal(key, sig);

    let received: number | undefined;
    waitForSignal(key, (signal) => {
      received = signal();
    });

    expect(received).toBe(100);
  });

  it('warns after maxRetries if signal is never registered', () => {
    const key = createSignalKey<number>('missing');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    waitForSignal(key, () => {}, 0);

    expect(warnSpy).toHaveBeenCalled();
  });
});

describe('unregisterSignal()', () => {
  it('removes signal from registry', () => {
    const key = createSignalKey<number>('temp');
    const sig = signal(1);
    registerSignal(key, sig);
    expect(resolveSignal(key)).toBe(sig);

    unregisterSignal(key);
    expect(resolveSignal(key)).toBeUndefined();
  });
});

describe('clearSignalRegistry()', () => {
  it('removes all registered signals', () => {
    const key1 = createSignalKey<number>('a');
    const key2 = createSignalKey<string>('b');
    registerSignal(key1, signal(1));
    registerSignal(key2, signal('test'));

    clearSignalRegistry();

    expect(resolveSignal(key1)).toBeUndefined();
    expect(resolveSignal(key2)).toBeUndefined();
  });
});

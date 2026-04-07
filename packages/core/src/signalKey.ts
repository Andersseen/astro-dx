import type { Computed } from './computed.ts';
import type { Signal } from './signal.ts';

const signalKeyBrand = Symbol.for('dx-signal-key-brand');

export type SignalKey<T> = {
  readonly [signalKeyBrand]: T;
  readonly name: string;
  readonly symbol: symbol;
};

export type ReadableSignal<T> = Signal<T> | Computed<T>;

type SignalRegistry = Map<symbol, ReadableSignal<unknown>>;

declare global {
  interface Window {
    __dx_signals__: SignalRegistry;
  }
  var __dx_signals__: SignalRegistry | undefined;
}

function getRegistry(): SignalRegistry {
  const target = typeof window !== 'undefined' ? window : globalThis;
  if (!target.__dx_signals__) {
    target.__dx_signals__ = new Map();
  }
  return target.__dx_signals__;
}

export function createSignalKey<T>(name: string): SignalKey<T> {
  return {
    [signalKeyBrand]: undefined as unknown as T,
    name,
    symbol: Symbol.for(`dx-signal:${name}`),
  };
}

export function registerSignal<T>(key: SignalKey<T>, signal: ReadableSignal<T>): void {
  const registry = getRegistry();
  registry.set(key.symbol, signal as ReadableSignal<unknown>);
}

export function resolveSignal<T>(key: SignalKey<T>): ReadableSignal<T> | undefined {
  const registry = getRegistry();
  return registry.get(key.symbol) as ReadableSignal<T> | undefined;
}

export function waitForSignal<T>(
  key: SignalKey<T>,
  callback: (signal: ReadableSignal<T>) => void,
  maxRetries = 10
): void {
  let count = 0;
  const check = () => {
    const signal = resolveSignal(key);
    if (signal) {
      callback(signal);
    } else if (count < maxRetries) {
      count++;
      requestAnimationFrame(check);
    } else {
      console.warn(`[dx] signal "${key.name}" not found after ${maxRetries} frames`);
    }
  };
  check();
}

export function unregisterSignal<T>(key: SignalKey<T>): void {
  const registry = getRegistry();
  registry.delete(key.symbol);
}

export function clearSignalRegistry(): void {
  const target = typeof window !== 'undefined' ? window : globalThis;
  target.__dx_signals__ = new Map();
}

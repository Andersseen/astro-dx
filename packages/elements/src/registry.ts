import type { Computed, Signal } from '@astro-dx/core';

export type AnyReadable = (Signal<unknown> | Computed<unknown>) & (() => unknown);

declare global {
  interface Window {
    __dx__: Record<string, AnyReadable>;
  }
}

export function register(signals: Record<string, AnyReadable>): void {
  window.__dx__ = { ...(window.__dx__ ?? {}), ...signals };
}

export function resolve(name: string): AnyReadable | undefined {
  return window.__dx__?.[name];
}

export function waitRegister(
  name: string,
  callback: (sig: AnyReadable) => void,
  maxRetries = 10
): void {
  let count = 0;
  const check = () => {
    const sig = resolve(name);
    if (sig) {
      callback(sig);
    } else if (count < maxRetries) {
      count++;
      requestAnimationFrame(check);
    } else {
      console.warn(`[dx] signal "${name}" not found after ${maxRetries} frames`);
    }
  };
  check();
}

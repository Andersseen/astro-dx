import type { Computed, Signal } from "@astro-dx/core";

export type AnyReadable = (Signal<unknown> | Computed<unknown>) &
  (() => unknown);

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

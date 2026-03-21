// packages/astro-dx-elements/src/registry.ts
import type { Signal } from "astro-dx";
import type { Computed } from "astro-dx";

export type AnySignal = Signal<unknown> | Computed<unknown>;

declare global {
  interface Window {
    __dx__: Record<string, AnySignal>;
  }
}

export function register(signals: Record<string, AnySignal>): void {
  window.__dx__ = { ...(window.__dx__ ?? {}), ...signals };
}

export function resolve(name: string): AnySignal | undefined {
  return window.__dx__?.[name];
}

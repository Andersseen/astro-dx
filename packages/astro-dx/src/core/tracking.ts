// packages/astro-dx/src/core/tracking.ts
import type { atom } from "nanostores";

export type AtomLike = ReturnType<typeof atom<unknown>>;

let activeCollector: Set<AtomLike> | undefined;

export function startTracking(collector: Set<AtomLike>): void {
  activeCollector = collector;
}

export function stopTracking(): void {
  activeCollector = undefined;
}

export function trackAtomRead(store: AtomLike): void {
  activeCollector?.add(store);
}

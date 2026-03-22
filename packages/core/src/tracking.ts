import type { atom } from "nanostores";

export type AtomLike = ReturnType<typeof atom<unknown>>;

let activeCollector: Set<AtomLike> | null = null;
let peekDepth = 0;

export function startTracking(collector: Set<AtomLike>): void {
  activeCollector = collector;
}

export function stopTracking(): void {
  activeCollector = null;
}

export function untracked<T>(fn: () => T): T {
  peekDepth++;
  try {
    return fn();
  } finally {
    peekDepth--;
  }
}

export function trackAtomRead(store: AtomLike): void {
  if (peekDepth > 0) return;
  activeCollector?.add(store);
}

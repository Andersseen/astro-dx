import { startTracking, stopTracking } from "./tracking.ts";
import type { AtomLike } from "./tracking.ts";

export function effect(fn: () => void): () => void {
  let subscriptions: Array<() => void> = [];
  let stopped = false;

  const run = (): void => {
    if (stopped) return;

    for (const unsub of subscriptions) {
      unsub();
    }
    subscriptions = [];

    const deps = new Set<AtomLike>();
    startTracking(deps);
    try {
      fn();
    } finally {
      stopTracking();
    }

    for (const dep of deps) {
      let skipInitial = true;
      const unsub = dep.subscribe(() => {
        if (skipInitial) {
          skipInitial = false;
          return;
        }
        run();
      });
      subscriptions.push(unsub);
    }
  };

  run();

  return () => {
    stopped = true;
    for (const unsub of subscriptions) {
      unsub();
    }
    subscriptions = [];
  };
}

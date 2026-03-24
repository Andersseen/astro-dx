import { setActiveObserver, type ReactiveNode } from "./tracking.ts";

const MAX_ITERATIONS = 100;

/**
 * An effect is an observer that automatically tracks its dependencies
 * and re-runs its function whenever a dependency changes.
 */
export function effect(fn: () => void): () => void {
  const dependencies = new Set<{ observers: Set<ReactiveNode> }>();
  let iterationCount = 0;
  let scheduled = false;

  const node: ReactiveNode = {
    version: 0,
    dependencies,
    notify: () => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        run();
      });
    },
  };

  const run = () => {
    if (iterationCount >= MAX_ITERATIONS) {
      throw new Error("[astro-dx] Infinite loop detected in effect");
    }

    iterationCount++;

    // Dynamic Dependency Tracking: cleanup old links
    for (const dep of dependencies) {
      dep.observers.delete(node);
    }
    dependencies.clear();

    const prevObserver = setActiveObserver(node);
    try {
      fn();
    } finally {
      setActiveObserver(prevObserver);
      // Reset counter asynchronously to catch only synchronous loops
      setTimeout(() => (iterationCount = 0), 0);
    }
  };

  run();

  return () => {
    for (const dep of dependencies) {
      dep.observers.delete(node);
    }
    dependencies.clear();
  };
}

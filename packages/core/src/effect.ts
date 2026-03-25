import {
  type ReactiveNode,
  removeObserver,
  setActiveObserver,
} from "./tracking.ts";

const MAX_ITERATIONS = 100;

export function effect(fn: () => void): () => void {
  const dependencies = new Set<ReactiveNode>();
  let iterationCount = 0;

  const node: ReactiveNode = {
    version: 0,
    observers: new Set(),
    dependencies,
    notify: () => {
      run();
    },
  };

  const cleanupDeps = () => {
    for (const dep of dependencies) {
      removeObserver(dep, node);
    }
    dependencies.clear();
  };

  const run = () => {
    if (iterationCount >= MAX_ITERATIONS) {
      throw new Error("[astro-dx] Infinite loop detected in effect");
    }

    iterationCount++;
    cleanupDeps();

    const prevObserver = setActiveObserver(node);
    try {
      fn();
    } finally {
      setActiveObserver(prevObserver);
      setTimeout(() => {
        iterationCount = 0;
      }, 0);
    }
  };

  run();

  return () => cleanupDeps();
}

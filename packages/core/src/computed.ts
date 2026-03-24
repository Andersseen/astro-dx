import { trackDependency, setActiveObserver, type ReactiveNode } from "./tracking.ts";

/**
 * A Computed signal derives its value from other signals.
 * It is lazy: it only recomputes when read and its dependencies have changed.
 */
export interface Computed<T> {
  (): T;
  peek(): T;
  subscribe(fn: (value: T) => void): () => void;
  /** @internal */
  version: number;
  /** @internal */
  observers: Set<ReactiveNode>;
}

export function computed<T>(fn: () => T): Computed<T> {
  let value: T;
  let dirty = true;
  let version = 0;
  const observers = new Set<ReactiveNode>();
  const dependencies = new Set<{ observers: Set<ReactiveNode> }>();

  const node: ReactiveNode = {
    version: 0,
    dependencies,
    notify: () => {
      if (!dirty) {
        dirty = true;
        version++;
        // Push notification to observers
        for (const observer of [...observers]) {
          observer.notify();
        }
      }
    },
  };

  const recompute = () => {
    // Dynamic Dependency Tracking: cleanup old links
    for (const dep of dependencies) {
      dep.observers.delete(node);
    }
    dependencies.clear();

    const prevObserver = setActiveObserver(node);
    try {
      const newValue = fn();
      if (!Object.is(value, newValue)) {
        value = newValue;
      }
      dirty = false;
    } finally {
      setActiveObserver(prevObserver);
    }
  };

  const read = (): T => {
    // Memory Safety: If this is the first time we are being tracked,
    // we establish our own dependency links. 
    // If we lose all observers, we could potentially clear dependencies,
    // but the simplest way is to clear them if we are NOT being observed
    // and a recompute happens.
    
    trackDependency({ observers }); // Register this computed as a dependency of the active observer
    
    if (dirty) {
      recompute();
    }
    return value;
  };

  read.peek = () => {
    if (dirty) recompute();
    return value;
  };

  read.subscribe = (fn: (value: T) => void) => {
    const observer: ReactiveNode = {
      version: -1,
      dependencies: new Set(),
      notify: () => fn(read()),
    };
    observers.add(observer);
    fn(read());
    return () => {
      observers.delete(observer);
      // Memory Safety: If no one is watching us, stop watching our dependencies
      if (observers.size === 0) {
        for (const dep of dependencies) {
          dep.observers.delete(node);
        }
        dependencies.clear();
        dirty = true; // Mark as dirty so it re-subscribes on next read
      }
    };
  };

  // Internal access for versioning
  Object.defineProperty(read, "version", { get: () => version });
  Object.defineProperty(read, "observers", { value: observers });

  return read as unknown as Computed<T>;
}

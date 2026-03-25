import {
  trackDependency,
  setActiveObserver,
  removeObserver,
  untracked, // Importamos untracked
  type ReactiveNode,
} from "./tracking.ts";

export interface Computed<T> {
  (): T;
  peek(): T;
  subscribe(fn: (value: T) => void): () => void;
  version: number;
  observers: Set<ReactiveNode>;
}

export function computed<T>(fn: () => T): Computed<T> {
  let value: T;
  let dirty = true;
  let version = 0;

  const dependencyVersions = new Map<ReactiveNode, number>();
  const observers = new Set<ReactiveNode>();
  const dependencies = new Set<ReactiveNode>();

  const node: ReactiveNode = {
    version: 0,
    observers,
    dependencies,
    notify: () => {
      if (!dirty) {
        dirty = true;
        version++;
        node.version = version;
        for (const observer of [...observers]) {
          observer.notify();
        }
      }
    },
    onBecomeUnobserved: () => {
      for (const dep of dependencies) {
        removeObserver(dep, node);
      }
      dependencies.clear();
      dependencyVersions.clear();
      dirty = true;
    },
  };

  const shouldRecompute = () => {
    if (dirty) {
      for (const [dep, lastVersion] of dependencyVersions) {
        if (dep.version !== lastVersion) return true;
      }
      if (dependencyVersions.size > 0) {
        dirty = false;
        return false;
      }
    }
    return dirty;
  };

  const recompute = () => {
    for (const dep of dependencies) removeObserver(dep, node);
    dependencies.clear();
    dependencyVersions.clear();

    const prevObserver = setActiveObserver(node);
    try {
      const newValue = fn();
      if (!Object.is(value, newValue)) {
        value = newValue;
      }
      for (const dep of dependencies) {
        dependencyVersions.set(dep, dep.version);
      }
      dirty = false;
    } finally {
      setActiveObserver(prevObserver);
    }
  };

  const read = (): T => {
    trackDependency(node);
    if (shouldRecompute()) recompute();
    return value;
  };

  read.peek = () => {
    if (shouldRecompute()) recompute();
    return value;
  };

  read.subscribe = (fn: (value: T) => void) => {
    let lastValue: T;
    const observer: ReactiveNode = {
      version: -1,
      observers: new Set(),
      dependencies: new Set(),
      notify: () => {
        const newValue = read();
        if (!Object.is(lastValue, newValue)) {
          lastValue = newValue;
          untracked(() => fn(newValue)); // Seguro
        }
      },
    };
    observers.add(observer);
    lastValue = read();
    untracked(() => fn(lastValue)); // Seguro

    return () => removeObserver(node, observer);
  };

  Object.defineProperty(read, "version", { get: () => version });
  Object.defineProperty(read, "observers", { value: observers });

  return read as unknown as Computed<T>;
}

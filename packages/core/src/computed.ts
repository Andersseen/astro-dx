import {
  type ReactiveNode,
  removeObserver,
  setActiveObserver,
  trackDependency,
  untracked,
} from './tracking.ts';

/**
 * A computed value that automatically recalculates when its dependencies change.
 * Computed values are lazy - they only recompute when read and only if dependencies have changed.
 * @typeParam T - The type of the computed value
 */
export interface Computed<T> {
  /** Read the computed value (tracks dependencies when called in reactive context) */
  (): T;
  /** Read the computed value without tracking dependencies */
  peek(): T;
  /** Subscribe to changes in the computed value */
  subscribe(fn: (value: T) => void): () => void;
  /** Internal version counter for change detection */
  version: number;
  /** Set of observers that depend on this computed value */
  observers: Set<ReactiveNode>;
}

/**
 * Creates a computed value that automatically recalculates when its reactive dependencies change.
 * Computed values are lazy - they only recompute when read and only if dependencies have changed.
 *
 * @example
 * ```ts
 * const count = signal(0);
 * const double = computed(() => count() * 2);
 * console.log(double()); // 0
 * count.set(5);
 * console.log(double()); // 10 (recomputed)
 * ```
 *
 * @param fn - A function that computes the value based on reactive dependencies
 * @returns A Computed instance that can be read and subscribed to
 */
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
          untracked(() => fn(newValue));
        }
      },
    };
    observers.add(observer);
    lastValue = read();
    untracked(() => fn(lastValue));

    return () => removeObserver(node, observer);
  };

  Object.defineProperty(read, 'version', { get: () => version });
  Object.defineProperty(read, 'observers', { value: observers });

  return read as unknown as Computed<T>;
}

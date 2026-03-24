/**
 * Core tracking context for the Push-Pull reactivity engine.
 * Manages the global state of active observers (effects/computeds).
 */

export interface ReactiveNode {
  /** Notifies the node that one of its dependencies has changed. */
  notify(): void;
  /** Set of dependencies this node is currently observing. */
  dependencies: Set<{ observers: Set<ReactiveNode> }>;
  /** Versioning to detect actual changes (Diamond Problem solution). */
  version: number;
}

let activeObserver: ReactiveNode | null = null;
let trackingDisabled = 0;

/**
 * Returns the currently active observer, if any.
 */
export function getActiveObserver(): ReactiveNode | null {
  return trackingDisabled > 0 ? null : activeObserver;
}

/**
 * Establishes a bidirectional link between a dependency and the active observer.
 */
export function trackDependency(dep: { observers: Set<ReactiveNode> }): void {
  const observer = getActiveObserver();
  if (observer) {
    dep.observers.add(observer);
    observer.dependencies.add(dep);
  }
}

/**
 * Sets the active observer and returns the previous one.
 * Used for nested tracking (Effects calling Computeds).
 */
export function setActiveObserver(node: ReactiveNode | null): ReactiveNode | null {
  const prev = activeObserver;
  activeObserver = node;
  return prev;
}

/**
 * Executes a function without tracking any dependencies.
 */
export function untracked<T>(fn: () => T): T {
  trackingDisabled++;
  try {
    return fn();
  } finally {
    trackingDisabled--;
  }
}

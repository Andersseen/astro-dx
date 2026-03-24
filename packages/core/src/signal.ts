import { trackDependency, type ReactiveNode } from "./tracking.ts";

/**
 * A Signal is a primitive reactive cell that holds a value.
 * It notifies its observers whenever the value changes.
 */
export interface Signal<T> {
  /** Reads the value and registers a dependency. */
  (): T;
  /** Reads the value without registering a dependency. */
  peek(): T;
  /** Sets a new value. If the value changed, notifies observers. */
  set(value: T): void;
  /** Updates the value based on the previous state. */
  update(fn: (prev: T) => T): void;
  /** Manually subscribes to changes. */
  subscribe(fn: (value: T) => void): () => void;
  /** @internal Version counter for change detection. */
  version: number;
  /** @internal Set of observers currently watching this signal. */
  observers: Set<ReactiveNode>;
}

export function signal<T>(initial: T, equal: (a: T, b: T) => boolean = Object.is): Signal<T> {
  let value = initial;
  const observers = new Set<ReactiveNode>();

  const node: Signal<T> = (() => {
    trackDependency(node);
    return value;
  }) as Signal<T>;

  node.version = 0;
  node.observers = observers;

  node.peek = () => value;

  node.set = (newValue: T) => {
    if (!equal(value, newValue)) {
      value = newValue;
      node.version++;
      // Notify all observers (Push phase)
      for (const observer of [...observers]) {
        observer.notify();
      }
    }
  };

  node.update = (fn: (prev: T) => T) => node.set(fn(value));

  node.subscribe = (fn: (value: T) => void) => {
    const observer: ReactiveNode = {
      version: -1,
      dependencies: new Set(),
      notify: () => fn(value),
    };
    observers.add(observer);
    fn(value);
    return () => observers.delete(observer);
  };

  return node;
}

import { logSignal, warn } from './debug.ts';
import { type ReactiveNode, removeObserver, trackDependency, untracked } from './tracking.ts';

let signalCounter = 0;

export interface Signal<T> extends ReactiveNode {
  (): T;
  peek(): T;
  set(value: T): void;
  update(fn: (prev: T) => T): void;
  subscribe(fn: (value: T) => void): () => void;
  _debugName?: string;
}

export function signal<T>(
  initial: T,
  equal: (a: T, b: T) => boolean = Object.is,
  debugName?: string
): Signal<T> {
  let value = initial;
  const observers = new Set<ReactiveNode>();
  const name = debugName || `signal-${++signalCounter}`;

  const node = (() => {
    trackDependency(node);
    return value;
  }) as Signal<T>;

  node.version = 0;
  node.observers = observers;
  node.dependencies = new Set();
  node.notify = () => {};
  node._debugName = name;
  node.peek = () => value;

  node.set = (newValue: T) => {
    if (!equal(value, newValue)) {
      const oldValue = value;
      value = newValue;
      node.version++;

      logSignal(name, oldValue, newValue);

      for (const observer of [...observers]) {
        observer.notify();
      }
    } else {
      warn(`Signal "${name}" updated with the same value`, { value });
    }
  };

  node.update = (fn: (prev: T) => T) => node.set(fn(value));

  node.subscribe = (fn: (value: T) => void) => {
    let lastValue = value;

    const observer: ReactiveNode = {
      version: -1,
      observers: new Set(),
      dependencies: new Set(),
      notify: () => {
        const newValue = node.peek();
        if (!equal(lastValue, newValue)) {
          lastValue = newValue;
          untracked(() => fn(newValue));
        }
      },
    };

    observers.add(observer);
    untracked(() => fn(value));

    return () => removeObserver(node, observer);
  };

  return node;
}

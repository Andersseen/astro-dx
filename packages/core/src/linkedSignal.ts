import { computed } from './computed.ts';
import { type ReactiveNode, removeObserver, trackDependency, untracked } from './tracking.ts';

export interface LinkedSignal<T> {
  (): T;
  peek(): T;
  set(value: T): void;
  update(fn: (prev: T) => T): void;
  subscribe(fn: (value: T) => void): () => void;
  version: number;
  observers: Set<ReactiveNode>;
}

export interface LinkedSignalOptions<S, T> {
  source: () => S;
  computation: (sourceValue: S, previousValue?: T) => T;
  equal?: (a: T, b: T) => boolean;
}

export function linkedSignal<S, T>(
  options: LinkedSignalOptions<S, T> | (() => T)
): LinkedSignal<T> {
  let sourceFn: () => S;
  let computation: (s: S, prev?: T) => T;
  let equal: (a: T, b: T) => boolean = Object.is;

  if (typeof options === 'function') {
    sourceFn = options as unknown as () => S;
    computation = (s: S) => s as unknown as T;
  } else {
    sourceFn = options.source;
    computation = options.computation;
    if (options.equal) equal = options.equal;
  }

  const sourceComp = computed(sourceFn);

  let state: T;
  let lastSourceVersion = -1;
  let version = 0;

  const observers = new Set<ReactiveNode>();

  const node: ReactiveNode = {
    version: 0,
    observers,
    dependencies: new Set(),
    notify: () => {
      version++;
      node.version = version;
      for (const observer of [...observers]) observer.notify();
    },
  };

  const sync = () => {
    const currentSource = sourceComp();

    const sv = (sourceComp as { version?: number }).version ?? 0;

    if (sv !== lastSourceVersion) {
      state = computation(currentSource, state);
      lastSourceVersion = sv;
      version++;
      node.version = version;
    }
  };

  const read = (): T => {
    sync();
    trackDependency(node);
    return state;
  };

  read.peek = () => {
    sync();
    return state;
  };

  read.set = (v: T) => {
    if (!equal(state, v)) {
      state = v;
      version++;
      node.version = version;
      for (const observer of [...observers]) observer.notify();
    }
  };

  read.update = (fn: (prev: T) => T) => read.set(fn(read.peek()));

  read.subscribe = (fn: (value: T) => void) => {
    let lastValue: T;
    const observer: ReactiveNode = {
      version: -1,
      observers: new Set(),
      dependencies: new Set(),
      notify: () => {
        const newValue = read();
        if (!equal(lastValue, newValue)) {
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

  return read as unknown as LinkedSignal<T>;
}

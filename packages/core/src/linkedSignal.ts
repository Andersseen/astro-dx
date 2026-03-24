import { signal, type Signal } from "./signal.ts";
import { effect } from "./effect.ts";

interface LinkedSignalOptions<S, T> {
  source: () => S;
  computation: (source: S, prev?: T) => T;
  equal?: (a: T, b: T) => boolean;
}

/**
 * A LinkedSignal is a writable signal that resets or recomputes its internal state
 * whenever its source dependency changes.
 */
export function linkedSignal<S, T>(
  options: LinkedSignalOptions<S, T> | (() => T),
): Signal<T> {
  let sourceFn: () => any;
  let computation: (s: any, prev?: T) => T;
  let equal: ((a: T, b: T) => boolean) | undefined;

  if (typeof options === "function") {
    sourceFn = options;
    computation = (s) => s;
  } else {
    sourceFn = options.source;
    computation = options.computation;
    equal = options.equal;
  }

  // Initial value
  const s = signal<T>(computation(sourceFn()), equal);

  // When source changes, update the signal
  effect(() => {
    const val = sourceFn();
    s.set(computation(val, s.peek()));
  });

  return s;
}

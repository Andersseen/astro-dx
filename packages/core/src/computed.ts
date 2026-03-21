import { computed as nanoComputed } from 'nanostores';
import type { Signal } from './signal.ts';
import { startTracking, stopTracking } from './tracking.ts';

export type Computed<T> = {
  (): T;
  subscribe(fn: (value: T) => void): () => void;
};

export function trackRead<T>(sig: Signal<T>): T {
  return sig();
}

export function computed<T>(fn: () => T): Computed<T> {
  const trackedAtoms = new Set<Signal<unknown>['_atom']>();
  startTracking(trackedAtoms);
  fn();
  stopTracking();
  const deps = [...trackedAtoms];

  const store = nanoComputed(deps as Parameters<typeof nanoComputed>[0], () => fn());

  const read = () => store.get();
  read.subscribe = (cb: (value: T) => void) => store.subscribe(cb);

  return read as Computed<T>;
}

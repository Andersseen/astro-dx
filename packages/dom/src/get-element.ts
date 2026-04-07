import { ElementRef } from './element-ref.ts';

interface TrackedRef {
  ref: WeakRef<ElementRef<Element>>;
  element: WeakRef<Element>;
}

const _registry: TrackedRef[] = [];

const cleanupRegistry = new FinalizationRegistry<string>((_selector) => {
  cleanupDestroyedRefs();
});

function cleanupDestroyedRefs(): void {
  for (let i = _registry.length - 1; i >= 0; i--) {
    const tracked = _registry[i];
    const ref = tracked.ref.deref();
    const element = tracked.element.deref();

    if (!ref || !element || !document.contains(element)) {
      _registry.splice(i, 1);
    }
  }
}

function trackElement<T extends Element>(el: T, selector: string): ElementRef<T> {
  const ref = new ElementRef<T>(el);
  const trackedRef: TrackedRef = {
    ref: new WeakRef(ref as ElementRef<Element>),
    element: new WeakRef(el),
  };
  _registry.push(trackedRef);
  cleanupRegistry.register(ref, selector);
  return ref;
}

export function getElement<T extends Element>(selector: string): ElementRef<T> | null {
  const el = document.querySelector<T>(selector);
  if (!el) {
    return null;
  }
  return trackElement(el, selector);
}

export function getElements<T extends Element>(selector: string): ElementRef<T>[] {
  const els = Array.from(document.querySelectorAll<T>(selector));
  return els.map((el) => trackElement(el, selector));
}

export function destroyAll(): void {
  for (const tracked of _registry) {
    const ref = tracked.ref.deref();
    if (ref) {
      ref.destroy();
    }
  }
  _registry.length = 0;
}

// Exportar para testing y debugging avanzado
export { _registry as __registry, cleanupDestroyedRefs as __cleanupDestroyedRefs };

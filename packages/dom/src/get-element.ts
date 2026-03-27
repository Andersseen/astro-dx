import { ElementRef } from './element-ref.ts';

interface TrackedRef {
  ref: WeakRef<ElementRef<Element>>;
  element: WeakRef<Element>;
}

const _registry: TrackedRef[] = [];

// FinalizationRegistry para limpiar automáticamente referencias destruidas
const cleanupRegistry = new FinalizationRegistry<string>((_selector) => {
  // Cuando un ElementRef es garbage collected, limpiamos el registry
  cleanupDestroyedRefs();
});

function cleanupDestroyedRefs(): void {
  for (let i = _registry.length - 1; i >= 0; i--) {
    const tracked = _registry[i];
    const ref = tracked.ref.deref();
    const element = tracked.element.deref();

    // Limpiar si el ref fue destruido o el elemento ya no está en el DOM
    if (!ref || !element || !document.contains(element)) {
      _registry.splice(i, 1);
    }
  }
}

export class ElementNotFoundError extends Error {
  constructor(selector: string) {
    super(
      `[astro-dx] Element with selector "${selector}" not found in the DOM. Ensure the element exists before calling getElement() or use getElementOrNull() for optional elements.`
    );
    this.name = 'ElementNotFoundError';
  }
}

export function getElementOrNull<T extends Element>(selector: string): ElementRef<T> | null {
  const el = document.querySelector<T>(selector);
  if (!el) {
    return null;
  }

  const ref = new ElementRef<T>(el);
  const trackedRef: TrackedRef = {
    ref: new WeakRef(ref as ElementRef<Element>),
    element: new WeakRef(el),
  };
  _registry.push(trackedRef);

  // Registrar para limpieza automática cuando el ref sea GC'd
  cleanupRegistry.register(ref, selector);

  return ref;
}

export function getElement<T extends Element>(selector: string): ElementRef<T> {
  const ref = getElementOrNull<T>(selector);
  if (!ref) {
    throw new ElementNotFoundError(selector);
  }
  return ref;
}

export function getElements<T extends Element>(selector: string): ElementRef<T>[] {
  const els = Array.from(document.querySelectorAll<T>(selector));
  const refs = els.map((el) => {
    const ref = new ElementRef<T>(el);
    const trackedRef: TrackedRef = {
      ref: new WeakRef(ref as ElementRef<Element>),
      element: new WeakRef(el),
    };
    _registry.push(trackedRef);
    cleanupRegistry.register(ref, selector);
    return ref;
  });
  return refs;
}

export function destroyAll(): void {
  // Limpiar solo los refs que aún existen
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

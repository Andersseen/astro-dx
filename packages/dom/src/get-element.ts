import { ElementRef } from './element-ref.ts';

const _registry: ElementRef<Element>[] = [];

export function getElement<T extends Element>(selector: string): ElementRef<T> {
  const el = document.querySelector<T>(selector);
  if (!el) {
    console.warn(`[getElement] element "${selector}" not found`);
    return new ElementRef<T>(document.createElement('div') as unknown as T);
  }
  const ref = new ElementRef<T>(el);
  _registry.push(ref as ElementRef<Element>);
  return ref;
}

export function getElements<T extends Element>(selector: string): ElementRef<T>[] {
  const els = Array.from(document.querySelectorAll<T>(selector));
  const refs = els.map((el) => {
    const ref = new ElementRef<T>(el);
    _registry.push(ref as ElementRef<Element>);
    return ref;
  });
  return refs;
}

export function destroyAll(): void {
  for (const ref of _registry) {
    ref.destroy();
  }
  _registry.length = 0;
}

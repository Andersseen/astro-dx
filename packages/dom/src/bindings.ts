import type { Computed, Signal } from '@astro-dx/core';

type Readable<T> = (Signal<T> | Computed<T>) & (() => T);

type Target = string | Element;

function resolve(target: Target): Element | null {
  return typeof target === 'string' ? document.querySelector(target) : target;
}

export function text(target: Target, source: Readable<unknown>): () => void {
  const el = resolve(target);
  if (!el) return () => {};
  return source.subscribe((v) => {
    el.textContent = String(v ?? '');
  });
}

export function attr(target: Target, attrName: string, source: Readable<unknown>): () => void {
  const el = resolve(target);
  if (!el) return () => {};
  return source.subscribe((v) => {
    if (v === false || v === null || v === undefined) {
      el.removeAttribute(attrName);
    } else if (v === true) {
      el.setAttribute(attrName, '');
    } else {
      el.setAttribute(attrName, String(v));
    }
  });
}

export function cls(
  target: Target,
  className: string,
  source: Readable<boolean> | (() => boolean)
): () => void {
  const el = resolve(target);
  if (!el) return () => {};

  if ('subscribe' in source) {
    return (source as Readable<boolean>).subscribe((v) => {
      el.classList.toggle(className, v);
    });
  }

  el.classList.toggle(className, source());
  return () => {};
}

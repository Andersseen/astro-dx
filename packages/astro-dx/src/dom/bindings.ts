// packages/astro-dx/src/dom/bindings.ts
import type { Signal } from '../core/signal.ts';

type Readable<T> = Pick<Signal<T>, 'subscribe'> & (() => T);

function resolve(target: string | Element): Element | null {
  return typeof target === 'string' ? document.querySelector(target) : target;
}

/** Reactive textContent binding. Equivalent to Angular's [textContent]="x" */
export function text(target: string | Element, source: Readable<unknown>): () => void {
  const el = resolve(target);
  if (!el) return () => {};
  return source.subscribe((v) => {
    el.textContent = String(v ?? '');
  });
}

/** Reactive attribute binding. Equivalent to Angular's [attr]="x" */
export function attr(
  target: string | Element,
  attrName: string,
  source: Readable<unknown>
): () => void {
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

/** Reactive class toggle. Equivalent to Angular's [class.active]="x" */
export function cls(
  target: string | Element,
  className: string,
  source: Readable<boolean> | (() => boolean)
): () => void {
  const el = resolve(target);
  if (!el) return () => {};

  // Accept both a signal and a plain getter function
  if ('subscribe' in source) {
    return (source as Readable<boolean>).subscribe((v) => el.classList.toggle(className, v));
  }

  // Plain function - no reactive tracking, call once
  el.classList.toggle(className, source());
  return () => {};
}

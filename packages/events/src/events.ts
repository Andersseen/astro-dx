export type Target = string | Element | Document | Window;

const VALUE_EVENTS = new Set(['input', 'change', 'keyup', 'keydown', 'keypress']);

function resolve(target: Target): Element | Document | Window | null {
  return typeof target === 'string' ? document.querySelector(target) : target;
}

function extractValue(event: Event): string {
  const target = event.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return target.value;
  }
  return '';
}

export function on(
  target: Target,
  event: string,
  fn: (valueOrEvent: string | Event) => void,
  options?: AddEventListenerOptions
): () => void {
  const handler = (e: Event) => {
    if (typeof target === 'string') {
      const el = (e.target as Element).closest?.(target);
      if (el) {
        const val = VALUE_EVENTS.has(event) ? extractValue(e) : e;
        fn(val);
      }
    } else if (target === e.currentTarget || target === document || target === window) {
      const val = VALUE_EVENTS.has(event) ? extractValue(e) : e;
      fn(val);
    }
  };

  const actualTarget = typeof target === 'string' ? document : target;
  if (!actualTarget) return () => {};

  actualTarget.addEventListener(event, handler, options);
  return () => actualTarget.removeEventListener(event, handler, options);
}

export function onClick(
  target: Target,
  fn: (event: MouseEvent) => void,
  options?: AddEventListenerOptions
): () => void {
  return on(target, 'click', (e) => fn(e as MouseEvent), options);
}

export function onInput(target: Target, fn: (value: string) => void): () => void {
  return on(target, 'input', (v) => fn(v as string));
}

export function onChange(target: Target, fn: (value: string) => void): () => void {
  return on(target, 'change', (v) => fn(v as string));
}

export function onSubmit(target: Target, fn: (event: SubmitEvent) => void): () => void {
  return on(target, 'submit', (e) => {
    if (e instanceof Event) e.preventDefault();
    fn(e as SubmitEvent);
  });
}

export function onHover(
  target: Target,
  handlers: { enter?: () => void; leave?: () => void }
): () => void {
  const cleanups: Array<() => void> = [];
  if (handlers.enter) cleanups.push(on(target, 'mouseenter', handlers.enter));
  if (handlers.leave) cleanups.push(on(target, 'mouseleave', handlers.leave));
  return () => cleanups.forEach((c) => c());
}

export function onKey(
  target: Target,
  key: KeyboardEvent['key'],
  fn: (event: KeyboardEvent) => void
): () => void {
  return on(target, 'keydown', (e) => {
    if (e instanceof KeyboardEvent && e.key === key) {
      fn(e);
    }
  });
}

export function onFocus(
  target: Target,
  handlers: { focus?: () => void; blur?: () => void }
): () => void {
  const cleanups: Array<() => void> = [];
  // focus/blur don't bubble, but focusin/focusout do
  if (handlers.focus) cleanups.push(on(target, 'focusin', handlers.focus));
  if (handlers.blur) cleanups.push(on(target, 'focusout', handlers.blur));
  return () => cleanups.forEach((c) => c());
}

export function onResize(target: Target, fn: (entry: ResizeObserverEntry) => void): () => void {
  const el = resolve(target);
  if (!(el instanceof Element)) {
    return () => {};
  }

  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (entry) {
      fn(entry);
    }
  });

  observer.observe(el);
  return () => observer.disconnect();
}

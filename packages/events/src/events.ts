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

function onPaired(
  target: Target,
  eventA: string,
  handlerA: (() => void) | undefined,
  eventB: string,
  handlerB: (() => void) | undefined
): () => void {
  const el = resolve(target);
  if (!el) return () => {};

  const cleanups: Array<() => void> = [];

  if (handlerA) {
    el.addEventListener(eventA, handlerA);
    cleanups.push(() => el.removeEventListener(eventA, handlerA));
  }

  if (handlerB) {
    el.addEventListener(eventB, handlerB);
    cleanups.push(() => el.removeEventListener(eventB, handlerB));
  }

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

export function on(
  target: Target,
  event: string,
  fn: (valueOrEvent: string | Event) => void,
  options?: AddEventListenerOptions
): () => void {
  const el = resolve(target);
  if (!el) return () => {};

  const handler = VALUE_EVENTS.has(event) ? (e: Event) => fn(extractValue(e)) : (e: Event) => fn(e);

  el.addEventListener(event, handler, options);
  return () => el.removeEventListener(event, handler, options);
}

export function onClick(
  target: Target,
  fn: (event: MouseEvent) => void,
  options?: AddEventListenerOptions
): () => void {
  const el = resolve(target);
  if (!el) return () => {};

  const handler = (event: Event) => fn(event as MouseEvent);
  el.addEventListener('click', handler, options);
  return () => el.removeEventListener('click', handler, options);
}

export function onInput(target: Target, fn: (value: string) => void): () => void {
  const el = resolve(target);
  if (!el) return () => {};

  const handler = (event: Event) => fn(extractValue(event));
  el.addEventListener('input', handler);
  return () => el.removeEventListener('input', handler);
}

export function onChange(target: Target, fn: (value: string) => void): () => void {
  const el = resolve(target);
  if (!el) return () => {};

  const handler = (event: Event) => fn(extractValue(event));
  el.addEventListener('change', handler);
  return () => el.removeEventListener('change', handler);
}

export function onSubmit(target: Target, fn: (event: SubmitEvent) => void): () => void {
  const el = resolve(target);
  if (!el) return () => {};

  const handler = (event: Event) => {
    event.preventDefault();
    fn(event as SubmitEvent);
  };

  el.addEventListener('submit', handler);
  return () => el.removeEventListener('submit', handler);
}

export function onHover(
  target: Target,
  handlers: { enter?: () => void; leave?: () => void }
): () => void {
  return onPaired(target, 'mouseenter', handlers.enter, 'mouseleave', handlers.leave);
}

export function onKey(
  target: Target,
  key: KeyboardEvent['key'],
  fn: (event: KeyboardEvent) => void
): () => void {
  const el = resolve(target);
  if (!el) return () => {};

  const handler = (event: Event) => {
    if (event instanceof KeyboardEvent && event.key === key) {
      fn(event);
    }
  };

  el.addEventListener('keydown', handler);
  return () => el.removeEventListener('keydown', handler);
}

export function onFocus(
  target: Target,
  handlers: { focus?: () => void; blur?: () => void }
): () => void {
  return onPaired(target, 'focus', handlers.focus, 'blur', handlers.blur);
}

export function onResize(target: Target, fn: (entry: ResizeObserverEntry) => void): () => void {
  const el = resolve(target);
  if (!(el instanceof Element)) {
    console.warn('[onResize] target must resolve to an Element');
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

export type Target = string | Element | Document | Window;

const VALUE_EVENTS = new Set(['input', 'change']);

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
  fn: (valueOrEvent: any) => void,
  options?: AddEventListenerOptions
): () => void {
  const handler = (e: Event) => {
    if (typeof target === 'string') {
      const el = (e.target as Element).closest?.(target);
      if (el) {
        const val = VALUE_EVENTS.has(event) ? extractValue(e) : e;
        fn(val);
      }
    } else {
      const val = VALUE_EVENTS.has(event) ? extractValue(e) : e;
      fn(val);
    }
  };

  const actualTarget = typeof target === 'string' ? document : target;
  if (!actualTarget) return () => {};

  actualTarget.addEventListener(event, handler, { ...options, capture: typeof target === 'string' });
  return () =>
    actualTarget.removeEventListener(event, handler, { ...options, capture: typeof target === 'string' });
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
    if (e instanceof Event) {
       e.preventDefault();
    }
    fn(e as SubmitEvent);
  });
}

export function onHover(
  target: Target,
  handlers: { enter?: () => void; leave?: () => void }
): () => void {
  const cleanups: Array<() => void> = [];
  
  if (typeof target === 'string') {
    if (handlers.enter) {
      cleanups.push(on(target, 'mouseover', (e) => {
        const event = e as MouseEvent;
        const to = event.target as Element;
        const from = event.relatedTarget as Element;
        if (to?.closest?.(target) && (!from || !from.closest?.(target))) {
          handlers.enter?.();
        }
      }));
    }
    if (handlers.leave) {
      cleanups.push(on(target, 'mouseout', (e) => {
        const event = e as MouseEvent;
        const from = event.target as Element;
        const to = event.relatedTarget as Element;
        if (from?.closest?.(target) && (!to || !to.closest?.(target))) {
          handlers.leave?.();
        }
      }));
    }
  } else {
    if (handlers.enter) cleanups.push(on(target, 'mouseenter', handlers.enter));
    if (handlers.leave) cleanups.push(on(target, 'mouseleave', handlers.leave));
  }
  
  return () => cleanups.forEach((c) => c());
}

export function onKey(
  target: Target,
  key: KeyboardEvent['key'],
  fn: (event: KeyboardEvent) => void
): () => void {
  return on(target, 'keydown', (e) => {
    if (e && (e as KeyboardEvent).key === key) {
      fn(e as KeyboardEvent);
    }
  });
}

export function onFocus(
  target: Target,
  handlers: { focus?: () => void; blur?: () => void }
): () => void {
  const cleanups: Array<() => void> = [];
  if (handlers.focus) cleanups.push(on(target, 'focus', handlers.focus));
  if (handlers.blur) cleanups.push(on(target, 'blur', handlers.blur));
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

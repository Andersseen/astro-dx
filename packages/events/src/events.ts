type Target = string | Element | Document | Window;

function resolve(target: Target): Element | Document | Window | null {
  return typeof target === "string" ? document.querySelector(target) : target;
}

function extractValue(event: Event): string {
  const target = event.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    return target.value;
  }
  if (target instanceof HTMLSelectElement) {
    return target.value;
  }
  return "";
}

export function on(
  target: Target,
  event: string,
  fn: (valueOrEvent: string | Event) => void,
  options?: AddEventListenerOptions,
): () => void {
  const el = resolve(target);
  if (!el) return () => {};

  const inputEvents = new Set([
    "input",
    "change",
    "keyup",
    "keydown",
    "keypress",
  ]);
  const handler = inputEvents.has(event)
    ? (e: Event) => fn(extractValue(e))
    : (e: Event) => fn(e);

  el.addEventListener(event, handler, options);
  return () => el.removeEventListener(event, handler, options);
}

export function onHover(
  target: Target,
  handlers: { enter?: () => void; leave?: () => void },
): () => void {
  const el = resolve(target);
  if (!el) return () => {};

  const unsubscribers: Array<() => void> = [];

  if (handlers.enter) {
    const enter = handlers.enter;
    el.addEventListener("mouseenter", enter);
    unsubscribers.push(() => el.removeEventListener("mouseenter", enter));
  }
  if (handlers.leave) {
    const leave = handlers.leave;
    el.addEventListener("mouseleave", leave);
    unsubscribers.push(() => el.removeEventListener("mouseleave", leave));
  }

  return () => {
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }
  };
}

export function onKey(
  target: Target,
  key: KeyboardEvent["key"],
  fn: (event: KeyboardEvent) => void,
): () => void {
  const el = resolve(target);
  if (!el) return () => {};

  const handler = (e: Event) => {
    if (e instanceof KeyboardEvent && e.key === key) fn(e);
  };

  el.addEventListener("keydown", handler);
  return () => el.removeEventListener("keydown", handler);
}

export function onFocus(
  target: Target,
  handlers: { focus?: () => void; blur?: () => void },
): () => void {
  const el = resolve(target);
  if (!el) return () => {};

  const unsubscribers: Array<() => void> = [];

  if (handlers.focus) {
    const focus = handlers.focus;
    el.addEventListener("focus", focus);
    unsubscribers.push(() => el.removeEventListener("focus", focus));
  }
  if (handlers.blur) {
    const blur = handlers.blur;
    el.addEventListener("blur", blur);
    unsubscribers.push(() => el.removeEventListener("blur", blur));
  }

  return () => {
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }
  };
}

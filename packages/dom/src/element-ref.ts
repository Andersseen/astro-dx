import { effect as createEffect } from "@astro-dx/core";
import type { Computed, Signal } from "@astro-dx/core";

type Readable<T> = (Signal<T> | Computed<T>) & (() => T);
type Cleanup = () => void;

export class ElementRef<T extends Element> {
  readonly el: T;
  private _cleanups: Cleanup[] = [];

  constructor(el: T) {
    this.el = el;
  }

  text(source: Readable<unknown>): this {
    const unsub = source.subscribe((v) => {
      this.el.textContent = String(v ?? "");
    });
    this._cleanups.push(unsub);
    return this;
  }

  attr(attrName: string, source: Readable<unknown>): this {
    const unsub = source.subscribe((v) => {
      if (v === false || v === null || v === undefined) {
        this.el.removeAttribute(attrName);
      } else if (v === true) {
        this.el.setAttribute(attrName, "");
      } else {
        this.el.setAttribute(attrName, String(v));
      }
    });
    this._cleanups.push(unsub);
    return this;
  }

  cls(className: string, source: Readable<boolean> | (() => boolean)): this {
    if ("subscribe" in source) {
      const unsub = (source as Readable<boolean>).subscribe((v) => {
        this.el.classList.toggle(className, v);
      });
      this._cleanups.push(unsub);
    } else {
      this.el.classList.toggle(className, source());
    }
    return this;
  }

  on(
    event: string,
    fn: (valueOrEvent: string | Event) => void,
    options?: AddEventListenerOptions,
  ): this {
    const inputEvents = new Set([
      "input",
      "change",
      "keyup",
      "keydown",
      "keypress",
    ]);

    const handler = inputEvents.has(event)
      ? (e: Event) => {
          const target = e.target;
          if (
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLSelectElement
          ) {
            fn(target.value);
          } else {
            fn(e);
          }
        }
      : (e: Event) => fn(e);

    this.el.addEventListener(event, handler, options);
    this._cleanups.push(() =>
      this.el.removeEventListener(event, handler, options),
    );
    return this;
  }

  onHover(handlers: { enter?: () => void; leave?: () => void }): this {
    if (handlers.enter) {
      const enter = handlers.enter;
      this.el.addEventListener("mouseenter", enter);
      this._cleanups.push(() =>
        this.el.removeEventListener("mouseenter", enter),
      );
    }
    if (handlers.leave) {
      const leave = handlers.leave;
      this.el.addEventListener("mouseleave", leave);
      this._cleanups.push(() =>
        this.el.removeEventListener("mouseleave", leave),
      );
    }
    return this;
  }

  onKey(key: KeyboardEvent["key"], fn: (event: KeyboardEvent) => void): this {
    const handler = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key === key) fn(e);
    };
    this.el.addEventListener("keydown", handler);
    this._cleanups.push(() => this.el.removeEventListener("keydown", handler));
    return this;
  }

  onFocus(handlers: { focus?: () => void; blur?: () => void }): this {
    if (handlers.focus) {
      const focus = handlers.focus;
      this.el.addEventListener("focus", focus);
      this._cleanups.push(() => this.el.removeEventListener("focus", focus));
    }
    if (handlers.blur) {
      const blur = handlers.blur;
      this.el.addEventListener("blur", blur);
      this._cleanups.push(() => this.el.removeEventListener("blur", blur));
    }
    return this;
  }

  effect(fn: () => void): this {
    const stop = createEffect(fn);
    this._cleanups.push(stop);
    return this;
  }

  destroy(): void {
    for (const fn of this._cleanups) {
      fn();
    }
    this._cleanups = [];
  }
}

// packages/astro-dx-elements/src/elements/dx-for.ts
import type { Signal } from "astro-dx";
import { resolve } from "../registry.ts";

type Item = Record<string, unknown>;

export class DxFor extends HTMLElement {
  static observedAttributes = ["signal"] as const;
  private _cleanup: (() => void) | null = null;
  private _template: HTMLTemplateElement | null = null;
  private _connected = false;

  attributeChangedCallback(
    _name: string,
    _old: string | null,
    value: string | null,
  ): void {
    if (this._connected && value && !this._cleanup) {
      this._template = this.querySelector(":scope > template");
      if (!this._template) {
        console.warn("[dx-for] requires a <template> child element");
        return;
      }
      requestAnimationFrame(() => this._connect(value));
    }
  }

  connectedCallback(): void {
    this._connected = true;
    const signalName = this.getAttribute("signal");
    if (!signalName) {
      console.warn('[dx-for] missing "signal" attribute');
      return;
    }

    this._template = this.querySelector(":scope > template");
    if (!this._template) {
      console.warn("[dx-for] requires a <template> child element");
      return;
    }

    requestAnimationFrame(() => this._connect(signalName));
  }

  private _connect(signalName: string): void {
    const sig = resolve(signalName) as Signal<Item[]> | undefined;
    if (!sig) {
      console.warn(
        `[dx-for] signal "${signalName}" not found in window.__dx__`,
      );
      return;
    }

    this._cleanup = sig.subscribe((items) => {
      this._render(items ?? []);
    });
  }

  private _render(items: Item[]): void {
    if (!this._template) return;

    for (const node of Array.from(this.childNodes)) {
      if (node instanceof HTMLTemplateElement) continue;
      node.parentNode?.removeChild(node);
    }

    const fragment = document.createDocumentFragment();
    for (const item of items) {
      const clone = this._template.content.cloneNode(true) as DocumentFragment;
      this._bindItem(clone, item);
      fragment.appendChild(clone);
    }

    this.appendChild(fragment);
  }

  private _bindItem(root: DocumentFragment, item: Item): void {
    for (const el of Array.from(
      root.querySelectorAll<HTMLElement>("[dx-text]"),
    )) {
      const field = el.getAttribute("dx-text");
      if (field && field in item) {
        el.textContent = String(item[field] ?? "");
      }
    }

    for (const el of Array.from(
      root.querySelectorAll<HTMLElement>("[dx-attr]"),
    )) {
      const value = el.getAttribute("dx-attr");
      if (!value) continue;
      const [attrName, field] = value.split(":");
      if (attrName && field && field in item) {
        el.setAttribute(attrName, String(item[field] ?? ""));
      }
    }

    for (const el of Array.from(
      root.querySelectorAll<HTMLElement>("[dx-class]"),
    )) {
      const value = el.getAttribute("dx-class");
      if (!value) continue;
      const [className, field] = value.split(":");
      if (className && field && field in item) {
        el.classList.toggle(className, Boolean(item[field]));
      }
    }
  }

  disconnectedCallback(): void {
    this._cleanup?.();
    this._cleanup = null;
  }
}

customElements.define("dx-for", DxFor);

// packages/astro-dx-elements/src/elements/dx-if.ts
import { resolve } from "../registry.ts";

export class DxIf extends HTMLElement {
  static observedAttributes = ["signal"] as const;
  private _cleanup: (() => void) | null = null;
  private _template: HTMLTemplateElement | null = null;
  private _connected = false;

  connectedCallback(): void {
    this._connected = true;
    const signalName = this.getAttribute("signal");
    if (signalName) {
      this._template = this.querySelector(":scope > template");
      if (!this._template) {
        console.warn("[dx-if] requires a <template> child element");
        return;
      }
      requestAnimationFrame(() => this._connect(signalName));
    }
  }

  attributeChangedCallback(
    _name: string,
    _old: string | null,
    value: string | null,
  ): void {
    if (this._connected && value && !this._cleanup) {
      this._template = this.querySelector(":scope > template");
      if (!this._template) {
        console.warn("[dx-if] requires a <template> child element");
        return;
      }
      requestAnimationFrame(() => this._connect(value));
    }
  }

  private _connect(signalName: string): void {
    const sig = resolve(signalName);
    if (!sig) {
      console.warn(`[dx-if] signal "${signalName}" not found in window.__dx__`);
      return;
    }

    this._cleanup = sig.subscribe((value) => {
      if (value) {
        this._mount();
      } else {
        this._unmount();
      }
    });
  }

  private _mount(): void {
    if (!this._template) return;
    // Guard: don't mount if non-template children already exist
    const hasContent = Array.from(this.childNodes).some(
      (n) => !(n instanceof HTMLTemplateElement),
    );
    if (hasContent) return;
    const clone = this._template.content.cloneNode(true) as DocumentFragment;
    this.appendChild(clone);
  }

  private _unmount(): void {
    for (const node of Array.from(this.childNodes)) {
      if (node instanceof HTMLTemplateElement) continue;
      node.parentNode?.removeChild(node);
    }
  }

  disconnectedCallback(): void {
    this._cleanup?.();
    this._cleanup = null;
  }
}

customElements.define("dx-if", DxIf);

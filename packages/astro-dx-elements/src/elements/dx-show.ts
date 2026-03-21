// packages/astro-dx-elements/src/elements/dx-show.ts
import { resolve } from "../registry.ts";

export class DxShow extends HTMLElement {
  static observedAttributes = ["signal"] as const;
  private _cleanup: (() => void) | null = null;
  private _connected = false;

  connectedCallback(): void {
    this._connected = true;
    // Standard browsers: attributes already set when connectedCallback fires
    const signalName = this.getAttribute("signal");
    if (signalName) {
      requestAnimationFrame(() => this._connect(signalName));
    }
    // Non-standard envs (e.g. happy-dom): attributeChangedCallback fires after
    // connectedCallback, so the above may find no attr — handled below.
  }

  attributeChangedCallback(
    _name: string,
    _old: string | null,
    value: string | null,
  ): void {
    // Fires after connectedCallback in happy-dom; fires before in real browsers
    // (where _connected is false, so this is a no-op).
    if (this._connected && value && !this._cleanup) {
      requestAnimationFrame(() => this._connect(value));
    }
  }

  private _connect(signalName: string): void {
    const sig = resolve(signalName);
    if (!sig) {
      console.warn(
        `[dx-show] signal "${signalName}" not found in window.__dx__`,
      );
      return;
    }

    this._cleanup = sig.subscribe((value: unknown) => {
      this.hidden = !value;
    });
  }

  disconnectedCallback(): void {
    this._cleanup?.();
    this._cleanup = null;
  }
}

customElements.define("dx-show", DxShow);

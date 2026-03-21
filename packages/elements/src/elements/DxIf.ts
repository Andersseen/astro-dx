import { resolve } from "../registry.ts";

export class DxIf extends HTMLElement {
  private _cleanup: (() => void) | null = null;
  private _template = "";
  private _isMounted = false;

  connectedCallback(): void {
    const signalName = this.getAttribute("signal");
    if (!signalName) {
      console.warn('[dx-if] missing "signal" attribute');
      return;
    }

    this._template = this.innerHTML;
    this.innerHTML = "";

    requestAnimationFrame(() => this._connect(signalName));
  }

  private _connect(signalName: string): void {
    const sig = resolve(signalName);
    if (!sig) {
      console.warn(`[dx-if] signal "${signalName}" not found in registry`);
      return;
    }

    this._cleanup = sig.subscribe((value) => {
      if (value && !this._isMounted) {
        this.innerHTML = this._template;
        this._isMounted = true;
      } else if (!value && this._isMounted) {
        this.innerHTML = "";
        this._isMounted = false;
      }
    });
  }

  disconnectedCallback(): void {
    this._cleanup?.();
    this._cleanup = null;
  }
}

customElements.define("dx-if", DxIf);

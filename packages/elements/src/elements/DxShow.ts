import { resolve } from '../registry.ts';

export class DxShow extends HTMLElement {
  private _cleanup: (() => void) | null = null;

  connectedCallback(): void {
    const signalName = this.getAttribute('signal');
    if (!signalName) {
      console.warn('[dx-show] missing "signal" attribute');
      return;
    }

    this._connect(signalName);
  }

  private _connect(signalName: string): void {
    const sig = resolve(signalName);
    if (!sig) {
      console.warn(`[dx-show] signal "${signalName}" not found in registry`);
      return;
    }

    this.hidden = !sig();

    this._cleanup = sig.subscribe((value) => {
      this.hidden = !value;
    });
  }

  disconnectedCallback(): void {
    this._cleanup?.();
    this._cleanup = null;
  }
}

customElements.define('dx-show', DxShow);

import { waitRegister } from '../registry.ts';

export class DxShow extends HTMLElement {
  private _cleanup: (() => void) | null = null;
  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const signalName = this.getAttribute('signal');
    if (!signalName) {
      console.warn('[dx-show] missing "signal" attribute');
      return;
    }

    this._shadow.innerHTML = '<slot></slot>';
    this._connect(signalName);
  }

  private _connect(signalName: string): void {
    try {
      waitRegister(signalName, (sig) => {
        this.hidden = !sig();
        this._cleanup = sig.subscribe((value) => {
          this.hidden = !value;
        });
      });
    } catch (err) {
      console.error('[dx-show] Failed to connect signal:', err);
    }
  }

  disconnectedCallback(): void {
    this._cleanup?.();
    this._cleanup = null;
  }
}

customElements.define('dx-show', DxShow);

import { waitRegister } from '../registry.ts';

export class DxIf extends HTMLElement {
  private _cleanup: (() => void) | null = null;
  private _tpl: HTMLTemplateElement | null = null;
  private _isMounted = false;

  connectedCallback(): void {
    const signalName = this.getAttribute('signal');
    if (!signalName) {
      console.warn('[dx-if] missing "signal" attribute');
      return;
    }

    this._tpl = document.createElement('template');
    this._tpl.innerHTML = this.innerHTML;
    this.innerHTML = '';

    this._connect(signalName);
  }

  private _connect(signalName: string): void {
    waitRegister(signalName, (sig) => {
      const initialValue = Boolean(sig());
      if (initialValue) {
        this._mount();
      }

      this._cleanup = sig.subscribe((value) => {
        if (value && !this._isMounted) {
          this._mount();
        } else if (!value && this._isMounted) {
          this._unmount();
        }
      });
    });
  }

  private _mount(): void {
    if (!this._tpl) return;

    const clone = this._tpl.content.cloneNode(true);
    this.appendChild(clone);
    this._isMounted = true;
  }

  private _unmount(): void {
    this.innerHTML = '';
    this._isMounted = false;
  }

  disconnectedCallback(): void {
    this._cleanup?.();
    this._cleanup = null;
  }
}

customElements.define('dx-if', DxIf);

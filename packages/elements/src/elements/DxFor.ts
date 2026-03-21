import { resolve } from '../registry.ts';

type Item = Record<string, unknown>;

type SubscribableItems = {
  subscribe: (fn: (v: Item[]) => void) => () => void;
};

export class DxFor extends HTMLElement {
  private _cleanup: (() => void) | null = null;
  private _template = '';

  connectedCallback(): void {
    const signalName = this.getAttribute('signal');
    if (!signalName) {
      console.warn('[dx-for] missing "signal" attribute');
      return;
    }

    this._template = this.innerHTML;
    this.innerHTML = '';

    requestAnimationFrame(() => this._connect(signalName));
  }

  private _connect(signalName: string): void {
    const sig = resolve(signalName);
    if (!sig) {
      console.warn(`[dx-for] signal "${signalName}" not found in registry`);
      return;
    }

    this._cleanup = (sig as unknown as SubscribableItems).subscribe((items) =>
      this._render(items ?? [])
    );
  }

  private _render(items: Item[]): void {
    const fragment = document.createDocumentFragment();

    for (const item of items) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this._template;
      const clone = wrapper.firstElementChild as HTMLElement | null;
      if (!clone) continue;
      this._bindItem(clone, item);
      fragment.appendChild(clone);
    }

    this.innerHTML = '';
    this.appendChild(fragment);
  }

  private _bindItem(el: HTMLElement, item: Item): void {
    for (const node of Array.from(el.querySelectorAll<HTMLElement>('[dx-text]'))) {
      const field = node.getAttribute('dx-text');
      if (field && field in item) node.textContent = String(item[field] ?? '');
    }
    if (el.hasAttribute('dx-text')) {
      const field = el.getAttribute('dx-text');
      if (field && field in item) el.textContent = String(item[field] ?? '');
    }

    for (const node of Array.from(el.querySelectorAll<HTMLElement>('[dx-attr]'))) {
      const val = node.getAttribute('dx-attr');
      if (!val) continue;
      const [attr, field] = val.split(':');
      if (attr && field && field in item) {
        node.setAttribute(attr, String(item[field] ?? ''));
      }
    }

    for (const node of Array.from(el.querySelectorAll<HTMLElement>('[dx-class]'))) {
      const val = node.getAttribute('dx-class');
      if (!val) continue;
      const [cls, field] = val.split(':');
      if (cls && field && field in item) {
        node.classList.toggle(cls, Boolean(item[field]));
      }
    }
  }

  disconnectedCallback(): void {
    this._cleanup?.();
    this._cleanup = null;
  }
}

customElements.define('dx-for', DxFor);

import { resolve } from "../registry.ts";

type Item = Record<string, unknown>;

type SubscribableItems = {
  subscribe: (fn: (v: Item[]) => void) => () => void;
};

export class DxFor extends HTMLElement {
  private _cleanup: (() => void) | null = null;
  private _tpl: HTMLTemplateElement | null = null;
  private _keyField: string | null = null;
  private _keyedNodes = new Map<unknown, Element>();

  connectedCallback(): void {
    const signalName = this.getAttribute("signal");
    if (!signalName) {
      console.warn('[dx-for] missing "signal" attribute');
      return;
    }

    this._keyField = this.getAttribute("key");
    this._tpl = document.createElement("template");
    this._tpl.innerHTML = this.innerHTML;
    this.innerHTML = "";

    requestAnimationFrame(() => this._connect(signalName));
  }

  private _connect(signalName: string): void {
    const sig = resolve(signalName);
    if (!sig) {
      console.warn(`[dx-for] signal "${signalName}" not found in registry`);
      return;
    }

    this._cleanup = (sig as unknown as SubscribableItems).subscribe((items) =>
      this._render(items ?? []),
    );
  }

  private _render(items: Item[]): void {
    if (!this._tpl) return;

    if (this._keyField) {
      this._renderKeyed(items);
      return;
    }

    this._renderSimple(items);
  }

  private _renderSimple(items: Item[]): void {
    const fragment = document.createDocumentFragment();

    for (const item of items) {
      const clone = this._cloneItem(item);
      if (!clone) continue;
      fragment.appendChild(clone);
    }

    this.innerHTML = "";
    this.appendChild(fragment);
  }

  private _renderKeyed(items: Item[]): void {
    if (!this._keyField) return;

    const keyField = this._keyField;
    const nextKeys = new Set(items.map((item) => item[keyField]));

    for (const [key, node] of this._keyedNodes) {
      if (!nextKeys.has(key)) {
        node.parentNode?.removeChild(node);
        this._keyedNodes.delete(key);
      }
    }

    let cursor: Node | null = this.firstChild;

    for (const item of items) {
      const key = item[keyField];
      let node = this._keyedNodes.get(key);

      if (!node) {
        node = this._cloneItem(item);
        if (!node) continue;
        this._keyedNodes.set(key, node);
      } else {
        this._bindItem(node, item);
      }

      if (node !== cursor) {
        this.insertBefore(node, cursor);
      }

      cursor = node.nextSibling;
    }
  }

  private _cloneItem(item: Item): Element | undefined {
    if (!this._tpl) return undefined;

    const fragment = this._tpl.content.cloneNode(true) as DocumentFragment;
    const root = fragment.firstElementChild;
    if (!root) return undefined;

    this._bindItem(root, item);
    return root;
  }

  private _bindItem(el: Element, item: Item): void {
    applyBinding(el, item);

    for (const child of Array.from(
      el.querySelectorAll("[dx-text],[dx-attr],[dx-class]"),
    )) {
      applyBinding(child, item);
    }
  }

  disconnectedCallback(): void {
    this._cleanup?.();
    this._cleanup = null;
    this._keyedNodes.clear();
  }
}

function applyBinding(el: Element, item: Item): void {
  const textField = el.getAttribute("dx-text");
  if (textField && textField in item) {
    el.textContent = String(item[textField] ?? "");
  }

  const attrValue = el.getAttribute("dx-attr");
  if (attrValue) {
    const separatorIndex = attrValue.indexOf(":");
    if (separatorIndex !== -1) {
      const attrName = attrValue.slice(0, separatorIndex);
      const field = attrValue.slice(separatorIndex + 1);
      if (field in item) {
        el.setAttribute(attrName, String(item[field] ?? ""));
      }
    }
  }

  const clsValue = el.getAttribute("dx-class");
  if (clsValue) {
    const separatorIndex = clsValue.indexOf(":");
    if (separatorIndex !== -1) {
      const className = clsValue.slice(0, separatorIndex);
      const field = clsValue.slice(separatorIndex + 1);
      if (field in item) {
        el.classList.toggle(className, Boolean(item[field]));
      }
    }
  }
}

customElements.define("dx-for", DxFor);

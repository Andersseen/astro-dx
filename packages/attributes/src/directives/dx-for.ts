import { resolve } from '../registry.ts';

type Item = Record<string, unknown>;

type SubscribableItems = {
  subscribe: (fn: (v: Item[]) => void) => void;
};

export function applyDxFor(template: Element): void {
  const signalName = template.getAttribute('dx-for');
  if (!signalName) return;

  const sig = resolve(signalName);
  if (!sig) {
    console.warn(`[dx-for] signal "${signalName}" not found in registry`);
    return;
  }

  const parent = template.parentNode;
  if (!parent) return;

  const anchor = document.createComment(`dx-for:${signalName}`);
  parent.insertBefore(anchor, template);
  parent.removeChild(template);

  let renderedNodes: Node[] = [];

  (sig as unknown as SubscribableItems).subscribe((items) => {
    for (const node of renderedNodes) {
      node.parentNode?.removeChild(node);
    }
    renderedNodes = [];

    const fragment = document.createDocumentFragment();

    for (const item of items ?? []) {
      const clone = template.cloneNode(true) as Element;
      clone.removeAttribute('dx-for');
      bindItem(clone, item);
      fragment.appendChild(clone);
      renderedNodes.push(clone);
    }

    anchor.parentNode?.insertBefore(fragment, anchor.nextSibling);
  });
}

function bindItem(el: Element, item: Item): void {
  const textField = el.getAttribute('dx-text');
  if (textField && textField in item) {
    el.textContent = String(item[textField] ?? '');
  }

  const attrValue = el.getAttribute('dx-attr');
  if (attrValue) {
    const [attrName, field] = attrValue.split(':');
    if (attrName && field && field in item) {
      el.setAttribute(attrName, String(item[field] ?? ''));
    }
  }

  const clsValue = el.getAttribute('dx-class');
  if (clsValue) {
    const [className, field] = clsValue.split(':');
    if (className && field && field in item) {
      el.classList.toggle(className, Boolean(item[field]));
    }
  }
}

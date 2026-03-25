import { resolve } from '../registry.ts';

type Item = Record<string, unknown>;

type SubscribableItems = {
  subscribe: (fn: (v: Item[]) => void) => void;
};

export function applyDxFor(template: Element): void {
  const signalName = template.getAttribute('dx-for');
  if (!signalName) return;

  const keyField = template.getAttribute('dx-key');

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

  const cleanTemplate = template.cloneNode(true) as Element;
  cleanTemplate.removeAttribute('dx-for');
  cleanTemplate.removeAttribute('dx-key');

  const keyedNodes = new Map<unknown, Element>();
  let renderedNodes: Element[] = [];

  (sig as unknown as SubscribableItems).subscribe((items) => {
    const nextItems = items ?? [];

    if (keyField) {
      reconcileKeyed(anchor, cleanTemplate, nextItems, keyField, keyedNodes);
      return;
    }

    reconcileSimple(anchor, cleanTemplate, nextItems, renderedNodes);
    renderedNodes = getRenderedNodes(anchor);
  });
}

function reconcileSimple(
  anchor: Comment,
  template: Element,
  items: Item[],
  previous: Element[]
): void {
  for (const node of previous) {
    node.parentNode?.removeChild(node);
  }

  const fragment = document.createDocumentFragment();

  for (const item of items) {
    const clone = template.cloneNode(true) as Element;
    bindItem(clone, item);
    fragment.appendChild(clone);
  }

  anchor.parentNode?.insertBefore(fragment, anchor.nextSibling);
}

function reconcileKeyed(
  anchor: Comment,
  template: Element,
  items: Item[],
  keyField: string,
  keyedNodes: Map<unknown, Element>
): void {
  const nextKeys = new Set(items.map((item) => item[keyField]));

  for (const [key, node] of keyedNodes) {
    if (!nextKeys.has(key)) {
      node.parentNode?.removeChild(node);
      keyedNodes.delete(key);
    }
  }

  let cursor: Node | null = anchor.nextSibling;

  for (const item of items) {
    const key = item[keyField];
    let node = keyedNodes.get(key);

    if (!node) {
      node = template.cloneNode(true) as Element;
      keyedNodes.set(key, node);
    }

    bindItem(node, item);

    if (node !== cursor) {
      anchor.parentNode?.insertBefore(node, cursor);
    }

    cursor = node.nextSibling;
  }
}

function getRenderedNodes(anchor: Comment): Element[] {
  const nodes: Element[] = [];
  let current = anchor.nextSibling;

  while (current && !(current instanceof Comment)) {
    if (current instanceof Element) {
      nodes.push(current);
    }
    current = current.nextSibling;
  }

  return nodes;
}

function bindItem(el: Element, item: Item): void {
  applyBinding(el, item);

  for (const child of Array.from(el.querySelectorAll('[dx-text],[dx-attr],[dx-class]'))) {
    applyBinding(child, item);
  }
}

function applyBinding(el: Element, item: Item): void {
  const textField = el.getAttribute('dx-text');
  if (textField && textField in item) {
    el.textContent = String(item[textField] ?? '');
  }

  const attrValue = el.getAttribute('dx-attr');
  if (attrValue) {
    const separatorIndex = attrValue.indexOf(':');
    if (separatorIndex !== -1) {
      const attrName = attrValue.slice(0, separatorIndex);
      const field = attrValue.slice(separatorIndex + 1);
      if (field in item) {
        el.setAttribute(attrName, String(item[field] ?? ''));
      }
    }
  }

  const clsValue = el.getAttribute('dx-class');
  if (clsValue) {
    const separatorIndex = clsValue.indexOf(':');
    if (separatorIndex !== -1) {
      const className = clsValue.slice(0, separatorIndex);
      const field = clsValue.slice(separatorIndex + 1);
      if (field in item) {
        el.classList.toggle(className, Boolean(item[field]));
      }
    }
  }
}

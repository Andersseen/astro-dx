import { resolve } from '../registry.ts';

export function applyDxIf(el: Element): void {
  const signalName = el.getAttribute('dx-if');
  if (!signalName) return;

  const sig = resolve(signalName);
  if (!sig) {
    console.warn(`[dx-if] signal "${signalName}" not found in registry`);
    return;
  }

  const parent = el.parentNode;
  if (!parent) return;

  const anchor = document.createComment(`dx-if:${signalName}`);
  parent.insertBefore(anchor, el);

  const initialValue = Boolean(sig());
  let isMounted = initialValue;

  if (!isMounted) {
    parent.removeChild(el);
  }

  sig.subscribe((value) => {
    if (value && !isMounted) {
      anchor.parentNode?.insertBefore(el, anchor.nextSibling);
      isMounted = true;
    } else if (!value && isMounted) {
      el.parentNode?.removeChild(el);
      isMounted = false;
    }
  });
}

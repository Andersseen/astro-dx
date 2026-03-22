import { resolve } from '../registry.ts';

export function applyDxShow(el: Element): void {
  const signalName = el.getAttribute('dx-show');
  if (!signalName) return;

  const sig = resolve(signalName);
  if (!sig) {
    console.warn(`[dx-show] signal "${signalName}" not found in registry`);
    return;
  }

  sig.subscribe((value) => {
    (el as HTMLElement).hidden = !value;
  });
}

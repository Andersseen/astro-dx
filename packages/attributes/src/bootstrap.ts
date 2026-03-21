import { applyDxFor } from "./directives/dx-for.ts";
import { applyDxIf } from "./directives/dx-if.ts";
import { applyDxShow } from "./directives/dx-show.ts";

const bootstrapped = new WeakSet<Element>();

export function bootstrap(root: Element | Document = document): void {
  for (const el of root.querySelectorAll("[dx-if]")) {
    if (bootstrapped.has(el)) return;
    applyDxIf(el);
    bootstrapped.add(el);
  }

  for (const el of root.querySelectorAll("[dx-show]")) {
    if (bootstrapped.has(el)) return;
    applyDxShow(el);
    bootstrapped.add(el);
  }

  for (const el of root.querySelectorAll("[dx-for]")) {
    if (bootstrapped.has(el)) return;
    applyDxFor(el);
    bootstrapped.add(el);
  }
}

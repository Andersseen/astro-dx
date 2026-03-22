export const domContext = `<astro-dx-dom>
## @astro-dx/dom
DOM selection and reactive bindings. Central to wiring signals to the actual page.

### getElement<T extends Element>(selector: string): ElementRef<T>
Selects a single element and wraps it in an ElementRef. If not found, logs a warning and returns a dummy ref.

### getElements<T extends Element>(selector: string): ElementRef<T>[]
Selects all matching elements, returns an array of ElementRefs.

### destroyAll(): void
Destroys all ElementRefs created via getElement/getElements. Call this in \`onBeforeSwap()\`.

---

### ElementRef<T> — chainable reactive wrapper

All methods return \`this\` for chaining (except \`destroy()\`).

| Method | Signature | Description |
|--------|-----------|-------------|
| .text(source) | (Signal or Computed) => this | Bind textContent to a reactive source |
| .attr(name, source) | (string, Signal or Computed) => this | Bind an attribute reactively. \`false/null/undefined\` removes it, \`true\` sets empty string |
| .cls(className, source) | (string, boolean or Signal<boolean>) => this | Toggle a CSS class reactively |
| .on(event, fn, options?) | (string, (value or Event) => void) => this | Add event listener. For input/change/keyup/keydown/keypress events, \`fn\` receives the input value string directly |
| .onHover(handlers) | ({ enter?, leave? }) => this | mouseenter / mouseleave |
| .onKey(key, fn) | (string, KeyboardEvent => void) => this | Keydown for a specific key |
| .onFocus(handlers) | ({ focus?, blur? }) => this | focus / blur |
| .effect(fn) | (() => void) => this | Localized effect, auto-cleaned on destroy |
| .destroy() | () => void | Remove all listeners, subscriptions, effects |

#### Example

\`\`\`ts
import { signal, computed } from '@astro-dx/core';
import { getElement } from '@astro-dx/dom';

const query = signal('');
const hasQuery = computed(() => query().length > 0);

getElement('#search-input')
  .on('input', (val) => query.set(val as string));

getElement('#clear-btn')
  .cls('hidden', computed(() => !hasQuery()))
  .on('click', () => query.set(''));

getElement('#results-count')
  .text(computed(() => \\\`\\\${results().length} results\\\`));
\`\`\`

---

### Standalone bindings (functional style)
These work without \`ElementRef\`, accepting a CSS selector or Element directly.

| Function | Signature |
|----------|-----------|
| text(target, source) | (string or Element, Signal or Computed) => () => void |
| attr(target, attrName, source) | (string or Element, string, Signal or Computed) => () => void |
| cls(target, className, source) | (string or Element, string, Signal<boolean>) => () => void |

\`\`\`ts
import { text, attr, cls } from '@astro-dx/dom';

const unsub = text('#counter', count);
// later: unsub();
\`\`\`
</astro-dx-dom>`;

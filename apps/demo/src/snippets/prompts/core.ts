export const coreContext = `<astro-dx-core>
## @astro-dx/core
Reactive primitives, dependency injection, and Astro lifecycle hooks.

### signal<T>(initial: T): Signal<T>
Creates a reactive signal. Calling the signal as a function reads its value and registers a dependency.

\`\`\`ts
import { signal } from '@astro-dx/core';

const name = signal('World');

name();           // → 'World' (tracked read)
name.peek();      // → 'World' (untracked read, no dependency)
name.set('Astro');
name.update(prev => prev.toUpperCase());
const unsub = name.subscribe(v => console.log(v)); // fires immediately + on change
unsub(); // cleanup
\`\`\`

#### Signal<T> interface
| Method | Signature | Description |
|--------|-----------|-------------|
| () | () => T | Read value, register reactive dependency |
| peek | () => T | Read value without tracking |
| set | (value: T) => void | Replace value |
| update | (fn: (prev: T) => T) => void | Update value via function |
| subscribe | (fn: (value: T) => void) => () => void | Subscribe to changes, returns unsubscribe |

---

### computed<T>(fn: () => T): Computed<T>
Derives a value from other signals/computeds. Re-evaluates automatically when dependencies change. Read-only.

\`\`\`ts
import { computed } from '@astro-dx/core';

const fullName = computed(() => \\\`\\\${firstName()} \\\${lastName()}\\\`);
fullName();        // tracked read
fullName.peek();   // untracked read
fullName.subscribe(v => console.log(v));
\`\`\`

---

### effect(fn: () => void): () => void
Runs a side-effect whenever its tracked signals change. Returns a stop function.

\`\`\`ts
import { effect } from '@astro-dx/core';

const stop = effect(() => {
  document.title = \\\`Count: \\\${count()}\\\`;
});
stop(); // cleanup
\`\`\`

---

### createService<T>(instance: T): Readonly<T>
Wraps an object as a singleton service. The ESM module system guarantees a single instance across all islands.

\`\`\`ts
import { signal, createService } from '@astro-dx/core';

export const uiService = createService({
  menuOpen: signal(false),
  toggle() { this.menuOpen.update(v => !v); },
});
\`\`\`

---

### register(services) / inject(Service)
Class-based DI. Register service classes; inject retrieves the singleton instance anywhere.

\`\`\`ts
import { signal } from '@astro-dx/core';

class ThemeService {
  mode = signal<'light' | 'dark'>('light');
  toggle() { this.mode.update(m => m === 'light' ? 'dark' : 'light'); }
}

// bootstrap.ts
import { register } from '@astro-dx/core';
register(ThemeService);

// any-island.ts
import { inject } from '@astro-dx/core';
const theme = inject(ThemeService);
theme.toggle();
\`\`\`

---

### Lifecycle

#### onPageLoad(callback: () => void): void
Fires on initial load AND on every Astro view-transition navigation. Always use this for setup.

#### onBeforeSwap(callback: () => void): void
Fires just before Astro swaps the page. Use for cleanup (\`destroyAll()\`, unsubscriptions).

\`\`\`ts
import { onPageLoad, onBeforeSwap } from '@astro-dx/core';
import { destroyAll } from '@astro-dx/dom';

onPageLoad(() => { /* setup */ });
onBeforeSwap(() => destroyAll());
\`\`\`
</astro-dx-core>`;

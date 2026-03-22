export const astroDxContext = `<astro-dx-overview>
## What is astro-dx?
A modular reactivity toolkit for Astro client scripts. Zero virtual DOM, zero framework runtime.
Brings structured patterns (Signals, Computed, Services, Directives) to vanilla DOM interactivity inside Astro islands.

## Package map

| Package | Import | Purpose |
|---------|--------|---------|
| @astro-dx/core | signal, computed, effect, createService, register, inject, onPageLoad, onBeforeSwap | Reactive primitives, DI, lifecycle |
| @astro-dx/dom | getElement, getElements, destroyAll, ElementRef, text, attr, cls | DOM selection + reactive bindings |
| @astro-dx/events | on, onClick, onInput, onChange, onSubmit, onHover, onKey, onFocus, onResize | Standalone event helpers |
| @astro-dx/attributes | register, bootstrap | HTML attribute directives (dx-if, dx-show, dx-for) |
| @astro-dx/elements | DxIf, DxShow, DxFor | Custom element versions of directives |

## Quick-start example

\`\`\`ts
// store.ts — shared state
import { signal, computed } from '@astro-dx/core';

export const count = signal(0);
export const doubled = computed(() => count() * 2);
\`\`\`

\`\`\`ts
// counter.ts — island script
import { onPageLoad, onBeforeSwap } from '@astro-dx/core';
import { getElement, destroyAll } from '@astro-dx/dom';
import { count, doubled } from './store';

onPageLoad(() => {
  getElement('#count-display').text(count);
  getElement('#doubled-display').text(doubled);
  getElement('#increment-btn').on('click', () => count.update(c => c + 1));
});

onBeforeSwap(() => destroyAll());
\`\`\`

\`\`\`html
<!-- Counter.astro -->
<div>
  <span id="count-display">0</span>
  <span id="doubled-display">0</span>
  <button id="increment-btn">+1</button>
</div>
<script src="./counter.ts"></script>
\`\`\`
</astro-dx-overview>`;

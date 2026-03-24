import type { PlaygroundFiles } from '../../lib/playground/types.ts';

export const signalsPlayground: PlaygroundFiles = {
  js: `\
import { signal, computed, effect, linkedSignal, untracked } from '@astro-dx/core'
import { text } from '@astro-dx/dom'
import { on } from '@astro-dx/events'

// 1. Primitive State
const count = signal(0)

// 2. Push-Pull Derivation (Glitch-Free)
// Even if 'count' changes, 'double' and 'triple' update atomically
// and 'sum' pulls them exactly once.
const double = computed(() => count() * 2)
const triple = computed(() => count() * 3)
const sum    = computed(() => {
  console.log('[astro-dx] Evaluating sum...')
  return double() + triple()
})

// 3. Linked State (Dependent Writable)
// Resets to double() when double changes, but can be manually overridden.
const multiplier = linkedSignal(() => double())

// 4. Side Effects (Auto-tracked)
effect(() => {
  const current = count()
  const val = sum()
  console.log(\`Count: \${current}, Sum: \${val}, Mult: \${multiplier()}\`)
})

// Bindings using @astro-dx/dom & @astro-dx/events
text('#count',      count)
text('#sum',        sum)
text('#multiplier', multiplier)

on('#inc', 'click', () => count.update(v => v + 1))
on('#dec', 'click', () => count.update(v => v - 1))
on('#set-mult', 'click', () => multiplier.set(999))
`,

  html: `\
<div style="text-align:center;padding:1rem">
  <div style="font-size:0.8rem;opacity:0.5;margin-bottom:1rem">Push-Pull Reactivity (Glitch-Free)</div>
  
  <div id="count" style="font-size:4rem;font-weight:800;color:hsl(var(--primary))">0</div>
  
  <div style="margin:1rem 0;font-size:1.25rem;font-weight:600">
    Sum (2x + 3x) = <span id="sum">0</span>
  </div>

  <div style="padding:1rem;background:hsl(var(--muted));border-radius:8px;margin-bottom:1.5rem">
    <div style="font-size:0.75rem;opacity:0.6;margin-bottom:0.25rem">Linked Multiplier (Resets on Change)</div>
    <div id="multiplier" style="font-family:monospace;font-size:1.5rem">0</div>
    <button id="set-mult" style="margin-top:0.5rem;font-size:0.75rem">Override to 999</button>
  </div>

  <div style="display:flex;gap:0.5rem;justify-content:center">
    <and-button id="dec" variant="outline" size="sm">Decrease</and-button>
    <and-button id="inc" variant="primary" size="sm">Increase</and-button>
  </div>
</div>`,
};

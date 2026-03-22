import type { PlaygroundFiles } from '../../lib/playground/types.ts';

export const signalsPlayground: PlaygroundFiles = {
  js: `\
// ── With astro-dx ────────────────────────────────────────────────────────────
import { signal, computed, effect } from '@astro-dx/core'

const count  = signal(0)
const double = computed(() => count() * 2)
const sign   = computed(() =>
  count() > 0 ? 'positive' : count() < 0 ? 'negative' : 'zero'
)

// effect re-runs automatically when count changes
effect(() => {
  const abs = Math.abs(count())
  document.querySelector('#fact').textContent =
    abs === 0 ? 'Try clicking the buttons'
    : abs % 2 === 0 ? \`\${count()} is even\`
    : \`\${count()} is odd\`
})

text('#count',  count)
text('#double', double)
text('#sign',   sign)

onClick('#inc',   () => count.update(v => v + 1))
onClick('#dec',   () => count.update(v => v - 1))
onClick('#reset', () => count.set(0))

// ── What this replaces (nanostores) ──────────────────────────────────────────
// import { atom, computed } from 'nanostores'
// const $count  = atom(0)
// const $double = computed($count, c => c * 2)
// $count.subscribe(v => el.textContent = String(v))
// btn.addEventListener('click', () => $count.set($count.get() + 1))
`,

  html: `\
<div style="text-align:center;padding:1rem 0">
  <div id="count"
    style="font-size:5rem;font-weight:700;color:#fb923c;line-height:1;
           transition:transform .1s">
    0
  </div>
  <div style="display:flex;gap:1rem;justify-content:center;
              font-size:.8rem;opacity:.5;margin:.75rem 0 1.5rem">
    <span>× 2 = <strong id="double">0</strong></span>
    <span id="sign">zero</span>
  </div>
  <p id="fact"
    style="font-size:.8rem;opacity:.4;margin-bottom:1.25rem;
           min-height:1.2em">
    Try clicking the buttons
  </p>
  <div style="display:flex;gap:.5rem;justify-content:center">
    <button id="dec">−</button>
    <button id="reset" style="opacity:.5;font-size:.8rem">reset</button>
    <button id="inc">+</button>
  </div>
</div>`,
};

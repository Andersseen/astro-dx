import type { PlaygroundFiles } from "../../lib/playground/types.ts";

export const eventsPlayground: PlaygroundFiles = {
  js: `\
// ── With @astro-dx/events ─────────────────────────────────────────────────────
import { signal, computed } from '@astro-dx/core';
import { onClick,onInput,onKey,onHover,onResize} from '@astro-dx/events';
import { text} from '@astro-dx/dom';

const clickCount = signal(0)
const inputValue = signal('')
const isHovered  = signal(false)
const boxWidth   = signal(0)

// onClick — typed, clean
onClick('#click-target', () => clickCount.update(v => v + 1))
text('#click-count', clickCount)

// onInput — value already extracted
onInput('#text-input', val => inputValue.set(val))
text('#input-display', inputValue)

// onKey — fires only for the specified key
onKey('#text-input', 'Enter', () => {
  document.querySelector('#enter-msg').textContent =
    \`Submitted: "\${inputValue()}"\`
  inputValue.set('')
  document.querySelector('#text-input').value = ''
})

// onHover — enter and leave together
onHover('#hover-target', {
  enter: () => isHovered.set(true),
  leave: () => isHovered.set(false),
})
isHovered.subscribe(v => {
  const el = document.querySelector('#hover-target')
  el.style.background = v ? '#fb923c20' : 'transparent'
  el.style.borderColor = v ? '#fb923c' : '#3f3f46'
  document.querySelector('#hover-status').textContent =
    v ? 'hovering ✓' : 'not hovering'
})

// onResize — ResizeObserver made easy
onResize('#resize-target', entry => {
  boxWidth.set(Math.round(entry.contentRect.width))
})
text('#box-width', computed(() => boxWidth() + 'px'))

// ── What this replaces ────────────────────────────────────────────────────────
// btn.addEventListener('click', e => ...)
// input.addEventListener('input', e => fn(e.target.value))  ← manual extraction
// el.addEventListener('mouseenter', fn)                      ← split into two calls
// el.addEventListener('mouseleave', fn)
// new ResizeObserver(([e]) => fn(e)).observe(el)
`,

  html: `\
<div style="display:flex;flex-direction:column;gap:1.25rem">

  <div style="display:flex;align-items:center;gap:.75rem">
    <button id="click-target">Click me</button>
    <span style="font-size:.875rem;opacity:.6">
      Clicked <strong id="click-count">0</strong> times
    </span>
  </div>

  <div>
    <input id="text-input" type="text"
      placeholder="Type something (Enter to submit)..." />
    <div style="display:flex;gap:1rem;margin-top:.25rem;font-size:.8rem;opacity:.5">
      <span>value: "<span id="input-display"></span>"</span>
    </div>
    <p id="enter-msg"
      style="font-size:.8rem;color:#4ade80;margin:.25rem 0 0;min-height:1.2em">
    </p>
  </div>

  <div id="hover-target"
    style="padding:.75rem;border-radius:6px;border:1px dashed #3f3f46;
           text-align:center;font-size:.875rem;cursor:default;
           transition:background .15s,border-color .15s">
    Hover over me · <span id="hover-status">not hovering</span>
  </div>

  <div>
    <p style="font-size:.75rem;opacity:.5;margin:0 0 .25rem">
      Resize the browser to see onResize fire
    </p>
    <div id="resize-target"
      style="padding:.5rem;background:#fb923c15;border-radius:4px;
             border:1px solid #fb923c30;font-size:.8rem;text-align:center">
      Width: <strong id="box-width">—</strong>
    </div>
  </div>

</div>`,
};

import type { PlaygroundFiles } from '../../lib/playground/types.ts';

export const domPlayground: PlaygroundFiles = {
  js: `\

import { signal, computed } from '@astro-dx/core';
import { text} from '@astro-dx/dom';
import { onInput} from '@astro-dx/events';

const query   = signal('')
const opacity = signal(100)
const results = computed(() =>
  ['Signals', 'Services', 'DOM bindings', 'Attributes', 'Elements']
    .filter(r => r.toLowerCase().includes(query().toLowerCase()))
)


text('#query-display', query)


onInput('#search', val => query.set(val))


results.subscribe(items => {
  document.querySelector('#results').innerHTML = items
    .map(r => \`<li style="padding:.25rem 0;border-bottom:1px solid #333;
                         font-size:.875rem">\${r}</li>\`)
    .join('')
})


const opSlider = document.querySelector('#opacity-slider')
const opTarget = document.querySelector('#opacity-target')

if (opSlider) {
  opSlider.addEventListener('input', e => opacity.set(Number(e.target.value)))
}
opacity.subscribe(v => {
  if (opTarget) opTarget.style.opacity = String(v / 100)
  const label = document.querySelector('#opacity-label')
  if (label) label.textContent = String(v)
})





`,

  html: `\
<div style="display:flex;flex-direction:column;gap:1rem">
  <div>
    <label style="font-size:.75rem;opacity:.5;display:block;margin-bottom:.25rem">
      Search (filter the list)
    </label>
    <input id="search" type="text" placeholder="Type to filter..." />
    <p style="font-size:.75rem;opacity:.4;margin-top:.25rem">
      Query: "<span id="query-display"></span>"
    </p>
  </div>

  <ul id="results" style="list-style:none;padding:0;min-height:5rem"></ul>

  <div>
    <label style="font-size:.75rem;opacity:.5;display:block;margin-bottom:.25rem">
      Opacity (<span id="opacity-label">100</span>%)
    </label>
    <input id="opacity-slider" type="range" min="0" max="100" value="100" />
    <div id="opacity-target"
      style="margin-top:.5rem;padding:.75rem;border-radius:6px;
             background:#fb923c;color:white;text-align:center;
             font-size:.875rem;font-weight:500">
      Reactive opacity
    </div>
  </div>
</div>`,
};

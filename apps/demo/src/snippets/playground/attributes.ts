import type { PlaygroundFiles } from '../../lib/playground/types.ts';

export const attributesPlayground: PlaygroundFiles = {
  js: `\

import { signal, computed } from '@astro-dx/core';
import { onClick} from '@astro-dx/events';


const isVisible = signal(true)
const isMounted = signal(true)
const items     = signal([
  { id: 1, name: 'Signals',    done: true  },
  { id: 2, name: 'Services',   done: true  },
  { id: 3, name: 'DOM',        done: true  },
  { id: 4, name: 'Attributes', done: false },
  { id: 5, name: 'Compiler',   done: false },
])


onClick('#toggle-show', () => isVisible.update(v => !v))
onClick('#toggle-if',   () => isMounted.update(v => !v))


isVisible.subscribe(v => {
  const el = document.querySelector('#show-target')
  if (el) el.hidden = !v
})


const ifTarget = document.querySelector('#if-target')
const ifParent = ifTarget?.parentNode
const ifAnchor = document.createComment('dx-if')
ifParent?.insertBefore(ifAnchor, ifTarget)

isMounted.subscribe(v => {
  if (v && !ifTarget.parentNode) {
    ifAnchor.parentNode?.insertBefore(ifTarget, ifAnchor.nextSibling)
  } else if (!v && ifTarget.parentNode) {
    ifTarget.parentNode.removeChild(ifTarget)
  }
})


items.subscribe(list => {
  const ul = document.querySelector('#items-list')
  if (!ul) return
  ul.innerHTML = list.map(i => \`
    <li style="display:flex;align-items:center;gap:.5rem;
               padding:.25rem 0;border-bottom:1px solid #333;font-size:.875rem">
      <span style="width:8px;height:8px;border-radius:50%;flex-shrink:0;
                   background:\${i.done ? '#16a34a' : '#555'}"></span>
      <span>\${i.name}</span>
    </li>
  \`).join('')
})





`,

  html: `\
<div style="display:flex;flex-direction:column;gap:1.25rem">

  <div style="display:flex;gap:.5rem;align-items:center">
    <button id="toggle-show" style="font-size:.8rem">Toggle dx-show</button>
    <div id="show-target"
      style="padding:.25rem .75rem;background:#fb923c20;border-radius:4px;
             border:1px solid #fb923c40;font-size:.8rem;color:#fb923c">
      I stay in DOM (hidden attr)
    </div>
  </div>

  <div style="display:flex;gap:.5rem;align-items:center">
    <button id="toggle-if" style="font-size:.8rem">Toggle dx-if</button>
    <div id="if-target"
      style="padding:.25rem .75rem;background:#16a34a20;border-radius:4px;
             border:1px solid #16a34a40;font-size:.8rem;color:#4ade80">
      I am removed from DOM
    </div>
  </div>

  <div>
    <p style="font-size:.75rem;opacity:.5;margin:0 0 .5rem">
      dx-for — reactive list
    </p>
    <ul id="items-list" style="list-style:none;padding:0"></ul>
  </div>

</div>`,
};

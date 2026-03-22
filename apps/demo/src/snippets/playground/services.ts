import type { PlaygroundFiles } from '../../lib/playground/types.ts';

export const servicesPlayground: PlaygroundFiles = {
  js: `\
// ── With astro-dx services ────────────────────────────────────────────────────

// 1. Define the service — state + logic co-located
const cartItems = signal([])
const total     = computed(() => cartItems().length)
const isEmpty   = computed(() => cartItems().length === 0)

function addItem(name) {
  cartItems.update(p => [...p, { id: Date.now(), name }])
}
function removeItem(id) {
  cartItems.update(p => p.filter(i => i.id !== id))
}
function clearCart() {
  cartItems.set([])
}

// Make remove available globally for inline handlers
window.removeItem = removeItem

// 2. Island A — products
onClick('#add-kb',  () => addItem('Keyboard'))
onClick('#add-ms',  () => addItem('Mouse'))
onClick('#add-mon', () => addItem('Monitor'))
onClick('#add-hdp', () => addItem('Headphones'))

// 3. Island B — cart display
text('#total', total)

isEmpty.subscribe(empty => {
  document.querySelector('#empty-msg').style.display = empty ? 'block' : 'none'
  document.querySelector('#list-section').style.display = empty ? 'none' : 'block'
})

cartItems.subscribe(items => {
  document.querySelector('#list').innerHTML = items
    .map(i => \`
      <li style="display:flex;align-items:center;justify-content:space-between;
                 padding:.25rem 0;border-bottom:1px solid #333;font-size:.875rem">
        <span>\${i.name}</span>
        <button onclick="removeItem(\${i.id})"
          style="font-size:.75rem;padding:.125rem .375rem;opacity:.5">
          ×
        </button>
      </li>\`)
    .join('')
})

onClick('#clear', () => clearCart())

// ── What this replaces ────────────────────────────────────────────────────────
// Scattered atoms in stores/, manual querySelector everywhere
// No encapsulation, no clear ownership of state
`,

  html: `\
<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;min-height:220px">

  <div style="padding:.75rem;border-radius:8px;border:1px solid #3f3f46">
    <p style="font-size:.7rem;font-weight:600;opacity:.4;
               text-transform:uppercase;letter-spacing:.05em;margin:0 0 .5rem">
      Island A — Products
    </p>
    <div style="display:flex;flex-direction:column;gap:.375rem">
      <button id="add-kb">+ Keyboard</button>
      <button id="add-ms">+ Mouse</button>
      <button id="add-mon">+ Monitor</button>
      <button id="add-hdp">+ Headphones</button>
    </div>
  </div>

  <div style="padding:.75rem;border-radius:8px;border:1px solid #3f3f46">
    <p style="font-size:.7rem;font-weight:600;opacity:.4;
               text-transform:uppercase;letter-spacing:.05em;margin:0 0 .5rem">
      Island B — Cart (<span id="total">0</span> items)
    </p>

    <p id="empty-msg"
      style="font-size:.8rem;opacity:.35;font-style:italic;margin:0">
      Cart is empty
    </p>

    <div id="list-section" style="display:none">
      <ul id="list" style="list-style:none;padding:0;margin:0 0 .5rem"></ul>
      <button id="clear"
        style="width:100%;font-size:.75rem;opacity:.5">
        Clear all
      </button>
    </div>
  </div>

</div>`,
};

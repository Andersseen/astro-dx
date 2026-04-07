import type { PlaygroundFiles } from '../../lib/playground/types.ts';

export const alpineCounterPlayground: PlaygroundFiles = {
  js: '',

  html: `<div
  x-data="{ count: 0 }"
  style="display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1rem"
>
  <button
    @click="count++"
    style="font-size:1rem;padding:.5rem 1.5rem"
  >
    Increment
  </button>

  <div style="font-size:2.5rem;font-weight:700;color:#fbbf24" x-text="count">
    0
  </div>

  <button
    @click="count = 0"
    style="font-size:.75rem;opacity:.6"
  >
    Reset
  </button>
</div>`,
};

export const alpineConditionalsPlayground: PlaygroundFiles = {
  js: '',

  html: `<div
  x-data="{ showBox: true, mounted: true }"
  style="display:flex;flex-direction:column;gap:1.25rem;padding:1rem"
>
  <div style="display:flex;gap:.5rem;align-items:center">
    <button @click="showBox = !showBox" style="font-size:.8rem">
      Toggle x-show
    </button>
    <div
      x-show="showBox"
      style="padding:.25rem .75rem;background:#fb923c20;border-radius:4px;
             border:1px solid #fb923c40;font-size:.8rem;color:#fb923c"
    >
      I stay in DOM (display:none)
    </div>
  </div>

  <div style="display:flex;gap:.5rem;align-items:center">
    <button @click="mounted = !mounted" style="font-size:.8rem">
      Toggle x-if
    </button>
    <template x-if="mounted">
      <div
        style="padding:.25rem .75rem;background:#16a34a20;border-radius:4px;
               border:1px solid #16a34a40;font-size:.8rem;color:#4ade80"
      >
        I am removed from DOM
      </div>
    </template>
  </div>

  <div>
    <p style="font-size:.75rem;opacity:.5;margin:0 0 .5rem">
      x-for — reactive list
    </p>
    <ul style="list-style:none;padding:0" x-data="{ items: [
      { id: 1, name: 'Signals', done: true },
      { id: 2, name: 'Services', done: true },
      { id: 3, name: 'DOM', done: true },
      { id: 4, name: 'Attributes', done: false },
      { id: 5, name: 'Compiler', done: false }
    ]}">
      <template x-for="item in items" :key="item.id">
        <li style="display:flex;align-items:center;gap:.5rem;
                   padding:.25rem 0;border-bottom:1px solid #333;font-size:.875rem">
          <span style="width:8px;height:8px;border-radius:50%;flex-shrink:0;
                       background:#16a34a" x-show="item.done"></span>
          <span style="width:8px;height:8px;border-radius:50%;flex-shrink:0;
                       background:#555" x-show="!item.done"></span>
          <span x-text="item.name"></span>
        </li>
      </template>
    </ul>
  </div>
</div>`,
};

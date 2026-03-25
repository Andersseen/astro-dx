import type { PlaygroundFiles } from '../../lib/playground/types.ts';

export const servicesPlayground: PlaygroundFiles = {
  js: `\
import { signal, GlobalRegistry, createLocalRegistry } from '@astro-dx/core'
import { text } from '@astro-dx/dom'
import { onClick } from '@astro-dx/events'


class CounterService {
  count;
  
  constructor() {
    this.count = signal(0);
  }

  increment() {
    this.count.update(n => n + 1);
  }
}


const globalCounter = GlobalRegistry.inject(CounterService)


const localReg = createLocalRegistry()
const localCounter = localReg.inject(CounterService)



text('#global-count', globalCounter.count)
onClick('#global-inc', () => globalCounter.increment())



text('#local-count', localCounter.count)
onClick('#local-inc', () => localCounter.increment())
`,

  html: `\
<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
  
  <div style="padding:1.25rem;border-radius:12px;background:hsl(var(--muted));border:1px solid hsl(var(--border))">
    <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;opacity:0.5;margin-bottom:0.75rem">Global Scope</div>
    <div id="global-count" style="font-size:3rem;font-weight:800;margin-bottom:1rem">0</div>
    <and-button id="global-inc" variant="primary" size="sm" style="width:100%">Global +1</and-button>
  </div>

  <div style="padding:1.25rem;border-radius:12px;background:hsl(var(--card));border:1px solid hsl(var(--primary)/0.2)">
    <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;color:hsl(var(--primary));margin-bottom:0.75rem">Local Scope (Island)</div>
    <div id="local-count" style="font-size:3rem;font-weight:800;margin-bottom:1rem">0</div>
    <and-button id="local-inc" variant="outline" size="sm" style="width:100%">Local +1</and-button>
  </div>

</div>
<p style="font-size:0.8rem;opacity:0.5;margin-top:1rem;text-align:center">
  Notice how incrementing the local counter doesn't affect the global one.
</p>`,
};

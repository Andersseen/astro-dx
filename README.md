# astro-dx

Angular-inspired signals, services and DOM bindings for Astro client-side scripting. Built on nanostores.

> **Community library** — not affiliated with or endorsed by the Astro core team.

---

## Why

Astro is great for content-focused sites. But when you need client-side interactivity across islands, the DX gets rough fast — raw nanostores subscriptions, manual `querySelector`, no cleanup, no structure.

astro-dx brings the patterns Angular 20+ developers know — signals, computed values, singleton services, declarative DOM bindings — to Astro client scripts. No compiler, no framework, zero JS added to the server-rendered markup.

```typescript
// Before
const $count = atom(0)
document.querySelector('#count').textContent = String($count.get())
document.querySelector('#btn').addEventListener('click', () => {
  $count.set($count.get() + 1)
})

// After
const count = signal(0)
text('#count', count)
onClick('#btn', () => count.update(v => v + 1))
```

---

## Packages

| Package | Description |
|---|---|
| [`@astro-dx/core`](./packages/core) | `signal`, `computed`, `effect`, `inject`, lifecycle hooks |
| [`@astro-dx/events`](./packages/events) | `onClick`, `onInput`, `onKey`, `onHover`, `onResize` |
| [`@astro-dx/attributes`](./packages/attributes) | `dx-if`, `dx-show`, `dx-for`, `dx-model` as HTML attributes |
| [`@astro-dx/elements`](./packages/elements) | `dx-if`, `dx-show`, `dx-for` as custom elements |
| [`@astro-dx/dom`](./packages/dom) | `getElement`, `getElements` — enriched element refs |
| [`@astro-dx/compiler`](./packages/compiler) | Astro integration — `@if`, `@for`, `{{ }}` template syntax |
| [`astro-dx`](./packages/all) | All packages in one install |
| [`@astro-dx/init`](./packages/init) | CLI scaffolding — `npx @astro-dx/init` |

---

## Install

```bash
# Interactive — asks which packages you need
npx @astro-dx/init

# All packages
npm install astro-dx

# Only what you need
npm install @astro-dx/core
npm install @astro-dx/core @astro-dx/dom
npm install @astro-dx/core @astro-dx/events @astro-dx/attributes
```

---

## Quick start

### Signals

```typescript
import { signal, computed, effect } from '@astro-dx/core'

const count  = signal(0)
const double = computed(() => count() * 2)

effect(() => {
  console.log(`count is ${count()}, double is ${double()}`)
})

count.set(5) // logs: count is 5, double is 10
```

### Services — share state across islands

```typescript
// src/services/cart.service.ts
import { signal, computed } from '@astro-dx/core'

export class CartService {
  #items = signal<string[]>([])

  readonly total = computed(() => this.#items().length)

  add(item: string) { this.#items.update(p => [...p, item]) }
  clear()           { this.#items.set([]) }
}

// Register once — in BaseLayout or a bootstrap file
import { register } from '@astro-dx/core'
register([CartService])
```

```astro
<!-- IslandA.astro — adds items -->
<script>
  import { inject } from '@astro-dx/core'
  import { CartService } from '../services/cart.service'
  import { onClick } from '@astro-dx/events'

  const cart = inject(CartService)
  onClick('#btn', () => cart.add('Keyboard'))
</script>

<!-- IslandB.astro — reads the same service, zero prop drilling -->
<script>
  import { inject } from '@astro-dx/core'
  import { CartService } from '../services/cart.service'
  import { text } from '@astro-dx/dom'

  const cart = inject(CartService)
  text('#total', cart.total)
</script>
```

### DOM bindings

```typescript
import { signal, computed } from '@astro-dx/core'
import { getElement } from '@astro-dx/dom'

const query   = signal('')
const results = computed(() => items.filter(i => i.includes(query())))

const input = getElement<HTMLInputElement>('#search')
const list  = getElement('#results')

input.model(query)              // two-way binding
list.text(computed(() =>        // reactive textContent
  `${results().length} results`
))
```

### Declarative templates

```astro
<p dx-show="hasItems">You have items in your cart</p>

<ul>
  <li dx-for="cartItems" dx-key="id" dx-text="name"></li>
</ul>

<input dx-model="searchQuery" />

<script>
  import { register, bootstrap } from '@astro-dx/attributes'
  register({ hasItems, cartItems, searchQuery })
  bootstrap()
</script>
```

### Compiler — Angular-like template syntax

```astro
---
// astro.config.mjs
import astroDx from '@astro-dx/compiler'
export default defineConfig({ integrations: [astroDx()] })
---

@if (user.isAdmin) {
  <p>Welcome, {{ user.name }}</p>
}

@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
}
```

### ViewTransitions

```typescript
import { onPageLoad, onBeforeSwap } from '@astro-dx/core'
import { destroyAll } from '@astro-dx/dom'

onPageLoad(() => {
  const btn = getElement('#btn')
  btn.onclick(() => count.update(v => v + 1))
})

onBeforeSwap(() => destroyAll())
```

---

## Demo

Live demos with editable playground: **[astro-dx.pages.dev](https://astro-dx.pages.dev)**

---

## Contributing

```bash
git clone https://github.com/your-org/astro-dx
cd astro-dx
pnpm install
pnpm build:packages
pnpm dev          # starts the demo app
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # E2E tests (Playwright)
pnpm lint         # Biome
```

Before submitting a PR, add a changeset:

```bash
pnpm changeset
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

---

## Deploy the demo

### Local preview

```bash
pnpm build:demo
pnpm deploy:demo:local
```

### Production

```bash
pnpm deploy:demo
```

Publishes `apps/demo/dist` to Cloudflare Pages project `astro-dx-demo` via Wrangler.

### GitHub Actions auto deploy

Workflow: `.github/workflows/deploy-demo.yml` — runs on every push to `main`.

Required secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

---

## License

MIT © [Andersseen](https://github.com/Andersseen)

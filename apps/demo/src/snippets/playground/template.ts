/**
 * Removes import statements from the code, as they are shimmed in the playground.
 */
export function stripImports(code: string): string {
  return code
    .replace(
      /^import\s+\{[^}]*\}\s+from\s+['"][^'"]*['"]\s*;?\s*$/gm,
      "// [import removed — shimmed]",
    )
    .replace(
      /^import\s+.*from\s+['"][^'"]*['"]\s*;?\s*$/gm,
      "// [import removed — shimmed]",
    );
}

/**
 * Builds the srcdoc for the playground iframe, including base styles and astro-dx shims.
 */
export function buildSrcdoc(jsCode: string, htmlCode: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0; padding: 1rem;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px; line-height: 1.5;
    color: #e4e4e7; background: hsl(240 6% 10%);
  }
  button {
    cursor: pointer; border: 1px solid #3f3f46;
    background: #27272a; color: #e4e4e7;
    padding: .375rem .75rem; border-radius: 6px;
    font-size: .8125rem; transition: background .15s;
  }
  button:hover { background: #3f3f46; }
  input, select, textarea {
    border: 1px solid #3f3f46; background: #18181b;
    color: #e4e4e7; padding: .375rem .5rem;
    border-radius: 6px; font-size: .8125rem;
    width: 100%;
  }
  input[type="range"] { padding: 0; }
  strong { color: #fb923c; }
</style>
</head>
<body>
${htmlCode}
<script type="module">
// ── Core Push-Pull Engine (Real Logic) ────────────────────────────────────────
let activeObserver = null;
let trackingDisabled = 0;

function getActiveObserver() { return trackingDisabled > 0 ? null : activeObserver; }
function setActiveObserver(node) { const prev = activeObserver; activeObserver = node; return prev; }
function untracked(fn) { trackingDisabled++; try { return fn(); } finally { trackingDisabled--; } }
function trackDependency(dep) { const obs = getActiveObserver(); if (obs) { dep.observers.add(obs); obs.dependencies.add(dep); } }

function signal(initial, equal = Object.is) {
  let value = initial;
  const observers = new Set();
  const node = (() => { trackDependency(node); return value; });
  node.version = 0; node.observers = observers;
  node.peek = () => value;
  node.set = (newValue) => {
    if (!equal(value, newValue)) { value = newValue; node.version++; for (const o of [...observers]) o.notify(); }
  };
  node.update = (fn) => node.set(fn(value));
  node.subscribe = (fn) => {
    const obs = { version: -1, dependencies: new Set(), notify: () => fn(value) };
    observers.add(obs); fn(value); return () => observers.delete(obs);
  };
  return node;
}

function computed(fn) {
  let value, dirty = true, version = 0;
  const observers = new Set(), dependencies = new Set();
  const node = {
    version: 0, dependencies,
    notify: () => { if (!dirty) { dirty = true; version++; for (const o of [...observers]) o.notify(); } }
  };
  const recompute = () => {
    for (const d of dependencies) d.observers.delete(node);
    dependencies.clear();
    const prev = setActiveObserver(node);
    try { const nv = fn(); if (!Object.is(value, nv)) value = nv; dirty = false; } finally { setActiveObserver(prev); }
  };
  const read = () => { trackDependency({ observers }); if (dirty) recompute(); return value; };
  read.peek = () => { if (dirty) recompute(); return value; };
  read.subscribe = (f) => {
    const o = { version: -1, dependencies: new Set(), notify: () => f(read()) };
    observers.add(o); f(read());
    return () => { observers.delete(o); if (observers.size === 0) { for (const d of dependencies) d.observers.delete(node); dependencies.clear(); dirty = true; } };
  };
  return read;
}

function effect(fn) {
  const dependencies = new Set();
  let iterationCount = 0, scheduled = false;
  const node = {
    version: 0, dependencies,
    notify: () => { if (scheduled) return; scheduled = true; queueMicrotask(() => { scheduled = false; run(); }); }
  };
  const run = () => {
    if (iterationCount++ >= 100) throw new Error("Infinite loop");
    for (const d of dependencies) d.observers.delete(node);
    dependencies.clear();
    const prev = setActiveObserver(node);
    try { fn(); } finally { setActiveObserver(prev); setTimeout(() => iterationCount = 0, 0); }
  };
  run();
  return () => { for (const d of dependencies) d.observers.delete(node); dependencies.clear(); };
}

function linkedSignal(options) {
  const op = typeof options === 'function' ? { source: options, computation: s => s } : options;
  const s = signal(op.computation(op.source()), op.equal);
  effect(() => { s.set(op.computation(op.source(), s.peek())); });
  return s;
}

// ── Registry / DI ─────────────────────────────────────────────────────────────
const SHARED_SERVICES = new Set();

class Registry {
  #instances = new Map(); 
  #parent;

  constructor(parent) { 
    this.#parent = parent; 
  }

  register(services, options = {}) {
    (Array.isArray(services) ? services : [services]).forEach(S => {
       if (options.shared) SHARED_SERVICES.add(S);
       if (!this.#instances.has(S)) this.#instances.set(S, new S());
    });
  }

  inject(S) {
    let i = this.#instances.get(S);
    if (i) return i;

    // Aislado por defecto. Solo busca en el padre si está explícitamente compartido.
    if (this.#parent && SHARED_SERVICES.has(S)) {
      return this.#parent.inject(S);
    }

    i = new S(); 
    this.#instances.set(S, i); 
    return i;
  }
}
const GlobalRegistry = new Registry();
const inject = (S) => GlobalRegistry.inject(S);
const createLocalRegistry = (p = GlobalRegistry) => new Registry(p);
const registerShared = (services) => GlobalRegistry.register(services, { shared: true });

// ── DOM Helpers ───────────────────────────────────────────────────────────────
function _res(t) { return typeof t === 'string' ? document.querySelector(t) : t; }
function text(sel, src) { const el = _res(sel); if (el && src?.subscribe) src.subscribe(v => { el.textContent = String(v ?? ''); }); }
function cls(sel, cn, src) { const el = _res(sel); if (el && src?.subscribe) src.subscribe(v => { el.classList.toggle(cn, Boolean(v)); }); }
function on(sel, ev, fn) { const el = _res(sel); if (el) el.addEventListener(ev, fn); }
function onClick(s, f) { on(s, 'click', f); }
function onInput(s, f) { on(s, 'input', e => f(e.target.value)); }

// Expose to window for playground access
Object.assign(window, { signal, computed, effect, linkedSignal, inject, Registry, GlobalRegistry, createLocalRegistry, registerShared, text, cls, on, onClick, onInput, untracked });

try {
${stripImports(jsCode)}
} catch(e) {
  document.body.innerHTML += '<pre style="color:#ef4444;font-size:12px;margin-top:1rem">' + e.message + '</pre>';
}
<\/script>
</body>
</html>`;
}

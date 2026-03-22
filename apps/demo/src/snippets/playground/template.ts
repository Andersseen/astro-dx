/**
 * Removes import statements from the code, as they are shimmed in the playground.
 */
export function stripImports(code: string): string {
  return code
    .replace(/^import\s+\{[^}]*\}\s+from\s+['"][^'"]*['"]\s*;?\s*$/gm, '// [import removed — shimmed]')
    .replace(/^import\s+.*from\s+['"][^'"]*['"]\s*;?\s*$/gm, '// [import removed — shimmed]');
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
// Minimal astro-dx shim for playground
function signal(init) {
  let val = init;
  const subs = new Set();
  const read = () => val;
  read.peek = () => val;
  read.set = (v) => { val = v; subs.forEach(fn => fn(val)); };
  read.update = (fn) => read.set(fn(val));
  read.subscribe = (fn) => { subs.add(fn); fn(val); return () => subs.delete(fn); };
  return read;
}
function computed(fn) {
  let val;
  const subs = new Set();
  const recompute = () => {
    const prev = val;
    val = fn();
    if (prev !== val) subs.forEach(s => s(val));
  };
  val = fn();
  const read = () => val;
  read.peek = () => val;
  read.subscribe = (cb) => { subs.add(cb); cb(val); return () => subs.delete(cb); };
  setInterval(recompute, 50);
  return read;
}
function effect(fn) {
  fn();
  const id = setInterval(fn, 50);
  return () => clearInterval(id);
}
function _resolve(t) { return typeof t === 'string' ? document.querySelector(t) : t; }
function text(sel, src) { const el = _resolve(sel); if (el && src?.subscribe) src.subscribe(v => { el.textContent = String(v ?? ''); }); }
function cls(sel, cn, src) { const el = _resolve(sel); if (el && src?.subscribe) src.subscribe(v => { el.classList.toggle(cn, Boolean(v)); }); }
function onClick(sel, fn) { const el = _resolve(sel); if (el) el.addEventListener('click', fn); }
function onInput(sel, fn) { const el = _resolve(sel); if (el) el.addEventListener('input', e => fn(e.target.value)); }
function onKey(t, key, fn) { const el = _resolve(t); if (el) el.addEventListener('keydown', e => { if (e.key === key) fn(e); }); }
function onHover(sel, h) { const el = _resolve(sel); if (!el) return; if (h.enter) el.addEventListener('mouseenter', h.enter); if (h.leave) el.addEventListener('mouseleave', h.leave); }
function onResize(sel, fn) { const el = _resolve(sel); if (!(el instanceof Element)) return; new ResizeObserver(([e]) => fn(e)).observe(el); }
function onSubmit(sel, fn) { const el = _resolve(sel); if (el) el.addEventListener('submit', e => { e.preventDefault(); fn(e); }); }

window.signal = signal; window.computed = computed; window.effect = effect;
window.text = text; window.cls = cls;
window.onClick = onClick; window.onInput = onInput; window.onKey = onKey;
window.onHover = onHover; window.onResize = onResize; window.onSubmit = onSubmit;

try {
${stripImports(jsCode)}
} catch(e) {
  document.body.innerHTML += '<pre style="color:#ef4444;font-size:12px;margin-top:1rem">' + e.message + '</pre>';
}
<\/script>
</body>
</html>`;
}

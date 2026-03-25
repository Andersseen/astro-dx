export function stripImports(code: string): string {
  return code.replace(/^import\s+['"][^'"]*\.css['"]\s*;?\s*$/gm, "");
}

export function buildSrcdoc(
  jsCode: string,
  htmlCode: string,
  rootDir: string,
): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 1rem; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.5; color: #e4e4e7; background: hsl(240 6% 10%); }
  button { cursor: pointer; border: 1px solid #3f3f46; background: #27272a; color: #e4e4e7; padding: .375rem .75rem; border-radius: 6px; font-size: .8125rem; transition: background .15s; }
  button:hover { background: #3f3f46; }
</style>

<script type="importmap">
{
  "imports": {
    "@astro-dx/core": "/@fs${rootDir}/../../packages/core/dist/index.js",
    "@astro-dx/dom": "/@fs${rootDir}/../../packages/dom/dist/index.js",
    "@astro-dx/events": "/@fs${rootDir}/../../packages/events/dist/index.js"
  }
}
</script>

</head>
<body>
${htmlCode}

<script>
  window.addEventListener('error', function(e) {
    document.body.innerHTML += '<pre style="color:#ef4444;font-size:12px;margin-top:1rem;padding:1rem;background:#450a0a;border-radius:6px;">' + (e.error ? e.error.message : e.message) + '</pre>';
  });
</script>

<script type="module">
${stripImports(jsCode)}
</script>
</body>
</html>`;
}

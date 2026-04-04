export function stripImports(code: string): string {
  return code.replace(/^import\s+['"][^'"]*\.css['"]\s*;?\s*$/gm, '');
}

export function buildSrcdoc(
  jsCode: string,
  htmlCode: string,
  urls: { core: string; dom: string; events: string; attributes: string }
): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline';">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 1rem; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.5; color: #e4e4e7; background: hsl(240 6% 10%); }
  button { cursor: pointer; border: 1px solid #3f3f46; background: #27272a; color: #e4e4e7; padding: .375rem .75rem; border-radius: 6px; font-size: .8125rem; transition: background .15s; }
  button:hover { background: #3f3f46; }
  .error-message { color: #ef4444; font-size: 12px; margin-top: 1rem; padding: 1rem; background: #450a0a; border-radius: 6px; white-space: pre-wrap; word-break: break-word; }
</style>

<script type="importmap">
{
  "imports": {
    "@astro-dx/core": "${urls.core}",
    "@astro-dx/dom": "${urls.dom}",
    "@astro-dx/events": "${urls.events}",
    "@astro-dx/attributes": "${urls.attributes}"
  }
}
</script>

</head>
<body>
${htmlCode}

<script>
  window.addEventListener('error', function(e) {
    var errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = e.error ? e.error.message : e.message;
    document.body.appendChild(errorDiv);
  });
</script>

<script type="module">
${stripImports(jsCode)}
</script>
</body>
</html>`;
}

export function buildAlpineSrcdoc(htmlCode: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 1rem; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.5; color: #e4e4e7; background: hsl(240 6% 10%); }
  button { cursor: pointer; border: 1px solid #3f3f46; background: #27272a; color: #e4e4e7; padding: .375rem .75rem; border-radius: 6px; font-size: .8125rem; transition: background .15s; }
  button:hover { background: #3f3f46; }
  .error-message { color: #ef4444; font-size: 12px; margin-top: 1rem; padding: 1rem; background: #450a0a; border-radius: 6px; white-space: pre-wrap; word-break: break-word; }
</style>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"><\/script>
</head>
<body>
${htmlCode}

<script>
  window.addEventListener('error', function(e) {
    var errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = e.error ? e.error.message : e.message;
    document.body.appendChild(errorDiv);
  });
</script>
</body>
</html>`;
}

# astro-dx

Angular-inspired signals, DOM bindings and services for Astro client-side scripting.

## Deploy demo with Cloudflare Pages

### Local preview with Wrangler

1. Build the demo app:

   `pnpm build:demo`

2. Run Cloudflare Pages local preview:

   `pnpm deploy:demo:local`

### Production deploy

Run:

`pnpm deploy:demo`

The deploy uses Wrangler and publishes `apps/demo/dist` to the Cloudflare Pages
project `astro-dx-demo`.

### GitHub Actions auto deploy

Workflow: `.github/workflows/deploy-demo.yml`

It runs on every push to `main` and deploys automatically.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

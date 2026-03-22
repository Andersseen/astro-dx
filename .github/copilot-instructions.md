# Workspace Instructions

## What this repo is

- Single repository with npm workspaces.
- Library lives in packages/astro-dx.
- Demo Astro app lives in apps/demo.

## Commands

- npm install
- npm run dev
- npm run build
- npm run build:lib
- npm run test
- npm run test:e2e
- npm run lint
- npm run format

## Architecture boundaries

- Core reactive primitives in packages/astro-dx/src/core.
- DOM bindings and event helpers in packages/astro-dx/src/dom.
- Demo app consumes library via workspace dependency and TS path aliases.

## Conventions

- TypeScript strict mode.
- No any in library source.
- Keep APIs tree-shakeable and explicit.
- Prefer service singletons for shared state across Astro islands.

## Pitfalls

- computed() uses a synchronous first-pass dependency collection; async/conditional late reads are not tracked.
- effect() is currently minimal and intentionally not a full reactive tracker.

# Slice 7 — every script under tsx, through public APIs

Slice 7, the grandfathered script imports retired: `eslint.config.ts` exempts no
script from `boundaries/dependencies`, and no `package.json` entry under `src/`
or root `scripts/` runs on bare Node.

- **A script reaching a leaf takes the slice's `index.node-safe.ts`**, the
  barrel gaining the names it reads; where none existed one was added (the game
  page, basilisk's home memo, the CV's lib, shell's colour tokens and
  breakpoints), so a script never loads a page component, Phaser or a stylesheet
  behind an ordinary `index.ts`.
- **A script's tests take `index.test-only.ts`**, as every layer's do — a policy
  in `masd-boundaries.ts`.
- **A fourth public API, `index.no-browser.ts`**: what a script running with no
  bundler takes and a browser must not hold, guarded by its name alone since
  `server-only` would throw in the script. `music/shared/catalogue`'s holds
  `readCatalogueNames`, which reads `node:fs` and which `list-untold-songs`, run
  with no site, cannot take through the ordinary barrel. Rejected: the
  server-only barrel without the import (the operator: «чем 1 лучше? все равно
  ведь .server-only. без import 'server-only' точно так же проверяется только
  названием, но оно к тому же ещё и путает»), and running the script under
  `react-server` («зачем запускать с реактом если он там не нужен»).
- **`personas/tools/` stays on bare Node**, being Майя's, so
  `maya/pages/whisper`'s node-safe barrel still spells its extensions and
  `tsconfig.json` keeps `allowImportingTsExtensions`.

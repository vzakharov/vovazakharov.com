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
- **`readCatalogueNames` sits behind
  `music/shared/catalogue/index.server-only.ts`**, the one module behind a
  server-only barrel without `import 'server-only'`: it reads `node:fs`, so
  client components' node-safe barrel cannot hold it, and `index.ts` resolves
  the site on import, which `list-untold-songs`, run from the repo root with no
  site, cannot. The alternative was entering the site directory through
  `in-site.sh`, which moves every cwd-relative path in the script; asked on the
  bite's PR.
- **`personas/tools/` stays on bare Node**, being Майя's, so
  `maya/pages/whisper`'s node-safe barrel still spells its extensions and
  `tsconfig.json` keeps `allowImportingTsExtensions`.

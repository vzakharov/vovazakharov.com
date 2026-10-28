# `src/` — Multi-App Sliced Design

Every application module lives here, as a set of apps — `src/<app>/`, each a
[Feature-Sliced Design](https://feature-sliced.design/) tree of its own —
composed along the graph in [`masd.json`](masd.json), where each app names the
apps it extends. Each site's `sites/<site>/app/` is a Next.js App Router and
nothing else — `layout.tsx` and each `page.tsx` are one-line re-exports of what
they render.

**The conventions live in [`.claude/rules/masd.md`](../.claude/rules/masd.md)**:
the composition model, layer directionality across apps, the public-API rule,
what decides which layer a module belongs to, and the Next.js traps around the
structure. They are not advisory — `eslint-plugin-boundaries`, Steiger
(`pnpm lint:fsd`) and `pnpm check:masd` check them in `./scripts/vet.sh`, so a
misplacement fails the run rather than review.

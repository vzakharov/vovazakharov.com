# `src/` — Feature-Sliced Design

Every application module lives here, organized by
[Feature-Sliced Design](https://feature-sliced.design/): `shared/`, `features/`
and `pages/` today, with `entities/` and `widgets/` left out until something
earns them. Root `app/` is the Next.js App Router and, at the same time, the FSD
app layer, so its route files stay thin — each re-exports a `src/pages/` slice.

**The conventions live in [`.claude/rules/fsd.md`](../.claude/rules/fsd.md)**:
layer directionality, the public-API rule, what decides which layer a module
belongs to, and the Next.js traps around the structure. They are not advisory —
Steiger (`pnpm lint:fsd`) and `eslint-plugin-boundaries` check them in
`./scripts/vet.sh`, so a misplacement fails the run rather than review.

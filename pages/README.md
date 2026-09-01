# `pages/`

This directory is deliberately empty of routes, and exists only to keep
Next.js away from `src/pages/` — the FSD **pages layer**, not a router.

`next/dist/lib/find-pages-dir.js` resolves `pages` as root `pages/` first and
`src/pages/` second, resolves `app` the same way, and then throws
`> \`pages\` and \`app\` directories should be under the same folder`when the
two land under different parents. With the App Router at root`app/`, an FSD
`src/pages/`would trip that on every build. A root`pages/`wins the lookup,
registers no routes because it holds no page files, and leaves`src/pages/`
alone.

**Do not add route files here.** Routes go in `app/`.

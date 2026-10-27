# Slice 2 — sites out of `apps/`

Slice 2, sites out of `apps/`: vet clean but for the same citation, every site
built.

- **`sites/<site>/`** holds each router, `public/`, Next config and tsconfig,
  with `sites/site-next-config.ts` beside them, so "app" names only an app under
  `src/`.
- **A site keeps its short id** (`vova`, `lsa`, `bible`, `basilisk`) in the
  directory, `NEXT_PUBLIC_SITE`, the squash scope and every `pnpm` entry — a
  domain in each of those spent characters on every command for nothing, so it
  stays where it was, once, in the site's `url`.

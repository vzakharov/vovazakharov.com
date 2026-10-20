Proposed squash body:

```
Each site's router, public/ and Next config live under sites/<id>/
(vova, lsa, bible, basilisk) instead of apps/, so "app" names only an
app under src/. The id stays short everywhere it is typed — the
directory, NEXT_PUBLIC_SITE, the pnpm entries, the squash scope — and
the domain is written once, in the site's url.

Each branch keeps its squash draft and relays in its own
docs/remove-before-merging/<branch>/ (scripts/working-dir.sh), and a
bite's /finalize sweeps only that subfolder.
```

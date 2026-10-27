# Slice 3 — app scripts in their apps

Slice 3, app scripts in their apps: vet clean.

- **Each app's tooling is `src/<app>/scripts/`**, beside its layers: 104 files
  moved to their owners (mushrooms 45, music 37, basilisk 8, the rest kernel,
  shell, blog and vova), root `scripts/` keeping the repo's and the agent's.
- **`render-og` and `render-pdf` split like the sitemap.** kernel's `og-job.ts`
  renders chart cards and the site card from its mark and takes `OgBundle`s;
  each printing site has `src/<site>/scripts/render-{og,pdf}.ts` — vova the CV
  and music's collage bundle, basilisk its generated site card and case cards,
  bible the cores alone. The PDF core is blog's `print-job.ts`, not kernel's as
  first recommended: printing documents is blog's and `PRINT_SOURCES` names
  shell's files. basilisk passes its case UI as a document source, which moves
  it out of the other sites' hashes; lsa has no entry and the render-pdfs action
  skips a site without one.
- **The checkers**: a `script` element in `eslint/masd-boundaries.ts` — its own
  app's and its ancestors' scripts directly, every layer, its own app's
  included, through a public API (the operator overturned the recommended
  own-app exception: «ну нет, кажется что это не кошерно… можно пока заигнорить
  эти ошибки значит, но потом отыгнорить и починить»). The 56 script files that
  already reach past one are grandfathered in a scoped `boundaries/dependencies`
  override in `eslint.config.ts`, grouped by app. `shared/content`'s node-safe
  barrel grew the registry's paths and `contentHash`, and i18n's barrel
  `inLocale`; `check:masd` counts no script as a reference (nothing it flagged);
  knip enters `src/*/scripts/*.ts`.

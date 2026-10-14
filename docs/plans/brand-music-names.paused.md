# Brand the music names, drop the codegen

**Task as asked** (operator, in session, after the review thread https://github.com/vzakharov/vovazakharov.com/pull/150#discussion_r4267237940): «давай брендим и убираем кодген». `MusicAlbum`/`MusicProject` stop being generated literal unions; a song's `album`/`project` is checked at build time against the files under `apps/vova/public/music/albums/` and `artists/`, and the types are zod brands.

## Done (commit "wip: brand the music names, drop the codegen")

- `src/shared/music-catalogue/name-brands.ts` — `SLUG`, `musicAlbumSchema`/`musicProjectSchema` (form only, `.brand<…>()`), the two types.
- `src/shared/music-catalogue/catalogue-names.ts` — node-safe reader: `readCatalogueNames(musicDir)` → `{ albums, artists: {slug,name}[], albumSchema, projectSchema }` (the schemas refine membership); `readSiteCatalogueNames()` reads the app directory's (`path.dirname(collectionDir('music'))`).
- `names.ts` — hand-written, `server-only`: reads the site catalogue once; exports `MUSIC_ALBUM_SLUGS`, `MUSIC_PROJECT_NAMES`, `albumSchema`, `projectSchema`, `projectSlug()`, `projectBySlug()`. `MUSIC_PROJECT_SLUGS` is gone; `music-urls`, `catalogue-files`, `music-route-params` use the functions.
- `frontmatter.ts` uses `albumSchema`/`projectSchema` from `names.ts`.
- Scripts: `list-untold-songs.ts` reads `readCatalogueNames(MUSIC_CATALOGUE_DIR)` (new export in `scripts/lib/public-markdown.ts`); its test writes its own `albums/`+`artists/` fixture. `scaffold-song.ts` uses `readSiteCatalogueNames()`.
- Removed `scripts/generate-music-names.ts`, `music:codegen` in `package.json`, its vet step (vet.sh now runs `styles:codegen` alone, comment singular), its mentions in `.claude/rules/stack.md` and `songs.md`; `vet-songs.sh` INPUTS name `catalogue-names.ts` and the album/artist files.
- Tests `album-tracks.test.ts`, `projects.test.ts` build branded values with `musicAlbumSchema.parse`/`musicProjectSchema.parse` from `index.node-safe`.
- Green: `pnpm typecheck`, eslint on touched files, `lint:fsd`, `knip`, `type-overlap`, those tests, `music:untold` (current), `pnpm build:vova` (index order unchanged).

## Left

1. **Fix the client-bundle leak — blocking.** Exporting the brand *schemas* through `index.node-safe.ts` put zod into the client bundle of every song page (`b3104b78…js` carries `z.string().regex(SLUG).brand()`; a ~377 kB chunk `0b74a6c8…` is likely zod itself — confirm against a `main` build). Client components enter that barrel. Recommended fix: `index.node-safe.ts` exports **types only** from `name-brands.ts`; the two tests get their branded values without a runtime import from that barrel — e.g. type the fixtures off the function under test and build them with the brand schema imported from a module tests may enter (check `eslint.config.ts` boundaries: tests have no exemption; `shared/lib/*.ts` is enterable from every layer, so a brand helper does not belong there either). Decide, then rebuild and re-scan `apps/vova/out/_next/static/chunks/` for `da-z]+(?:-[` and zod.
2. **Prove a typo still fails the build**: a song with `album: vagabnd` and one with a misspelt `project` fail `pnpm build:vova`; revert.
3. `/polish` over the change (`catalogue-names.ts` duplicates nothing with `scripts/lib/public-markdown.ts`? check), then refresh the squash proposal (`docs/remove-before-merging/squash-message.md`: its paragraph 2 still describes the codegen) and the PR body (Summary bullet 2, QA rows `typo`/`codegen`) via `/pr`.
4. Reply on the thread above with the commit SHA.

## Decisions already made

- Membership is checked at build time by zod (`documents.ts` `schema.parse`), not by `tsc`, which never reads `.md` — the codegen bought nothing the runtime check does not.
- The brand is what keeps an album slug and an artist name from being passed for each other; no production code names a specific artist or album.
- The reader takes a directory because the app build runs in `apps/vova/` while `list-untold-songs` runs from the root.

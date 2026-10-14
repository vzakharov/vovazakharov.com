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

- Client-bundle leak closed (f1c8083): `index.node-safe.ts` exports the brand types only; the two tests brand their fixtures with a zod schema of the same brand. After `pnpm build:vova` no chunk carries `da-z]+(?:-[`, and the one chunk holding zod belongs to `/mushrooms`.
- A misspelt `album` and a misspelt `project` (a Latin `e` in `Полуживые`) each fail `pnpm build:vova` with "Invalid frontmatter in 20.md".
- Polished (05bab01); the squash proposal and the PR body describe the brands rather than the codegen, and the review thread has its reply.

## Decisions already made

- Membership is checked at build time by zod (`documents.ts` `schema.parse`), not by `tsc`, which never reads `.md` — the codegen bought nothing the runtime check does not.
- The brand is what keeps an album slug and an artist name from being passed for each other; no production code names a specific artist or album.
- The reader takes a directory because the app build runs in `apps/vova/` while `list-untold-songs` runs from the root.

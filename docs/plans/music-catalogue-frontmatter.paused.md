# Albums and artists live in their own frontmatter

Asked in review of #148 ([r4263026823](https://github.com/vzakharov/vovazakharov.com/pull/148#discussion_r4263026823)): «а зачем мы вообще инфу об альбомах храним тут, а не во фронтматтерах их мдшек?». Based on `claude/latin-first-transliteration-ymni59` until #148 merges.

## The shape

**Each album's and artist's `.md` holds what the registries hold now**, its locale blocks shaped like a song's:

```yaml
# albums/vagabond.md
---
title: Vagabond
artist: GENERATED
ru:
  title: 'Скиталец: по следам Конюхова' # a string: the name it goes by here
  artist: Полуживые # whose release it is in this locale
---
# albums/ctfu.md
---
title: Cheer The Fuck Up
artist: GENERATED
ru:
  title: { translation: 'Взбодрись, блядь' } # a gloss, as a song's
---
# artists/poluzhivye.md
---
name: Полуживые # the key a song's `project:` names
order: 2 # where the music index lists it
en:
  name: { translation: The Half-Alive }
---
# artists/yoohie.md
---
name: Yoohie
order: 6
ru:
  name: Йухи
---
```

- **An album's slug is its file name, an artist's slug likewise** — `MUSIC_PROJECT_SLUGS` disappears; `artists/poluzhivye.md` _is_ the mapping `Полуживые → poluzhivye`.
- **A locale's `title`/`name` is a song's `<locale>.title` field reused**: a string replaces the name in that locale, `{ translation }` keeps it and glosses it. One schema, three users.
- **`cover` is derived, not stated**: an album has a cover when `assets/covers/<slug>.jpg` exists — content.md's "anything derivable is never restated in frontmatter". The six albums without `cover: true` today have no file there, so nothing changes on the page.
- **`order` on artists only.** `catalogueArtists` lists in registry order, which is curated (GENERATED first); albums are always shown newest first, so registry order only breaks a tie, and slug order does that as well.

Files to create: `albums/` gets 17 new files (only `divine-discontent`, `prototypes`, `wings` exist), `artists/` 9 (only `generated`, `poluzhivye`, `za-oblozhkoy` exist). A new file carries frontmatter and no body; `catalogueText` already treats an empty body as no story.

## The typo check: generate the enums

**`pnpm music:codegen` writes `shared/music-catalogue/names.ts` from the files** — `MUSIC_ALBUM_SLUGS` from `albums/*.md`, and `MUSIC_ARTISTS` (name and slug, in `order`) from `artists/*.md` — the way `styles:codegen` writes `styles/_tokens.scss`: committed, exits non-zero when it had to write, wired into `vet.sh` beside it. `MusicAlbum` and `MusicProject` stay literal unions, so a song's misspelt `album:`/`project:` still fails the build exactly as today, an album's `artist:` now fails the same way, and every `MusicProject`-typed call site and script (`render-og`, `scaffold-song`, `list-untold-songs`) is untouched.

Rejected: **the existence check in the schema** (`z.string().refine(exists)`). Nothing hand-written would need exhaustiveness any more, but `MusicAlbum`/`MusicProject` would degrade to `string` (or a brand) across ~30 call sites, and the three scripts would each need a node-safe directory reader in place of the `z.enum` they use now. **Generating the whole registry into TS** — titles and glosses too — would keep everything node-safe, but recreates the duplicate the review objected to, generated or not.

A stale `names.ts` in a deploy is loud either way: an album file with no enum entry fails the first song naming it, and an enum entry with no file fails the loader, which throws on a missing album/artist file rather than returning `undefined`.

## Steps

1. **Schema** (`shared/music-catalogue/frontmatter.ts`): lift the song locale-`title` value into `localTitleSchema`; `albumFrontmatterSchema` and `artistFrontmatterSchema` extend `catalogueFrontmatterSchema`'s per-locale hook block with it (`title`/`artist` for albums, `name` for artists), `artist` validated against `MusicProject`.
2. **Generator** `scripts/generate-music-names.ts` (bare Node, gray-matter for `name`/`order`) → `names.ts`; `package.json` `music:codegen`; `vet.sh` beside `styles:codegen`. Fails on a duplicate `name` or `order`.
3. **Data move**: write the 26 frontmatters from `MUSIC_ALBUMS`, `PROJECT_DISPLAY_NAMES`, `PROJECT_GLOSSES` and the old `MUSIC_PROJECT_NAMES` order; run the generator; diff the generated arrays against the old ones (same members).
4. **Readers**: `albums.ts` reads `albums/<slug>.md` once (memoized per album) via `loadProse`, becoming `server-only`; `catalogueText`'s album/artist loaders share the same read rather than parsing the file twice. Artist lookups (`projectName`, `projectGloss`, `artistSlug`) move to `artists.ts`, also `server-only`; `projects.ts` keeps `songRepositoryUrl` and `bill`, pure, so `projects.test.ts` still runs under Node (its slug-uniqueness case goes — file names are unique by construction).
5. **Consumers**: `music-urls.ts`, `music-route-params.ts`, `catalogue-text.ts` take the slug from `MUSIC_ARTISTS`; `pictures.ts` keeps calling `albumCover`. Check `render-og` still renders artist collages (it runs under `react-server`, so `server-only` resolves empty).
6. **Prose**: `.claude/rules/songs.md` § "Frontmatter" — the enums are generated from the album and artist files, and the hook paragraph's "a frontmatter holding nothing else" changes; `albums.ts`/`names.ts` docstrings.
7. Vet; `/preview` the music index, one album (`vagabond`, both locales) and one artist (`yoohie`, `ru`) to confirm names, glosses and covers read the same.

## Progress (paused for the context budget)

**Done** — the commit after the plan flip:

- Step 3's data move: all 32 album and artist files carry the frontmatter above (26 created). Each artist's `order` is its index in the old `MUSIC_PROJECT_NAMES`, 1-based. The registries in `albums.ts`/`projects.ts` are still in place and still what the pages read, so the tree builds unchanged.
- Step 1's schema, in `shared/music-catalogue/frontmatter.ts`: `localNameSchema` (the song's locale `title` value, now shared), `projectSchema`, `albumFrontmatterSchema`, `artistFrontmatterSchema`. Not yet exported from `index.ts`. `catalogueFrontmatterSchema` is kept until `catalogue-text.ts` moves to the new two — delete it then.

**Left**, in this order:

1. Step 2, the generator. `names.ts` also holds the hand-written `MUSIC_ORGANIZATION`, used by `projects.ts` and `scripts/scaffold-song.ts` via `index.node-safe.ts` — move it out (e.g. `organization.ts`) before `names.ts` becomes generated. `scripts/vet-songs.sh`'s `INPUTS` regex names `names.ts` and matches only top-level `music/*.md`; widen it to `albums/`/`artists/` if the untold list should re-run when those change. `scripts/list-untold-songs.ts` reads only `MUSIC_PROJECT_NAMES`/`MUSIC_ALBUM_SLUGS` — unaffected.
2. Steps 4–5: readers and consumers. `albumTitle` spells with `language: 'ru'` regardless of locale, as today; keep that. `catalogue-text.ts` is the natural single loader for both readers (it already `loadProse`s these files) — memoize per name there.
3. Check what an album page's `.md` header link does now that every album has a file, even a frontmatter-only one (`catalogueText` returns `markdown` whenever the file exists).
4. Steps 6–7, then `/go` Step 3 onward.

## DRY notes

- **Reused**: `loadProse` and `catalogueFrontmatterSchema`'s hook rule; the song's locale-`title` shape, extracted once and used by songs, albums and artists; `generate-styles.ts`'s write-and-fail-on-drift contract, mirrored rather than shared — the two generators share only "write a file if it differs", three lines not worth a helper module across a bare-Node script boundary.
- **Removed duplication**: an album's or artist's existence was stated in the enum, the registry and (for some) a `.md`; it becomes the `.md` alone, the enum derived.
- **Not extracted**: the album and artist readers stay two small functions over `loadProse` rather than a generic "catalogue entity" loader — two callers, different fields.

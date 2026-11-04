# unsquatted: one catalogue file, varied blurbs, a hundred names of other forms, three UI fixes

## The ask, item by item

1. **The copied-image toast** — bigger and on screen longer.
2. **Shortlist → Edit** focuses the textarea.
3. **One catalogue file** instead of a hundred `public/picks/<domain>.md`.
4. **Blurbs** — the last run's ninety all read "X y. A z or a w." Recast the
   ones that read better in another shape; keep the rest.
5. **A hundred new names in other forms** — rare words, dropped letters,
   coinages, domain hacks — not more two-word compounds.
6. **Copy as image** lists only the shown zones' free domains, because the zones
   under the fold are looked up only once that toggle is pointed at.

## Order

3 first: 4 and 5 edit the catalogue, so they edit the new file. Then 4, then 5
(the runbook learns from both), then 1, 2, 6 in any order.

## 3 — The catalogue file

**`src/unsquatted/pages/home/deck/model/picks.yaml`**, a map keyed by domain,
beside the loader that parses it:

```yaml
foxedpage.com:
  category: book trade
  blurb: Foxing is the brown spotting on old paper. A used-book shop or a reading app.
  score: 9
  added: 2026-10-29
```

- **YAML over JSON/CSV**: the blurbs are prose, so CSV fights commas and JSON
  fights quotes; YAML is what the frontmatter already was, so every field reads
  the same. Keyed by domain, a duplicate is a parse error (`yaml`'s default
  `uniqueKeys`) rather than a silent overwrite.
- **Parsed with `yaml`** (eemeli), added as a direct dependency — `js-yaml` is
  only gray-matter's transitive one. Dates stay strings in YAML 1.2 core, which
  `z.coerce.date()` reads.
- **Under `src/`, not `public/`**: nothing serves it, and `public/picks/` was
  there for articles that do not exist. The directory goes; CLAUDE.md's layout
  line about collections is unaffected (no other site's collection changes).
- `picks.ts` reads one file instead of a directory; the `<domain>.md` name check
  becomes a key check. `ledger.ts`'s header, `RUNBOOK.md` and the runbook's
  axis-listing one-liner point at the file.

## 4 — Blurbs

Rewrite only where another shape reads more naturally — a question, a "for …"
clause, a single sentence, the evocation alone with the use folded in. Expect
roughly a third to a half of the ninety. The runbook gains a line: vary the
shape; "X. A y or a z." is one shape among several, not the template.

## 5 — A hundred names of other forms

`pnpm names check` takes a bare label as `.com` today; it learns to take a full
domain too, so a domain hack (`label.zone`) goes through the same lookup and
ledger. A hack's zone must answer RDAP (the page can then re-check it) and be on
Porkbun's price list.

Forms to spread across, roughly evenly:

- rare or obsolete real words, alone or with a light affix;
- dropped letters / respellings (`flickr`-style);
- coinages built from other words (portmanteaus, Latin/Greek roots, suffix
  play);
- domain hacks (the zone finishes the word or phrase);
- short phrases that are not noun+noun (verb phrases, three-word phrases).

The runbook's "What a pick is" says compounds are where free `.com` names are;
it gains a section on form, spreading a run across forms the way it already
spreads across axes, and the hack rule above.

## 1, 2, 6 — UI

- **1**: `TOAST_WIDTH` 200 → 300; the `swept` animation 900 ms → 1600 ms (hold
  to ~55 %). `COPIED_MS` (2000) still outlasts it.
- **2**: the `Editor` focuses its textarea on mount, caret at the end.
- **6**: opening the share menu (or pointing at / focusing its button) marks the
  hidden zones wanted, exactly as the "more zones" toggle does, so by the time
  "Copy as image" is pressed their lookups are in. `FieldTools` takes an
  `onWanted` from `NameChecker`.

## DRY notes

- **6** reuses `NameChecker`'s existing `wanted` state — one more caller sets
  it, no second lookup path.
- **3** keeps `pickSchema` as is; only the reader changes. No shared YAML
  loader: this is the repo's only YAML data file, so a helper would have one
  caller.
- **5** extends `parseCandidates` in place rather than adding a second parser
  for hacks.
- **2** a ref + effect inside `Editor`; no shared autofocus hook — one caller.

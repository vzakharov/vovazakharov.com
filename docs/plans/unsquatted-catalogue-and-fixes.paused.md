# unsquatted: one catalogue file, varied blurbs, a hundred names of other forms, three UI fixes

## Status — paused for the context budget

**Done, all pushed:** 3 (`5fd589d8`), 1/2/6 (`b991b6bb`), 5 (`3e0f501f` forms +
hack support, `276fb8fd` 137 names, ledger, OG card), the runbook.

**Item 4 changed on the operator's word.** Recasting blurbs read as ad copy, so
it was reverted (`97876cc6`) and the opposite done: one template for every
blurb. Then, at the operator's suggestion, an entry holds `tagline` + `uses`
(1–3, bare) and `deck/lib/uses.ts` composes "Tagline. A x, a y or an z." with
a/an by sound (`da858d61`). The § "4 — Blurbs" below is superseded.

**Added beyond the plan:** a `form` field (compound | phrase | word | respelling
| coinage | hack) on every entry, so a run can count forms; the runbook says how
to spread across them.

**Left:**

- `/go` Step 3 (`/polish`), then Step 4 (`/pr` refresh). The PR body and the
  squash proposal still describe the plan's version of item 4 (recast blurbs)
  and lack `form`/`tagline`/`uses`; the squash should give the true form counts
  of the 137: 62 hacks, 20 phrases, 28 coinages/invented places, 17 words, 10
  respellings (commit `276fb8fd`'s body miscounts them).
- `/preview` the three UI fixes (toast size/timing, editor focus, card rows for
  `reconquista`) — not yet looked at in a browser.
- Open question to the operator, unanswered: add a sixth form, "a word in a
  meaningful zone" (`murmur.studio`)? Not a hack and not `.com`, so it changes
  what the site calls a free name; left out until they say.
- About 80 `.ing` candidates went unanswered (Google's RDAP throttling); they
  are in no ledger, so a later run can try them.

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

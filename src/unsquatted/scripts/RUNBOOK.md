# unsquatted's naming runbook

What "запусти ранбук" runs: adds free names to unsquatted.com's list, ten unless
the operator names a count, and retires listed names someone has since
registered. `pnpm names` (`names.ts` beside this file) is the mechanical half;
the rest is taste.

## What a pick is

- **Free**, registrable today by anyone at the zone's ordinary price — never a
  name the run, the site or the operator registers, and never a registry premium
  or reserved word, which RDAP reports as unregistered. Nothing here serves
  domain investors.
- **In `.com`, unless the zone finishes the name** — a domain hack,
  `mudlark.ing`. A hack's zone answers RDAP, so `check` prints it `free` rather
  than `maybe`, and is open to anyone, which rules out the country zones that
  ask for a local presence (`.ca`, `.au`, `.id`). New zones price their
  dictionary-like names as premium, so most hacks that read well are: of 62
  checked once, 40 were (`touchst.one` at $1,092 a year).
- **One pattern is one idea.** A hack states its `pattern`, a mask over the tail
  its zone spells the word's end with — `*st.one` for `touchst.one` and
  `lodest.one` alike. Several on one pattern read as one name repeated: hold a
  run to one or two, and the social card shows one per pattern.
- **Spread across forms**, the `form` field: `compound`, `phrase` (anything not
  two nouns joined), `word` (a real one, however rare), `respelling` (a dropped
  or swapped letter), `coinage` (a made-up word), `hack`. The common real words,
  short coinages and myth names are taken, mostly since the 1990s, which pulls
  every run toward compounds; a run that lands mostly one form has drifted. The
  rare ones are where single words are still free — `hodiernal`, `uhtceare` —
  and hacks in a zone like `.one` or `.eat` are barely touched.
- **Not the first thing that comes to mind.** Other models name things too, and
  their first thoughts get registered: `umbrapoint`, `parallaxdesk`,
  `graniteowl` were all taken in 2026. The second or third idea on an axis is
  where the free ones are.
- **Something a person could build on**: a shop, a studio, a newsletter, a tool.
  Its `uses` name two of those.

## Go wide, not deep

A run that starts from what is listed finds more of the same, and the list grows
rich in whatever it already holds. So a run rules out everything already tried
and goes elsewhere on purpose — the Clerk's method
(`.claude/skills/file-basilisk-case/SKILL.md` § "Search wide, not deep"):

- **Every name ever checked is ruled out**: the ledger (`ledger.jsonl`, taken
  and taste rejections) and every entry in the catalogue,
  `src/unsquatted/pages/home/deck/model/picks.yaml`, shown or not.
  `pnpm names check` skips them itself.
- **Axes are chosen away from the used ones.** An axis is a direction a name
  comes from: a trade's vernacular, a sport, a kitchen, weather, a sound
  pattern. List the used ones first, then pick new ones from far corners — other
  trades, other centuries, other senses:

  ```bash
  { jq -r .axis src/unsquatted/scripts/ledger.jsonl; grep -h '^  category:' src/unsquatted/pages/home/deck/model/picks.yaml | cut -d' ' -f4-; } | sort | uniq -c | sort -rn
  ```

- **Roll the dice when a run converges** — when the candidates start sounding
  like each other, `pnpm names roll` prints random word pairs, the page's own
  dice; the good ones go in under the axis `dice`.
- **A run spreads its picks**: at most two from one axis, and a category the
  list already holds several of waits for another run; across forms, it leans
  toward whichever the list holds least of
  (`grep -h '^  form:' src/unsquatted/pages/home/deck/model/picks.yaml | sort | uniq -c`).

**`picks.yaml` is read by command or by line range, never whole**: at two
hundred entries and over a thousand lines it fills a session's context and
anchors the brainstorm on what is already there. `grep` the field wanted, as
above, or `Read` an entry's lines once `grep -n '^<domain>:'` has found it.

## Steps

`pnpm names` asks Porkbun's keyed `checkDomain` about every name RDAP calls
free, so it needs `PORKBUN_API_KEY` and `PORKBUN_SECRET_API_KEY` set.

1. **Retire what was taken.** `pnpm names recheck` prints each listed name no
   longer free. Give each one `shownUntil: <today + 14 days>` — it stays listed
   two weeks, marked taken, then leaves the list; its entry stays. An `unknown`
   line is a lookup with no answer: re-run before reading anything into it. A
   `premium` or `reserved` line was never free at the ordinary price: its entry
   moves to the ledger under that verdict.
2. **Brainstorm** several times the names wanted — about four candidates per
   pick, since most compounds that sound good are taken — as `axis<TAB>name`
   lines in a file under `tmp/`, several new axes per run. A bare name is
   checked in `.com`; a hack is written as its domain, `touchst.one`.
3. **Check them**: `pnpm names check < tmp/<file>.tsv`. Taken names go into the
   ledger by themselves, and so do premium and reserved ones; the rest print as
   `free<TAB>axis<TAB>domain`, or `maybe` where the zone has no RDAP. Brainstorm
   again from new axes until the free ones outnumber the picks wanted. A
   registry that throttles answers nothing for a stretch, and the run ends
   listing those names: re-check them later rather than in the same minute.
4. **Pick by taste**, under the spread above. Each pick is an entry in
   `picks.yaml`, appended under the run's date:

   ```yaml
   foxedpage.com:
     category: book trade
     tagline: Foxing is the brown spotting on old paper.
     uses:
       - used-book shop
       - reading app
     score: 9
     form: compound
     added: 2026-10-29
   ```

   `category` is the axis in two or three words. `tagline` is one sentence on
   what the name evokes or means — plain information, not a pitch. `uses` names
   who could build on it, usually two, bare: the page adds the articles and the
   "or", so every blurb reads "Tagline. A x or a y." `score` places the name on
   the list's scale (read the existing picks' scores first; 9 and up is the
   list's best, below 5 its weakest); a float, so a name slots between two
   others. A hack adds `pattern` (§ "What a pick is").

5. **Record the free names not picked**: `pnpm names reject <axis> <domain>…`,
   so no later run checks them again.
6. **Land it.** Re-render the social card (`pnpm content:og unsquatted`), commit
   the picks, the ledger and the card on a branch, and open the PR (`/pr`). The
   squash subject is `feat(unsquatted):`, which publishes the site alone.

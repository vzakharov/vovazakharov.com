# unsquatted's naming runbook

What "запусти ранбук" runs: adds free `.com` names to unsquatted.com's list, ten
unless the operator names a count, and retires listed names someone has since
registered. `pnpm names` (`names.ts` beside this file) is the mechanical half;
the rest is taste.

## What a pick is

- **Free in `.com`**, registrable today by anyone for the registry's price —
  never a name the run, the site or the operator registers. Nothing here serves
  domain investors.
- **A compound or a phrase.** Every real single word, short coinage, myth name,
  historic unit and obscure-word-of-the-day is taken, mostly since the 1990s;
  the ledger holds the proof.
- **Not the first thing that comes to mind.** Other models name things too, and
  their first thoughts get registered: `umbrapoint`, `parallaxdesk`,
  `graniteowl` were all taken in 2026. The second or third idea on an axis is
  where the free ones are.
- **Something a person could build on**: a shop, a studio, a newsletter, a tool.
  The blurb names two or three of those.

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
  list already holds several of waits for another run.

## Steps

1. **Retire what was taken.** `pnpm names recheck` prints each listed name no
   longer free. Give each one `shownUntil: <today + 14 days>` — it stays listed
   two weeks, marked taken, then leaves the list; its entry stays. An `unknown`
   line is a lookup with no answer: re-run before reading anything into it.
2. **Brainstorm** several times the names wanted — about four candidates per
   pick, since most compounds that sound good are taken — as `axis<TAB>name`
   lines in a file under `tmp/`, several new axes per run.
3. **Check them**: `pnpm names check < tmp/<file>.tsv`. Taken names go into the
   ledger by themselves; the free ones print as `free<TAB>axis<TAB>domain`.
   Brainstorm again from new axes until the free ones outnumber the picks
   wanted.
4. **Pick by taste**, under the spread above. Each pick is an entry in
   `picks.yaml`, appended under the run's date:

   ```yaml
   foxedpage.com:
     category: book trade
     blurb: Foxing is the brown spotting on old paper. A used-book shop or a reading app.
     score: 9
     added: 2026-10-29
   ```

   `category` is the axis in two or three words. The blurb is one or two short
   sentences: what the name evokes, then who could use it. `score` places the
   name on the list's scale (read the existing picks' scores first; 9 and up is
   the list's best, below 5 its weakest); a float, so a name slots between two
   others.

5. **Record the free names not picked**: `pnpm names reject <axis> <domain>…`,
   so no later run checks them again.
6. **Land it.** Re-render the social card (`pnpm content:og unsquatted`), commit
   the picks, the ledger and the card on a branch, and open the PR (`/pr`). The
   squash subject is `feat(unsquatted):`, which publishes the site alone.

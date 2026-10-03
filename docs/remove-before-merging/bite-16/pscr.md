# P-scripts — `/tend-prose` over bite 16's tail under `scripts/` and the megabeast notes

Scope: the prose `git diff 8abc5a66..origin/claude/mushroom-game-syama-lbirv7
-- scripts .claude/skills/megabeast` added or changed, all four lenses. Prose
only; no behaviour change.

## Done

One commit, `polish(prose bite 16 tail scripts): …`:

- `mushroom-probe-instruments.ts`: header trimmed (the "evaluated in the
  page" clause `mushroom-probe.ts` already states); the footstep counter's
  "whether or not the sound is on" — the mute's residue — restated as what
  holds now (counted before the voice's audio check).
- `mushroom-probe-reads.ts`: `map`'s docstring no longer half-lists the
  fields `MapShown` documents; says where the `null` is.
- `play-map.ts`: header re-told in the order the play runs (it had the
  picker step after the growing); `shut`'s docstring trimmed.
- `play-worms.ts`, `play-meadow.ts`: headers reflowed to the column.
- `play-mushrooms.ts`: header's hand list of play modules (missing
  `play-map.ts` and `play-runs.ts`) replaced by a pointer to `PLAYS`.
- `veer-watch.ts`: `viewOf` cited in `pinhole.ts`, where it moved.
- `megabeast/notes/gates.md`: bite 15's sentence de-ambiguated ("it judged").

## Judged and left

- `play-worms.ts` `SWINGING`: "less the two a tap steps" against a `- 1`
  in the code — may be a miscount in the comment or the constant; settling it
  needs a play run, which is behaviour, so left.
- Moved comments in the four probe modules are verbatim from the old
  `mushroom-probe.ts` and none narrates the split.
- The megabeast notes keep their what-happened / what-the-skill-should-do
  shape; only the one ambiguity was touched.

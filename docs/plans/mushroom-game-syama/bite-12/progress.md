# Bite 12 — progress and relays

What bite 12 built, package by package, and where each relay left it. Moved verbatim from the plan's `## Rest of the bite`; a hand-over note's "item N" means the plan's old `**Left, in order:**` list, its items kept here with their numbers.

**Built so far** (each package's hand-over note under
`docs/remove-before-merging/bite-12/` names its API and departures; the
departures were taken):

- Step 0: the eye and pinhole view (`model/ground.ts` `Eye`, `viewOf`;
  `ui/scene/view.ts`), `model/cruise.ts`, the heading pan, `model/stride.ts`
  (`step0-eye.md`, `step0-cruise.md`).
- P1: the grass is a lawn again, every tuft a planting spot (81ffe900); the
  beds `follow(view)`, the retap restart, the haze queue (`p1b-beds.md`);
  the grass through the view (21d9fc8f, `p1c-grass-taps.md`).
- P2: clouds in lanes so no view is empty, the sun, glow and wash by
  azimuth, the live hills (measured: ~0.5 ms a frame against a baked
  strip's ~100 ms rebakes), the land in screen rows without mottles
  (`p2-panorama.md`).
- P3: `model/walk.ts` and `eye-input.ts`, ↑/↓, footsteps, keys only
  through flowers in view (`p3a-input.md`); the scene wired, the bob,
  things past the seam behind the hills (0dfbc9e7, `p3b-wiring.md`); the
  insects through the view (579c7312, `p3c-insects.md`).

**Where the relay at depth 8 left it** (each line's note under
`docs/remove-before-merging/bite-12/`): `pnpm type-overlap`'s groups fixed
(5c7a7b43, `type-overlap.md`); `decisions.md` rewritten (b2fb9fd1); the
fold done — `bite-12.md`, the summary, row 12, the elephant reworded
(181167e8, 34354853); item 4b built (d4028a5a, `key-plants.md`); the
opening, approach and seat plays (4fa8349a); a perched insect drawn where
its cap or flower draws the seat, 0.00 px through a turn on tabL and
phoneP (c8c32263, `seat-fix.md`); the keys play and the probe's seat read
(9ac52e0f, b0a652bb) — tabL passes every play at b0a652bb but the frame
budget. **The frame budget fails on an idle machine** (33.5 ms median
walking into the forest and turning at the closest approach, against 26;
21.4 ms over the whole screen). **Decided: spec §5's mitigation, raise
`V_NEAR` first**, measured until the forest walk holds 26 ms, then judged
on frames that a near mushroom does not vanish too early for a child;
beaten: relaxing the budget, which is the measure the game keeps. Left:
the released-insect fix (`insects.md`), the `V_NEAR` fix, then the five-screen
run at the final HEAD with its frames (`play-final.md`: split each screen
by `--plays`, the full set takes ~9 min on tabL), the phoneL edge flower
judged; then the review subagent (§ "How this elephant
is eaten" step 2) and its fixes; delete this section; `/polish`, vet, the
Artifact, `/pr`. **Also, by a subagent:** the context-budget hook gives a
subagent its own notice at ~170k from its own transcript — commit what
passes, note current, report — instead of exiting on `agent_id`
(operator: «сделай, подагентом в следующей сессии»; see
`.claude/skills/megabeast/notes/subagents.md`). **Every build agent works
in its own `git worktree`** in the scratchpad (outside the repo, `pnpm
install --offline` there), committing and pushing to the branch from
there with `git pull --no-rebase` first, so the shared checkout stays
clean, the Stop hook's git check stays quiet, and no agent's half-done
edit reaches another's typecheck (operator, after a first «не надо»:
«пусть делают в worktree, мы же от этого ничего не потеряем?»). The
common brief's shared-tree rules change with it.

**Where the relay at 13:00 on 1 Oct left it.** Done: the subagent notice
(8bf5044, `subagent-notice.md`), the arrival and depth scale, the dash cap.
Running when it relayed, in that session's container, pushing here: `v-near`
(the frame budget, `v-near.md`) and `drop-in` (the rise from behind the
brow, `drop-in.md`) — read their notes and `git log` before briefing
anything on their files. **Open with the operator: a full turn takes 16.5 s
of a held key** (`TURN_CRUISE` 0.38 rad/s; the heading wraps, checked), and
behind the meadow is bare grass, so the operator turned and saw «бесконечная
поляна», never the circle closing. Their answer decides between a faster
turn (an acceleration while held, or a higher cruise) and something to
see behind. Left after that: the five-screen run with frames, the phoneL
edge flower, the review subagent and its fixes, delete this section,
`/polish`, vet, the Artifact, `/pr`.

2. Done (fff4e84, e9a6f995, `split.md`): `insect-view.ts` 349,
   `meadow-scene.ts` 408. `pnpm type-overlap` fails on 5 groups that
   predate the split (`Shown.bob` / `Stepped.bob` among them) — the
   bite's end fixes them before vet.

<!-- the old list's item 5 -->

5. The bite's end: `decisions.md` rewritten where the spec names, the
   fold into `## Eaten so far`, `/polish`, vet, the Artifact, `/pr`.

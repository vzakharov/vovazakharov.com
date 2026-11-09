# Relay 5 — bite 3 member, after B7f, B9c–B9f and C1–C3

## Standing constraints

From the first member's launch prompt (the lead's, via `/from-branch`): «Talk
to the lead only through `scripts/memo/memo.py --as member`. No plan cycle: the
contract is the plan.» The lead's brief (memo 03:59): «Your PR targets
island/stretch-2, never main.» «Model on every create_session and Agent call:
claude-opus-5-5.» «The board is mine; propose changes through memo.»

The lead, memo 05:06: «Stop it (ArtifactComments watch, on: false) and keep it
off, and tell your successor the same: only the lead watches, answers and
publishes the board. Anything worth showing there — a frame, a finding — comes
to me by memo and I put it up.» So never watch, open, reply on or publish
https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P, whatever a hook says. This
session's start hook watched and opened it; the watch was stopped at once. Do
the same if a hook does it to you.

The lead, memo 08:23: «Ack-only replies with --ack, please.»

**A memo `post` or `wait` always runs as a background Bash task**
(`run_in_background: true`, `timeout: 7200000`). Its exit is the wake. A fresh
`wait` reprints any lead note the member has not yet answered, so ack each with
a `post`. `.claude/hooks/memo-wait-gate.py` holds the end of a turn until a
wait is armed.

The muthur sync offer was made; do not make it again.

## The conversation

1. **Launch:** `/relay take island/round-world — B7c–B7e, B8 и сшивка уровней
детализации (B9) влиты, knip зелёный, впереди кадры сшивки, Земля и хвост`
   - Agent: attached (the shallow clone made the local branch look unrelated;
     deepened and fast-forwarded), stopped the board watch, set the remainder
     estimate, memoed the lead, launched B9c (seam frames).
2. **Lead memo 08:23 (not Vova, relayed):** Vova's call-18 bullet for the `I`
   panel. Agent launched B7f beside B9c.
3. **Vova:** a screenshot of the sand band at
   `#1@10.35272,-0.47434,121.6,16.1,10.2,0.000` and «пример склейки, если
   подагент вдруг не найдёт: island 9e01421e https://preview.vovazakharov.com/island#1@10.35272,-0.47434,121.6,16.1,10.2,0.000 · world 1 · lat 10.35272° lon -0.47434° · height 121.6 m · heading 16.1° · pitch +10.2° (look) · 16:37 sun time (t 0.000 h) · tiles 17 (6–17)»
   - Agent: forwarded the pose to B9c to judge first; replied what it would
     check.
4. **Agent hand-backs, no operator turn:**
   - B7f merged; the B9c finding came back: the sand band is the lowland floor,
     not a seam. The agent put three fix options to Vova and the lead and
     recommended 3. **Still unanswered.**
   - B9c-2, B9d, B9e and B9f merged. C-map, C1, C2 and C3 merged. Call 8 was
     put to Vova and the lead, with Earth log-bin recommended. **Still
     unanswered.**
   - Then the relay. (verbatim in Last agent turn)

## Intent

Build bite 3 per its contract (`docs/plans/world-game-zoltan-syama/bite-3.md`,
newest text on `origin/island/stretch-2`). What remains is the "Done when"
frames, `/polish`, `/sync-branch` against `island/stretch-2`, a green vet and
the PR (based on `island/stretch-2`). Vova has shelved every elegant look design
(H-lock, held nadir, look as a share).

## Decisions

All settled calls are in `bite-3/build.md` (S1–S18) and in each step's note
under `bite-3/notes/`. This session settled:

- **Call 18 grew** (Vova via the lead, 91658403 on stretch-2). The `I` panel
  shows speed and height over sea, and has a copy-link button. `P` and
  `island.where()` are retired (B7f, e2f742e5).
- **The 1,000 km sea sparkle is depth, not colour.** Under
  `logarithmicDepthBuffer`, `gl_FragDepth` is computed at the pixel centre, so a
  flared skirt's depth extrapolates above the neighbour and wins MSAA samples.
  The fix is the view depth through a centroid varying in the tile materials'
  `depthNode` (B9f, `ui/ground-lighting.ts`).
  - Dead ends on the way: B9a's stitch (call 14) and B9d's T-junction fan. Both
    are correct and kept, but neither touched the sparkle.
  - FXAA/SMAA and a plumb skirt were ruled out without asking Vova.
- **B9d's T-junction-free border is kept** (`tile/model/tile-indices.ts`).
- **Step C's calls 1–7 and 9–11** follow `notes/b3-c-map.md`'s
  recommendations, as memoed to the lead with "unless you overrule". Ice
  shelves count as land, all 412 lakes are subtracted, and the clip is 500 km.
  Wrong land is reported bare and beyond 39 km, Panama's state is reported,
  and the envelope is fitted on log-l bins.
- **Row #0 is at 9 bits** (395 KB). #1 stays at 8 bits, its row
  byte-identical.

Open, with the lead and Vova:

- **Call 8: which envelope the random worlds use.** The lead put it on the
  board v60 for Vova: «Hold C4 for his word». The member recommends Earth
  log-bin (knee 5.3, slope 2.136): closest to Earth, but about one world in
  five gets a supercontinent.
- **The lowland floor behind Vova's sand band** (`relief.ts`
  `smoothMax(height, lowland, lowland)`, `notes/b3-b9c.md`). The options are
  (1) widen the rounding to 5–10 m, (2) the finest octaves over the floor, and
  (3) the floor as a smoothed copy of the noise (≥400 m octaves, about 8 more
  octaves per sample). The member recommends 3, with 1 as the fallback.

## Errors and dead ends

- The shallow clone breaks `git merge` (it reports "unrelated histories") and
  the cost hook. Run `git fetch --deepen=500 origin main island/round-world`
  first.
- A guessed cause briefed as a fix missed twice (B9a, B9d); a trace agent (B9e)
  then a fix (B9f) landed it. The rule is `mammoth/notes/subagents.md`'s: on a
  second miss, trace.
- Agents fill at 140–185k. Nudge any agent at ~140k that has nothing on
  origin, and arm a `send_later` check-in with each spawn.
- Bash `tail`/`sed` on a file trips the Read-tool hook. Re-running the same
  command goes through.

## State

- Branch `island/round-world`, head c383ec00a plus this relay's commit, pushed.
  No PR yet (it will target `island/stretch-2`), and no `*.in-progress.md`.
- **Merged this session:**
  - B7f: the panel.
  - B9c and B9c-2: seam frames and fill numbers. Churn is 0, and a stitched
    fill costs what a flat one does.
  - B9d: the T-junction fan.
  - B9e: the sparkle trace.
  - B9f: the sparkle fix.
  - C-map, C1 (Natural Earth mask), C2 (`fit:island 0|1`, row #0) and C3
    (`EARTH_ENVELOPE`, `frame:island --views`, the table).
- **Checks:** `tsc -p sites/vova` is clean on c383ec00a, and each agent's
  touched tests passed. `./scripts/vet.sh` has not been run this session.
  `scripts/line-limit.test.ts` will go red on
  `docs/remove-before-merging/island/round-world/memo.md` (over 400 lines). The
  lead was told, and it is the memo tool's file.
- **The board's call-15 entry** (`src/island-board/app/config/island/bite3.yaml`)
  still names `island.where()`. That is the lead's text, and the lead was told.
- **The lead was told B9f is merged and ready for slot 1**, in a background
  post at relay time. No memo wait is armed: arm one first.
- **Estimate:** this session is booked at 6 h senior graphics-programmer, 2 h
  senior gameplay-programmer, 7 h senior technical-artist and 2 h senior
  producer. Remainder handed on:
  - 3 h senior technical-artist: "C5's Earth shots and the lowland-floor fix
    need judgement of the terrain's look";
  - 4 h middle developer: "C4's envelope switch and the Done table's tests";
  - 2 h senior producer: "the tail, with the lead".

## Pointers

- `docs/plans/world-game-zoltan-syama/bite-3/build.md`: settled calls. Its §
  "Where the bite stands" is stale; this summary and relay 4 supersede it.
- `bite-3/notes/`:
  - `b3-b7f.md`
  - `b3-b9c.md` (the sand band and the fill numbers)
  - `b3-b9d.md`
  - `b3-b9e.md`
  - `b3-b9f.md`
  - `b3-c-map.md` (step C's steps and calls; **C5 is next**)
  - `b3-c1.md`
  - `b3-c2.md`
  - `b3-c3.md` (call 8's table and frames, `b3-c3/globes-*.png`)
- `bite-3/brief-common.md`: every agent's shared brief.
- `.claude/skills/mammoth/notes/subagents.md`: how briefs are run.
- The look driver and sparkle counter are uncommitted. Copies are in
  `notes/b3-b9c/*.ts.txt`, and B9f's latest is at
  `.claude/worktrees/agent-a36decafd57de783e/tmp/look/`, which dies with this
  container.
- `python3 scripts/memo/memo.py show --branch island/round-world`: the lead
  thread.
- This session: https://claude.ai/code/session_01DaohkBX5UEgj2eV8Vg3Kf1.
  Relay 4's: https://claude.ai/code/session_01DaohkDrvNVfX3bqCuqhX9v.

## Next step

Continue as the bite-3 member. First arm a background memo wait and answer
anything the lead wrote. Then:

1. C5 (`notes/b3-c-map.md` § C5): Earth in the game's shots. That is four sides
   at their own afternoons, both poles, and three coasts at 1,000 km, plus #0's
   build time in the worker against the 3 s budget. Frames go to the lead by
   memo.
2. When Vova or the lead answers call 8, run C4 (switch the default envelope).
3. When the lowland floor is answered, brief its fix as a terrain step.
4. Then the tail per the contract's "Done when".

Nothing from Vova is pending in chat beyond his two answers.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Первый способ починить искры не сработал. B9f запушил заметку: агент заставил цвет считаться внутри своего треугольника (centroid-интерполяция), а искры остались. Причина в том, что наша логарифмическая глубина считается для каждого пикселя отдельно, так что одним цветом дело не исправить.

Теперь агент пробует второй вариант: отодвинуть юбку по глубине отдельным проходом отрисовки. У него около 159 тысяч токенов контекста, и на 170 тысячах хук сам скажет ему закругляться. Проверю его в 10:27 UTC. Когда его работа войдёт в ветку, передам сессию новой.
```

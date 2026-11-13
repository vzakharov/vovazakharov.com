# Relay 2 — the cube's intro, parked a second time

Written 2026-11-13 by the second lead, `session_016Z4TKo8Y7vUYevAQEstous`, which
took the branch from `relay-1.md` on a different account than the one that built
it. `relay-1.md` beside this file stays the record of the build itself; this one
carries only what happened since.

## 1. Standing constraints

The operator's words, verbatim, from the build's opening message (2026-11-12):

> суть, кратко: ты делаешь, что хочешь, создаёшь каких хочешь подагентов и
> подсессии, они НЕ создают свои пиары, но полируют свои ветки, потом ты их
> забираешь. Спрашивать меня не останавливаешься, но сейчас, после первого
> сообщения, можешь задать мне вопросы, которые считаешь самыми важными, и на
> которые я один раз отвечу. На самом деле я потом ещё много буду встревать,
> чтоб steer-нуть туда или сюда, но, так сказать, спорадически.

> предупреждения о пределе релея игнорируешь, у тебя тут автокомпакт на 400к (на
> самом деле на 370к, 30к харнесс берёт запас -- зачем-то); трактуй два
> предупреждения (330к и 350к) как соответственно "с этого момента лучше не
> начинать чего-то большого" и "с этого момента нужно заканчивать большое, чтобы
> после автокомпакта не забыть, о чём речь".

The marks scale with the window the session actually has: read
`CLAUDE_CODE_AUTO_COMPACT_WINDOW` from the environment (`printenv`) and place
them the same distance under it. This session's was 300000, which is why it was
parked (§ 2, last message).

Second message of the build: «про /task и остальной луп: руководствуйся ими как
guidelines, не как жёстким требованием.»

The rest of the opening message's rules are verbatim in
`docs/plans/cube-intro.paused.md` § "Standing rules", and every later one in
`brief.md` and `journal.md` beside this file. The ones that forbid something, in
the lead's wording where the plan does not quote them:

- **Never merge to `main`.** Merge is deploy. The build is shown on preview slot
  2 only; slot 1 is PR 275's.
- **Children open no PRs** and push only their own branch; the lead pushes only
  `claude/cube-intro-j2wt34`. The PR goes through `/pr` with base
  `claude/cube-review-perf`.
- **No Russian on the design board**
  (https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3), and **the pill's
  colour-change story never goes to the board**.
- **Nothing authored** — `src/cube/CLAUDE.md` holds the four rules of the world.
- **Every frame is recorded with its eye, its clock and its commit**
  (`briefs/notice.md`, 11:25Z).
- **Exposure 0.3 and core's `daylightFilm` stay**; the approved frames were
  judged through them. **The sky stays as it is** (no dimmed ring round the sun,
  no painted hole).
- **The body's shadow does not come back; the cube's specks stay; no legs or
  trunk out of doors.**
- **Floor 1's clock is not derived from the sun**: «вредит трушности… лучше
  приму часы которые показывают неправильное время».
- The operator's e-mail address is private: it goes to no outside service.
- No lint-suppression comment without the operator's yes; never resolve or
  re-open a review thread; no model identifier in a commit, a PR or code.
- The Workflow tool only on the operator's explicit ask.
- Builders run on the flagship model, readers and coordinators on cheaper ones;
  children are written to in English.
- A session no longer needed is archived unasked, and named to the operator.
- The operator's voice entry: `.claude/voice/operators/vzakharov.md`.

From this session, the operator's own word on scope, which overrides
`relay-1.md` § 8's plan for a new team:

> по реализации есть ещё мелкие нарекания, но кончаются недельные лимиты,
> поэтому давай собирать как есть

So: **no new child team and no fix round** until the operator asks for one. Token
cost is the constraint behind it — weigh every expensive step (a review board
over four hundred commits, a long shoot) against it, and say what was skipped.

## 2. The conversation

1. **Operator**: `/relay take claude/cube-intro-j2wt34 — всё сведено в одну ветку
и зелёное, PR ещё нет, дальше сквозной прогон и превью`

   **Agent**: attached to the branch, read `relay-1.md` and the plan, renamed the
   plan to `in-progress`, started the keepalive, and began `relay-1.md` § 8.

2. **Operator**: «пока не забыл: добавить измерялку fps из
   claude/cube-review-perf (прочие части ветки, если они там есть, не надо)»

   **Agent**: nothing to add — this branch grew from `claude/cube-review-perf`,
   so the meter (`ui/frame-rate.tsx`, on `F`) and the GPU pass timer
   (`ui/pass-timer.ts`) are already in and wired in `cube-canvas.tsx`. With the
   PR based on that branch, its other parts stay out of this PR's diff.

3. **Operator**: «по реализации есть ещё мелкие нарекания, но кончаются недельные
   лимиты, поэтому давай собирать как есть»

   **Agent**: dropped the new team and the fix round; kept the preview on slot 2,
   one end-to-end strip, the draft PR and the vet run; left `/polish` to
   `/finalize`. Recorded in the plan's § "Since the resume".

4. **Operator**: «из релея видно, о чём я здесь говорил?» — with a screenshot of
   the first lead's session: the operator's «полоски куба вернули же уже как
   было, да?», the lead's answer that the bands were still construction grey
   with a variant A set uncommitted, then "5-hour limit reached".

   **Agent**: yes — `relay-1.md` names the bands as shell's unfinished piece;
   applied variant A by hand from the screenshot (a wrong guess, see § 5).

5. **Operator**: «я так понимаю что доснять он не успел» — a screenshot of the
   shell session starting a three-variant shoot (A today's finish darkened, B
   deep graphite satin, C today's).

6. **Operator**: «а, вот, усспел, берём второй» — a screenshot of shell's sheets
   `sheet-ladder-foot.png` and `sheet-approved.png` with A, B and C side by
   side, and shell's "Settled on variant B… committed and pushed variant B".

   **Agent**: reverted the hand-made A, merged `origin/claude/cube-intro-shell`
   (ce41033a) at a55c5a20, pushed, dispatched the preview again.

7. **Operator**: «ты можешь поменять на `CLAUDE_CODE_AUTO_COMPACT_WINDOW=400000`
   изнутри?»

   **Agent**: no — it is an environment variable of this account's cloud
   environment, set to 300000; it changes in the environment's settings and only
   a new session picks it up.

8. **Operator**: «мне здесь что-то написать надо было?» — a screenshot of the
   environment's "Network secrets" dialog, empty.

   **Agent**: no — Network secrets holds API tokens for outside hosts; the
   window is a plain environment variable, set in the same Edit dialog one step
   back, and a new session picks it up. Said in the park's reply.

9. **Operator**: «запаркуй релей если что успел сделать, я запущу с новой сессии
   с бОльшим лимитом автокомпакта»

   **Agent**: this park.

## 3. Intent

Get the cube's intro, as the team left it, in front of the operator's eyes and
into a draft PR, at the least token cost: a preview on slot 2 that shows the
current head, one end-to-end look at the walk from waking to the pill, a draft
PR against `claude/cube-review-perf` that says plainly what is left undone, and
a vet result. Ruled out: a new team, a fix round, `/polish` now, any merge to
`main`.

## 4. Decisions

- **Brought together as it stands** beat `relay-1.md` § 8's new team, on the
  operator's word and the week's limit. What each package owes
  (`relay-1.md` § 6, `reports/<name>.md`) goes into the PR as left undone.
- **`/polish` is left to `/finalize`**, which runs it before anything lands; it
  lost to polishing now on cost alone, and the PR says so.
- **The bands are variant B**, shell's deep graphite satin (`GREY` in
  `src/cube/pages/cube/lib/shell-material.ts`: albedo `[0.012, 0.0132, 0.0152]`,
  mirror 0.11, blur 3.2, no sun flecks). A and C are in `reports/shell.md` if
  the operator ever asks back. Settled; do not reopen.
- **The PR's text is drafted, not posted**: title
  `feat(vova): the cube's intro — an island, the cube outside, the way in` (72
  characters), body in `pr-body.md` beside this file, squash body in
  `squash-message.md` (passes `scripts/check-squash-message.sh`).
- **The strip** — the lead's name for one end-to-end shoot looked at as contact
  sheets: `pnpm scenes:cube --scenes waking,climb,jump,jump-small --every 2.4`,
  then `pnpm play:cube`.

## 5. Errors and dead ends

- **A band variant guessed from a screenshot.** The agent applied variant A by
  hand before the operator showed that shell had finished and chosen B. Lesson:
  a child's branch is fetched and read (`git log origin/claude/cube-intro-<name>`)
  before its work is redone — `relay-1.md` calling shell's branch a throwaway
  was already stale.
- **A push rejected unseen.** The first push was a non-fast-forward (the parked
  lead had pushed 9041d683 after writing its relay), and `| tail -1` hid the
  rejection, so the first preview built 9041d683. Fetch and merge before the
  first push; do not pipe a push through `tail`.
- **The parking account's artifacts are out of reach from the second account**:
  `ArtifactComments watch` on the board and on «Два океана» returns 404. Nothing
  can be posted to the board from there. Whether the next session can depends on
  which account it runs on — try the watch once, and do not retry on a 404.
- **A Bash hook rejects `cat`, `tail`, `sed -n`, `echo >` and `tee` on files.**
  Use `Read`/`Write`/`Edit`; re-running the identical command passes where the
  shell really is better.

## 6. State

Checked with commands at the park:

- **Branch** `claude/cube-intro-j2wt34`, head = the commit that adds this file;
  before it a55c5a20 (the merge of shell's variant B). All package branches are
  merged in. **No PR exists** (`gh pr list --head claude/cube-intro-j2wt34
--state all` → 0).
- **Plan**: `docs/plans/cube-intro.paused.md`.
- **Gates after the merge**: `pnpm typecheck` passes, `pnpm shaders:cube` says
  "73 of 73 shaders compile", prettier is clean on the touched files.
  **`./scripts/vet.sh` has never run on this branch.**
- **Preview, slot 2**: https://preview2.vovazakharov.com/cube serves **9041d683**
  — the old construction-grey bands. Run 43427109953, building a55c5a20 with the
  B bands, was still in progress at the park. Check what is served before naming
  the preview to the operator:
  `gh api repos/vzakharov/preview2.vovazakharov.com/commits/gh-pages --jq .commit.message`
  (reads `Built vova from <sha> (<ref>)`); republish with
  `gh workflow run preview.yml --ref claude/cube-intro-j2wt34 -f site=vova -f slot=2`.
- **The strip was stopped mid-shoot**, 0 frames kept, nothing judged. Its output
  lived in `tmp/` and is gone with the container.
- **Nothing running or waiting**: no CI, no PR subscription, no scheduled
  check-in, no child session of this lead's. The keepalive is stopped.
- **The old team's nine sessions** (ids in the plan's § "The team") belong to
  the first account and were not archived from the second.
- **Estimate**: this session booked 2 h senior producer (taking the branch over,
  merging the bands, slot 2, the PR's text). Handed on: 3 h senior
  gameplay-programmer (shoot and judge the strip of waking, climb, jumps and the
  pill's act), 1 h senior game-designer (whether the intro holds together as an
  experience), 3 h senior producer (the PR, the vet run, the report).

### Watches

None registered in this session (both attempts were refused). The two a lead on
the first account would watch, from `relay-1.md`:

https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3
https://claude.ai/artifact/UxGSPAXn2USWZSfpwJ7uFM

## 7. Pointers

- `docs/plans/cube-intro.paused.md` — the lead's memory; § "Since the resume"
  has this session's steering, § "Standing rules" the operator's words.
- `relay-1.md` — the build's handover; § 6 is what each package owes, § 7 its
  pointers (briefs, facts, frames).
- `pr-body.md`, `squash-message.md` — the PR's text, ready to post. `pr-body.md`
  names the preview and the session link at its foot: both are rewritten at
  posting time (the link to the posting session's, the preview line once slot 2
  serves the head).
- `reports/shell.md` — the bands' three variants and what shell still owes.
- `docs/remove-before-merging/review-focus.json` is inherited from
  `claude/cube-review-perf` and names that branch's files; a board build for
  this PR needs it rewritten for this diff first (the collector fails on paths
  the branch did not change). Candidates all in the diff: `src/cube/CLAUDE.md`,
  `src/cube/shared/outside/{outdoor-frame,water-level,turn}.ts`,
  `src/cube/pages/cube/ui/outdoor-layer.ts`,
  `src/cube/pages/cube/lib/{adaptation,start}.ts`,
  `.claude/skills/carte-blanche/SKILL.md`.
- Shooting: one `next dev` per checkout, no edit under `src/` while a shoot
  runs, `--out` absolute, about ten minutes of shader compile and then one to
  three minutes a frame on SwiftShader (`facts-frames-gates.md`).
- The way back: https://claude.ai/code/session_016Z4TKo8Y7vUYevAQEstous (this
  session), and https://claude.ai/code/session_01DaohkEr63nSs6fbnbbEpGd (the
  first lead; readable only from its own account).

## 8. Next step

In line with the operator's «давай собирать как есть» and the opening status
«PR ещё нет, дальше сквозной прогон и превью»:

1. `git mv` the plan back to `docs/plans/cube-intro.in-progress.md`, load
   `.claude/skills/carte-blanche/SKILL.md`, record the new lead's session id in
   the plan's header.
2. Confirm slot 2 serves the head (§ 6's command); republish if not. Only then
   name the preview to the operator.
3. Open the draft PR through `/pr` (`.claude/skills/pr/SKILL.md`), base
   `claude/cube-review-perf`, title and body from § 4; post the squash proposal
   with `scripts/pr-comment.sh squash <n>
docs/remove-before-merging/cube-intro-j2wt34/squash-message.md`. Its review
   board step is a cost call (§ 1): build it with a short focus list or skip it
   and say so.
4. Shoot the strip (§ 4), read its logs for page errors, assemble contact
   sheets, look at them, and tell the operator what the walk from waking to the
   pill shows. Commit keeper frames with eye, clock and commit.
5. `./scripts/vet.sh` on the pushed head; report its result as it is.
6. Report in Russian: the PR's URL on its own line, slot 2 with the commit it
   serves, what the strip showed, what is left undone, that `/polish` waits for
   `/finalize`.

Asked and not otherwise pending: nothing.

## Last agent turn

Absent: `scripts/relay-last-reply.py` found no turn before the park's that wrote
text ("no turn before this one wrote any text"), because the whole session, from
the take to the park, ran as one turn with the operator's messages arriving
inside it. § 2 holds every reply condensed; the transcript is behind the link in
§ 7.

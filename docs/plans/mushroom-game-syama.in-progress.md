# Syama's mushroom game

The whole game at `/mushrooms`, from Syama's drawing and voice notes (spec in
issue #65): a meadow of fly agarics, each with a mouse house, where a press
grows another mushroom and a press on a bug button flies one in — every
mushroom and every insect grown from its own seed, so a forest of them is all
different trees. No goal, no text, no failing: the player is six, and the
point, in his words, is to watch the butterflies, flies and bees.

Four people's loves go into it, in the operator's words: "от Сямы идея, от
меня любовь к процедуркам, от Золтана к экологии, от Лейсан к Мандалам" —
Syama's idea, the operator's procedural generation, Zoltan's ecology and
Leysan's mandalas.

The bar is the operator's: on a phone or tablet it looks and moves like a
casual mobile game — Angry Birds was the reference — and it is beautiful,
atmospheric and comfortable for a six-year-old's hands. One PR (#57), eaten a
bite per session; the PR closes #65.

## How this elephant is eaten

The operator delegated the whole loop and does not step in until the end
("весь процесс должен пройти полностью автономно, без единого моего
вмешательства"). Every session on this branch follows it:

1. A session takes a bite (`/go`), builds it, folds it into `## Eaten so far`
   as its own `mushroom-game-syama/bite-<nn>.md` and an index row
   (`.claude/skills/plan/elephant.md` § "The plan's shape"; split at 1001
   lines on the operator's «ого его раздуло. надо разбивать»), runs `/polish` and `/pr`, publishes the Artifact (below), pauses the plan,
   then runs `/relay оставь код ревью на последний кусок`.
2. The review session reviews **that bite's commits** as the operator would —
   `writing/notes/the-five-percent.md` is the reading list: the frame taken as
   given, an account standing in for running it, reasoning written into the
   artifact, the copy edited instead of the fact, the render checked against
   intent rather than the page. It opens and plays the page (`/preview`,
   screenshots and tap sequences at phone and tablet sizes) before judging
   the look. It posts one PR review with inline comments, each specific enough
   to act on, then runs `/relay /handle`.
3. The `/handle` session answers every comment (reply on GitHub, never
   resolve), pushes the fixes, then takes the next bite in the same session
   when its context is still under ~140k tokens — otherwise it pauses and
   runs `/relay /go`. Either way the bite ends at step 1.
4. After the last bite and its review is handled: `/relay /finalize`. No
   merge.

**The relays stay relays.** A chain stops at eight sessions deep — about
three bites (bites 1–3 took ~3½ hours, 4–6 ~13) — and the operator restarting
it every eighth session is part of the loop, not a defect to engineer away
("менять relay на что-то другое в этот подход megabeast-a точно не надо").
Each relay summary carries the chain's depth, and the session at the cap
hands the operator the one line to paste into a fresh session.

Standing rules for every session in the chain:

- **`writing/notes/the-five-percent.md` is frozen** — read, never appended:
  every review here is an agent's, and the file only counts what a human
  caught ("пятипроцентник зафиксируй и НЕ пополняй, учитывая что все код
  ревью будут НЕ от меня").
- **Never merge.** `finalize` runs without `and merge`.
- **Every session and subagent in the chain runs on Opus, named
  explicitly** — `create_session` with `model: "claude-opus-5-5"`, every
  `Agent` call with `model: "opus"` — never left to inherit, because the
  operator's own default is Sonnet ("в этой задаче все новые должны идти
  опусом"). A cap-depth hand-off tells the operator to start the fresh
  session on Opus.
- **`.claude/skills/megabeast/notes/` is filled at the end of every
  session, before its relay**, each note in the file for its theme (the
  `README.md` indexes them): what the session found that would make this
  loop repeatable and better, toward a future skill ("файлик будущего
  скилла, который будет это всё автоматизировать (рабочее название
  megabeast). Не сам скилл, а именно соображения"; "заполнять в конце каждой
  сессии перед релеем"). It outlives the plan and is not swept.
- **Stop and ask only for the unrecoverable** — the operator's line is
  "взломать весь интернет, стереть мой локальный диск". Everything else is
  decided, written into this plan as the decision, and carried on.
- **Every bite ends by committing the frames worth showing** — picked from
  `tmp/play/`, not the whole run — to
  `docs/remove-before-merging/frames/bite-<n>/`, so the operator can look in
  on them between bites ("хранить всякие скриншоты в remove-before-merging
  вместо tmp, хочу периодически на них посматривать"; "в конце каждого куска
  выбирать те что достойны показать"). A handled review's fixes count as
  their bite's, and land in the same directory. `/finalize` sweeps it.
- **Every bite ends with the game published as an Artifact**, updated in
  place at one URL posted on the PR, so the operator can play each bite
  without installing anything ("атефакт в конце каждого байта, чтобы по ходу
  дела тоже можно было тестировать без установки"). A handled review
  republishes it. The recipe: a single self-contained HTML,
  esbuild over the scene entry, Phaser from `cdn.jsdelivr.net/npm/`, built
  under `tmp/` and not committed; the build script is committed, since
  `tmp/` does not survive a relay. The first session to reach a bite's end
  writes it.

## Decisions the whole game carries

The palette, sizes, engine and every other call the whole game stands on:
[mushroom-game-syama/decisions.md](mushroom-game-syama/decisions.md). Read it
before a bite that adds a creature, a control or a look.

## Eaten so far

One file per bite under `mushroom-game-syama/`, each stating what exists and
what the next bites build on. A bite opens only the files its slice touches.

1. **The meadow, still** — [bite-01.md](mushroom-game-syama/bite-01.md)
2. **The meadow alive, and heard** — [bite-02.md](mushroom-game-syama/bite-02.md)
3. **More mushrooms, and a forest** — [bite-03.md](mushroom-game-syama/bite-03.md)
4. **The mouse house** — [bite-04.md](mushroom-game-syama/bite-04.md)
5. **The butterfly** — [bite-05.md](mushroom-game-syama/bite-05.md)
6. **The fly and the bee — the MPP line** — [bite-06.md](mushroom-game-syama/bite-06.md)
7. **Atmosphere** — [bite-07.md](mushroom-game-syama/bite-07.md)
8. **Real mushrooms** — [bite-08.md](mushroom-game-syama/bite-08.md)
9. **The operator's two ideas weighed, and the meadow on the ground** — [bite-09.md](mushroom-game-syama/bite-09.md)
10. **The flowers as an instrument, and the child plants them** — [bite-10.md](mushroom-game-syama/bite-10.md)
11. **A wider meadow, panned** — [bite-11.md](mushroom-game-syama/bite-11.md)

## Rest of the elephant

In order.

**Open:** review 5360733525 is handled, every thread answered; one miss it
left stands: on phoneL, visit 12733755's clump back cap keeps a 22 px patch,
not 24, because phoneL stands the clump under the zoom floor and growth does
not place the clump. Near-square windows of ~320–360 px each way (no phone has one)
fit no finger-sized picker row: it overlaps `−`, and `+` stands below the
ground; no test covers them. The play run shoots no 568×320 screen, so the
tests alone hold it. The play run's world-end drag check skips where
no cap or flower at an end has bare ground beside it — both ends on tabL
in the keys run, whose right-end frame shows grass round every cap. On tablets the front mushroom's stem can run to the bottom edge. On phoneP one planted flower
reads larger than its neighbours at the same depth. The play run shoots
no refused `+` and no bees planting in a full forest.
The sky may read a little plain since bite 7 tamed the halo.
Carried from bite 6: fliers are kept apart where they sit and hover, not in flight, so a flier crossing
the meadow is drawn straight over one seated on a cap (frame
`phoneL-butterfly-crosses-one-on-a-cap.png`); a flight in
from off screen still takes up to 5 s for a butterfly; a butterfly making
way for a bee leaves its flower moments after landing, which may read as a
twitch; a flier holding an air spot is drawn still, with no hover bob.

12. **Rain.** A tap on a cloud darkens it and it rains, falling as drops that
    splash on caps and ground, with its own sound. While it rains, flowers
    close, insects shelter under the nearest cap, and mushrooms swell a
    little. When it stops, the sun comes back with a rainbow, and spores an
    old mushroom shed sprout into little mushrooms that grow over the next
    minutes, within the forest's cap.
13. **Dusk.** The dark scheme is dusk: the sky, dimmer hills, windows
    glowing, fireflies waking, mice coming out of their doors, butterflies
    folded on the caps and flowers closed for the night.
14. **Around the canvas.** A way home as a pictogram; `prefers-reduced-motion`
    (idle loops off, short tweens without overshoot); a visually hidden row
    of HTML buttons beside the canvas dispatching the same actions, for
    assistive tech; a home-page link in the footer's `SEE_ALSO` if that list
    carries side projects, none otherwise. Then, the Artifact republished,
    `/relay /finalize`.

## DRY notes

- **Metadata reuses `constructMetadata` wholesale**, as the music page does;
  with no locale there is no `hreflang` map to build.
- **The route is one line and the sitemap one key**, `PAGE_ROUTES` already
  feeding `sitemap()`.
- **The game shares nothing below the page with the rest of the site, on
  purpose.** No other page has a canvas, an engine or a generator, so a
  `shared/game` segment or `features/` slice would have one consumer and fail
  Steiger's `insignificant-slice`; `Mushroom` and `Insect` are not
  `entities/` slices for the same reason.
- **Genes and drawing are two modules per creature** — one is tested, the
  other looked at. `random.ts` is shared by every generator, which is why it
  is its own module from bite 1.
- **`Seeded = { seed: number }` and `WithId` are the bases** `Mushroom` and
  `Insect` both intersect, so `pnpm type-overlap` holds as the second
  creature arrives.
- **Numbers and colours have one home each**: `layout.ts` positions and sizes
  everything, `palette.ts` holds every base hue; a per-instance nudge is a
  gene.

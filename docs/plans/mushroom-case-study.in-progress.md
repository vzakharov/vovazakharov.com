# The mushroom meadow case study

A case study of how Syama's mushroom meadow (PR #57, live at `/mushrooms`) was
built: a six-year-old's drawing, the operator, and a chain of 92 Claude
sessions running the autonomous "megabeast" loop over 8.5 days. It goes on
vovazakharov.com under `case-studies/`, in its maximal form first — per bite
screenshots, every snag in the game code and in the machinery around it, and
every moment the operator walked in with a pivot of up to 180° — and later as a
video, which is a separate task (§ "Out of this PR").

The operator's ask, verbatim: «кейс-стади, как "мы" всё это сделали --
настолько, насколько ты сможешь это вспомнить … Для начала в виде блоговой
статьи в case-studies, потом можно и видюшкой» and «кейс-стади хочу (в
максимальной версии) прямо подробный: скриншотики разных байтов …, где какие
затыки были -- и в самом коде, и в мета-инфратсруктуре вокруг него, в какой
момент оператор (то бишь "я" с точки зрения кейс стади) приходил с внезапными
180-градусными пивотами и т.п. если что-то не удастся восстановить, я напомню.
Лучше сразу не писать всё а составить план».

## Sources

The history is reconstructed, not remembered, and the reconstruction is
committed so no bite re-mines it:

- **`docs/remove-before-merging/case-study/digest.md`** — numbers (each with
  the command behind it), a session-by-session timeline, every operator message
  verbatim and deduplicated across the 98 relay versions, turning points split
  game code / machinery, the 14 pivots, the game in plain words.
- **`docs/remove-before-merging/case-study/digest-2.md`** — the frames
  inventory per bite (which commit holds which screenshot), the plan's bites
  and decisions log, the megabeast notes' lessons, the five-percent entries
  from the run (none — the file was frozen), and the chain's total cost;
  issue #65 and the review threads are bite 1's first step.
- The primary sources stay one command away: PR #57's head is
  `claude/mushroom-game-syama-lbirv7`; every relay version is
  `git log --reverse --format=%h refs/pr/57 -- docs/remove-before-merging/relay.md`
  then `git show <sha>:docs/remove-before-merging/relay.md` (fetch
  `pull/57/head` and unshallow first). A fact the article states is checked
  against these, not against the digest's paraphrase.

- **`writing/case-studies/dictations/mushrooms-1.md`** — the operator's
  dictation of the opening, through the turn to the walking world. It sets the
  voice and the order: the article retells it in English, keeping its
  talked-out lines and its asides («забегая вперёд»), rather than writing the
  digests up. Where it and the history disagree the history wins, as the
  operator accepted:
  - there were **two** launches — the Thursday 17 Sep session (plan, Phaser,
    the generator) and the big run from **Saturday** 26 Sep, 08:17 UTC;
  - Syama's explanation is **two voice notes**, not videos;
  - the notes, the name megabeast, and the ecology and mandalas ask came
    **minutes into** the run, not in the launch message;
  - the butterfly, fly and bee **were** flying when the walking idea came
    (29 Sep, after bites 5–6), and the turn was **four bites of rebuilding**
    (9–12), not a rewrite from scratch;
  - screenshots were taken all along into `tmp/`; the ask was to **keep them
    on the branch** and pick the best; the Artifact was in the launch message.

Both digest files are working artifacts: the directory is swept by `/finalize`.
`writing/notes/the-five-percent.md` is read, never appended to (the operator
froze it).

## The article

**Where**: `apps/vova/public/case-studies/mushrooms.md`, assets under
`apps/vova/public/case-studies/assets/mushrooms-*`. The collection is English
only (`localized: false` in `src/shared/content/collections.ts`), so the
article is English; frontmatter as `playgram.md` (`description`, `date`,
`ogImage`, no `part`). Playgram stays the featured case study.

**Voice**: first person, the operator's — "I" is Vova, "Claude" or "the
agents" are the sessions, "we" where it really was both. The house form is
`playgram.md`: a numbers table up top, a conversational intro, long sections
with screenshots, em dashes. The voice tells in `writing/CLAUDE.md` § "Voice"
(no sentence announcing the next one, no list of examples where one does, no
"not just X — also Y", don't tighten the talked-out line) apply; its `--` rule
is LinkedIn's and does not. Syama is a boy, everywhere.

**Quotes**: the operator's messages are the spine of the story. Each is given
in English; the pivot quotes also carry the Russian original beneath, in
italics, because the original is the evidence and the translation is mine.

**Working title** — the hook is the operator's call (question 1): _"My son
drew a mushroom house. 92 Claude sessions built it in eight days."_

### Outline

Chronological, in three parts, because the pivots only read as pivots against
what was being built when they landed. Each bite gets a frame strip — one to
three screenshots from its `frames/bite-<n>/` — so the game is seen growing.
A pivot is marked where it lands with one consistent device (a `↻ Pivot`
lead-in line); snags are told where they happen, tagged _game_ or _machinery_.

0. **Header** — the numbers table: assignment (a game from a six-year-old's
   drawing, no text, no goal); span (17 Sep plan, 26 Sep – 4 Oct run, 8.5
   days); 92 sessions, 98 relay summaries; 3,162 commits, all by Claude, of
   which ~990 cost rows and 430 merges; 40,901 lines of game code and 27,345 of
   tests, 2,267 tests green; $1,777 at API rates, three quarters of it in
   subagents; a plan of 9 bites that grew to 19; operator
   involvement — playing, reviewing, and the pivots. Then a frame of the game
   at dusk and a link to `/mushrooms`.
1. **Intro — the drawing.** Issue #65: Syama's drawing and spec. What the game
   is now, in the squash message's plain words. Who brought what: «от Сямы
   идея, от меня любовь к процедуркам, от Золтана к экологии, от Лейсан к
   мандалам».
2. **Part I — Before the beast (17 Sep).** One session plans a tap toy;
   «как какой-нибудь angry birds» ↻ a real Phaser game; «каждый -- разный» ↻
   no sprites, a seeded generator; narrowed to stage one; nine days of silence.
3. **The launch message (26 Sep).** Quoted in full: the seven-step loop, «без
   единого моего вмешательства», the Artifact. The rebase onto `main` and the
   plan rewritten as an elephant. ↻ The whole game in one PR.
4. **How the loop works.** Bite → relay → review (the five-percent lens,
   «что бы на нашем месте сделал Страшила») → relay → handle → relay; the
   relay file's eight sections; depth 8 of 8; subagents in waves; the
   megabeast notes kept as the run's own memory. One mermaid diagram.
5. **Bites 1–8, a meadow on one screen (26–28 Sep).** Still meadow, sound and
   flowers, plus/minus and the cap picker, the mouse house, butterfly, fly and
   bee with pollination. ↻ Ecology and mandalas. ↻ «немного слишком
   свинка-пеппа» → bite 7 atmosphere. ↻ Real species, born of an early agent
   misreading the drawing's door types as cap shapes. Game snags: the door
   invisible on 40% of phone-portrait visits (a 2,000-visit sweep), lost
   butterflies, the chanterelle as "a hockey stick with a plate". Machinery
   snags: the depth cap leaving 11 hours idle, an agent asking `/compact`
   against the contract («мы же договорились что идём yolo»), the weekly quota
   run dry, subagents misreporting their own context (115k vs 220k).
6. **Part II — The meadow learns to walk (29 Sep – 2 Oct).** ↻ The idea
   review: walking meadow and flower keyboard, two Russian readiness docs
   first. Bites 9–11: tap floor, the instrument («darker is lower»), the wider
   meadow; one-finger gestures; a musician's veto on a 100 ms delay. ↻ «всё-таки
   я хочу чтобы шагать можно было уже сейчас» — rain stopped mid-build. ↻ «зачем
   поляне край?» → the endless field (12b). The 16-second full turn, the
   agent's pixel-identical claim that was 10–36% wrong, and ↻ the panoramic
   lens («4 экрана»). The insect-speed saga and «а почему они вообще должны
   летать тем быстрее…». Machinery: `git reset --hard` locking auto-mode out,
   container restarts killing agents, the plan swelling to 1,002 lines and the
   450/400 rule, «Сяма -- мальчик :)», the drift into English, ↻ review and
   handling folded into the bite's own session, worktrees. ↻ Play runs dropped
   for costing more than the game, then reinstated with the game-red /
   harness-red split.
7. **Part III — Rain, night, and keeping it (3–4 Oct).** Bites 13–18: rain,
   after the rain (↻ spores), ↻ the house's dwellers, the map (the door
   crash), dusk (moon, fireflies, crickets; 20 fps on an M2 Pro), ↻ saving.
   ↻ «игру делаем для конкретного ребёнка» — a11y and the splash cut.
   Machinery: 966 files on the branch and retirement with tombstones; ~3,000
   commits and squash-per-worktree; cost rows firing on subagent stops; the
   idle night («вся ночь получается без дела прошла») and depth read off
   `get_session`; the suite outgrowing vet's 590 s. `/finalize`, the merge.
8. **The numbers.** Commits per day as a chart (SVG, the playgram chart's
   form); where the 3,162 went (cost rows, merges, docs — code under a
   quarter); cost per bite where the rows allow it; the deflating half stated
   plainly.
9. **What I would keep.** The megabeast notes' lessons as the operator now
   reads them, and what goes into the future skill.
10. **Syama's verdict** — the operator's paragraph (question 4).
11. **Appendix A — every pivot**: date, quote (Russian + English), before →
    after, linked to its section. **Appendix B — every snag**, two tables:
    game code, machinery.
12. **To be continued** — the video.

## Assets

- **Frames**: one to three per bite from `frames/bite-<n>/`, recovered with
  `git show <sha>:<path>` from the holding commits `digest-2.md` § 1 lists
  (633 versions, ~357 MB in all, so pick from its contact sheets rather than
  pulling everything), renamed `mushrooms-bite-<nn>-<what>.png`, cropped to
  the game, and compressed so each stays in playgram's range (well under
  1.5 MB). Frames start at bite 4 — the operator asked for them on 26 Sep
  evening. Bites 1–3 get a headless capture of the dev server at each bite's
  head commit where that builds; where it does not, the article says so.
- **The drawing** from issue #65 (question 3).
- **The loop diagram** as a `mermaid` fence, rendered by
  `pnpm content:mermaid`.
- **The commits-per-day chart** as SVG plus its CSV, beside the article, and
  its rasterized OG card through `scripts/render-og.ts`, as playgram's.
- **A short screen recording** of the finished game (an `.mp4` link, as
  `playgram.nano.md` does) if one can be captured headless; otherwise a frame.

## Out of this PR

The video. It needs its own research into what the operator calls the
other sessions' info videos and its own toolchain, and it reuses the article
as its script, so it is a follow-up task once this merges (question 6).

## Split

**An elephant, one PR, a bite per session, paused for the operator's review
after each** — the article is one piece, so no part of it ships alone, and
the operator asked to see it grow rather than receive it whole. Four bites;
the article builds and renders after each, and nothing merges before the
last.

## Rest of the elephant

- **Bite 2 — Part II** (§ 6 of the outline) with its frames.
- **Bite 3 — Part III, the numbers, the lessons, the appendices** (§§ 7–11),
  the chart and its OG card.
- **Bite 4 — the cuts and the read-through**: `mushrooms.mini.md` and
  `mushrooms.nano.md` (question 5), the opening's final hook, a fact check of
  every number against the commands in `digest.md`, `/preview` of the page in
  both themes.

## This bite

**Bite 1 — the frame of the article and Part I** (§§ 0–5 of the outline):

1. Finish the digest: `digest-2.md` § 5 — issue #65's spec and drawing, and
   PR #57's review threads, telling the operator's own reviews (5329778719,
   5350040790, 5354936232, 5355192406 among them) from the loop's.
2. `mushrooms.md` with frontmatter, the working title, the numbers table,
   the intro, Part I, the launch message, the loop with its mermaid diagram,
   and bites 1–8; empty headings for §§ 6–12 so the shape is visible.
3. Frames for bites 1–8 and the drawing into `assets/`; `pnpm content:mermaid`.
4. `/preview` the page once, `./scripts/vet.sh`, `/polish`, pause the plan.

## DRY notes

- **No code changes are expected.** The `case-studies` collection, its route,
  the variant cuts (`VARIANTS` in `collections.ts`), the mermaid renderer and
  the OG renderer all exist; the article is a new file in an existing
  collection. Anything the article seems to need from the renderer (a
  caption style, a side-by-side frame strip) is first done with what
  `playgram.md` already uses; a renderer change is raised, not slipped in.
- **The playgram chart has no script in the repo** — it was produced ad hoc.
  The commits-per-day chart is likewise a one-off: a script for two charts
  with different data and axes would be an abstraction over a sample of two.
  Its generating command goes in the PR body so it is reproducible.
- **Facts have one home: the article.** The digest files are scaffolding and
  are swept; the mini and nano cuts restate the full version's facts rather
  than introducing their own.

## Deploy

Merge is deploy. The squash subject is `feat(vova): …` — the article is a
page the site starts serving, so it publishes vova alone.

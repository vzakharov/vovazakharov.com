# Memo

Written by `scripts/memo/memo.py`; never edited by hand.

## lead · 2026-11-07 06:32:48 UTC

Brief from the island's lead — keyboard controls with turning.

The operator, verbatim: «а ещё я не понял как поворачивать при навигации:). как спускаться-подниматься понял только мышкой, но хочется и клавиатурой :)» — and on the layout the lead proposed: «a/d как раз стрейф, а вот влево-вправо-поворот. ну получается вверх-вниз тоже можно подъём/спуск, а w/s вперёд назад».

Today (`src/island/features/eye/`): the eye has a `heading` in its model (`model/eye.ts`, `model/pose.ts`) but nothing changes it, so the view always faces north; pitch follows height on its own. `ui/eye-controls.ts` maps arrows and WASD alike to sideways movement and `Q`/`E`, `PageUp`/`PageDown` to climbing. Nothing on screen tells the player any of it.

Done means:

1. The layout, by `KeyboardEvent.code`:
   - `W`/`S` — forward and back, along the heading;
   - `A`/`D` — strafe left and right;
   - `←`/`→` — turn left and right (heading), at a rate that reads well at every height;
   - `↑`/`↓` — climb and descend, as `PageUp`/`PageDown` (kept) do, with the same multiplicative speed;
   - `Q`/`E` stay as climb aliases unless they fight something.
2. Mouse and touch: left drag moves the ground as now, right drag (and two-finger twist on a phone) turns.
3. A small, unobtrusive key hint on screen (desktop), dismissible or fading after first use; a phone shows the gestures instead.
4. Model tests for turning and for forward/strafe along the heading (`features/eye` model tests are the pattern); `pnpm play:island` still passes, with a shot turned away from north.

Work on `island/controls` (off the island branch), its own draft PR onto `claude/world-game-zoltan-syama-hodowq`; `/go` § "Planless entry", the passes, vet green, integrate the island branch first (`git fetch origin claude/world-game-zoltan-syama-hodowq && git merge origin/claude/world-game-zoltan-syama-hodowq`, never `git pull`), then post done. A parallel member records a descent video on `island/descent-video` against today's controls — no need to coordinate beyond not renaming what `play:island` drives.

Channel: this memo, on `island/controls`: `python3 scripts/memo/memo.py post --as member --branch island/controls "<text>"` (post waits for the reply — run it in the background). Post when done or blocked.

Standing rules: you do not watch the board; replies to the operator in Russian, «ты», «Вова»; never name the private repository the memo tooling was ported from.

## member · 2026-11-07 06:56:33 UTC

Done: draft PR #260 onto claude/world-game-zoltan-syama-hodowq (https://github.com/vzakharov/vovazakharov.com/pull/260). W/S forward/back along the heading, A/D strafe, ←/→ turn (80°/s, eased, same at every height), ↑/↓ climb as PageUp/PageDown and Q/E (kept). Right-drag turns, two-finger twist turns. A bottom-left hint shows keys on desktop and gestures on touch screens, fades 4 s after first use or closes on ×, and is hidden under ?play. Model tests cover turning and forward/strafe along the heading (28 pass). play:island passes with a new last shot, inlet-head-west, via the new hook method turnTo; the existing shot names are unchanged. Island branch integrated twice (merge, no pull). Vet: everything green except format, which failed on two markdown files only, this memo and relay-11.md; both fixed in b9f52d85 and checked with pnpm format:check locally. Vet was not re-run, at Vova's ask. Five-percent left one optional suggestion: collapse the hint to a '?' button instead of removing it for good. That one is yours or Vova's to call.

## lead · 2026-11-07 06:57:24 UTC

Merged into the island branch as a fast-forward (1035c167), preview republishing. The '?' button suggestion goes to Vova. Thanks — you are done; no need to wait on memo.

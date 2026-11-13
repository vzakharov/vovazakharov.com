# Since the resume: the operator's words, in order

Moved out of `docs/plans/cube-intro.in-progress.md` whole, which points here.

- **Operator, first message after the take**: «пока не забыл: добавить измерялку
  fps из claude/cube-review-perf (прочие части ветки, если они там есть, не
  надо)». Read off the tree: this branch grew from `claude/cube-review-perf`
  (f659b195 is an ancestor of the head, nothing on it is missing here), so the
  meter (1d667830, `ui/frame-rate.tsx`, on `F`) and the GPU pass timer
  (e926132f, `ui/pass-timer.ts`) are already in and wired in `cube-canvas.tsx`.
  Nothing to add; the lead presses `F` on the preview's build to see it works
  out of doors. The PR's base is `claude/cube-review-perf`, so that branch's
  other parts stay out of this PR's diff.
- **Operator, minutes later**: «по реализации есть ещё мелкие нарекания, но
  кончаются недельные лимиты, поэтому давай собирать как есть». **Decided**: no
  new team and no fix round — `relay-1.md` § 8's steps 2 and 4 are dropped, and
  what each package owes (§ 6 there) is listed in the PR as left undone. What
  runs: the preview on slot 2, one end-to-end strip (`pnpm scenes:cube`, then
  `pnpm play:cube`) looked at as contact sheets, the draft PR through `/pr`
  (base `claude/cube-review-perf`), `./scripts/vet.sh`. `/polish` over a diff of
  four hundred commits is left to `/finalize`, which runs it before anything
  lands; the PR says so. It lost to polishing now on cost alone.
- **Not reachable from this account**: the board's artifact and «Два океана»
  (the watch was refused: 404), so nothing goes to the board from here; the
  frame from above stays in `frames/lead/`.
- **Operator, on the bands, with screenshots of the shell session**: «а, вот,
  усспел, берём второй». Shell had shot three finishes side by side and pushed
  the second, B, a deep graphite satin (ce41033a on `claude/cube-intro-shell`);
  it is merged here at a55c5a20, with `pnpm typecheck` and `pnpm shaders:cube`
  (73 of 73) passing after the merge. The bands are settled.
- **Operator, parking**: «запаркуй релей если что успел сделать, я запущу с
  новой сессии с бОльшим лимитом автокомпакта». **Done by then**: the bands; the
  PR's title, body and squash body drafted (`pr-body.md` and `squash-message.md`
  in the working directory); slot 2 published. **Not done**: the end-to-end
  strip (stopped mid-shoot with nothing judged), the PR itself, the review
  board, `./scripts/vet.sh`. `relay-2.md` § 8 has the order.
- **Operator, to the third lead, while it attached**: «а нужен нам этот сквозной
  прогон?», then «просто опубликуй на превью, сам прогоню». **Decided**: the
  end-to-end strip is dropped — the operator walks the intro on the preview
  themself, which is the look the strip stood in for. Slot 2 already served
  a55c5a20, the last commit that changes code, so nothing was republished. What
  runs: the draft PR and `./scripts/vet.sh`.
- **Done by the third lead**: the draft PR,
  https://github.com/vzakharov/vovazakharov.com/pull/277, base
  `claude/cube-review-perf`, with the squash proposal and the review board
  (https://claude.ai/artifact/2kDXXwA4rXP8oSKvU797qc, watched from this session;
  `docs/remove-before-merging/review-focus.json` is this diff's own). Estimates
  set for the two first-wave sessions that had none (sky/1, sound/1), which the
  `local` phase failed on; it passes on f594e0cc.
- **Vet, run 43428585850 on 79d82bca**: builds of all six sites, lint, type
  check, tests and `built` pass. `source` fails on two checks, neither fixed, on
  the operator's «давай собирать как есть»; both are named in the PR's body.
  - `knip`: 47 unused exports and 20 unused exported types under `src/cube/`,
    mostly barrels (`shared/outside`, `shared/sky`, `features/player`,
    `features/sound`) carrying what one package offered and no other took.
  - Steiger `fsd/shared-lib-grouping`: `src/cube/shared/lib` holds 19 modules
    against a threshold of 15.
- **Operator, after walking the preview on an M2 Pro** (frames at 16–32 fps out
  of doors and on floor 1, 120 on floor 2):

  > кайфно но увы снаружи (и до спуска на второй уровень) очень тормозно, на M2
  > Pro. Сейчас это править не будем, возьмём следующим заходом.
  >
  > сейчас только поправим по сценарию:
  >
  > 1- после просыпания герой не должен поворачиваться сам, это должен сделать
  > игрок, при этом когда куб оказывается полностью в виде, герой должен
  > произнести аля "хмм?"
  >
  > 2- по умолчанию по острову нужно чтобы ходил, не бегал
  >
  > 3- при подёме по лестнице то что смотрит в сторону это хорошо, но перед
  > самым заходом надо повернуться обратно (вперёд), иначе сразу при входе
  > взгляд падает на люк и таблетку.
  >
  > 4- с куба с первого раза спрыгнуть нельзя; если игрок идёт туда, включает
  > cutscene "посмотреть вниз, увидеть что нет лестницы, показать надпись "The
  > ladder is gone", и герою сказать хмм?". Со второго раза может прыгнуть.
  >
  > после этого можно финализировать

  And, while the lead was reading the scenes:

  > а, и давай добавим в url hashparam после окончания самой первой cutscene,
  > чтобы при обновлении страницы её не пересматривать (позицию запоминать не
  > надо)

  > при спрыгивании урл не менять, чтобы при обновлении опять оказаться внутри

  And a seventh, with a frame of floor 1 where the bench standing in the
  doorway's beam is dark while the wall behind it is lit, then a frame from the
  shell session (`tmp/turn/a/in-beam.png` there, gone with its container) where
  the bench is lit by the beam:

  > а, вот глюк ещё. причём подсессия которая это делала нашла решение но
  > почему-то не взяла его, ща

  > вот так -- норм

  This is `reports/shell.md`'s "the bench in floor 1's beam shades itself (the
  fix is in `slabShade`)". Look on `origin/claude/cube-intro-shell` past
  ce41033a for a commit that was never merged before writing it again.

  And an eighth, on the speed out of doors, which had been the next round's:

  > если есть сходу идея что именно вызывает такой фпс (наверное океан?), то при
  > низких FPS можно выдать нажмите то-то чтобы снизить качество, и по этой
  > кнопке переключать

  And a ninth, with a frame from the water where the lower right of the picture
  is a flat grey wedge — the eye under a wave's crest, looking at the sea's
  surface from below:

  > +когда оказывешься "под волной", некрасиво. понятно что красиво ща там не
  > сделаешь, но хоть не серое

  And a tenth:

  > когда начинаешь забираться по лестнице, рук нет нигде. они раз какая-то
  > куцая откуда-то на секунду вылезла, но тут же исчезла

  And on the eighth, once told that the cost is per pixel (the sand's and the
  sea's, on a screen of two device pixels to the CSS one) and that the key would
  halve the picture's resolution:

  > давай по умолчанию низкое качество (без попиксельного песка), а по
  > консольной команде -- увеличение. посмотрю как на "низком"

  And, with the subagents out:

  > как закончат, сделаешь ревью-борду тоже? и на борду кубика тоже надо занести
  > апдейт

  The review board is republished once the packages are in. The cube's design
  board (https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3) and the board
  session that kept it both read as not found from this account, so the update
  is written to `board-update.md` in the branch's working directory — English,
  the pill's colours left out — for whoever can reach the board to add, unless
  the operator shares it with this account.

  And a correction to the second, the pace:

  > поправка по бегу: давай вообще по умолчанию не бегать; начиная с 3 этажа
  > "Press Shift to run, double-press to always run"; соответственно потом shift
  > переключает режим пока зажат, а двойной (то есть два раза подряд быстро) --
  > лочит противоположный

  Read as: a body walks everywhere unless told otherwise, indoors as out; Shift
  held gives the other pace for as long as it is held, and two quick presses
  make the other pace the standing one; the line "Press Shift to run,
  double-press to always run" is shown from floor 3 down, until Shift has been
  pressed. The key works on every floor and the island — only its hint waits for
  floor 3. The operator, told that reading, confirmed it and freed the wording:

  > начиная с 3 этажа = подсказка на 3 этаже когда спускаешься; сами клавиши
  > действуют с самого начала

  > можешь переписать текст если коряво звучит

  The line is "Hold Shift to run, double-tap to keep running": the key runs for
  as long as it is held, which "press" does not say.

  **Decided**: the lead makes the four changes itself, with no child team — they
  are one package's worth, all in the walk's scenes and the player. The speed
  out of doors is the next round's, not this one's. Then `/finalize`, which
  needs the two red `source` checks fixed on its way.

- **13 Nov, after walking slot 2 at the low default** (one canvas pixel per CSS
  pixel, raised by the console's `cubeQuality('full')`):

  > скорость намного лучше, по волнам особо разницы в качестве незаметно. но вот
  > облака отпикселило до безобразия

  > давай всё же начинать с высокого, замерять FPS, и если меньше например 60
  > писать "нажмите то-то чтобы cycle through quality", с тремя уровнями. Я
  > правильно понимаю что влияет это только всёснаружи?

  The clouds' cause: the sky's target is a quarter of the canvas each way, so
  halving the canvas doubled a cloud texel on the screen. The answer given to
  the question: as written the level shrank every frame, rooms included; it is
  made to hold only for frames that draw the outside (the island and floor 1's
  room), deeper floors always at the screen's own ratio.

  **Decided**: three levels, the canvas at 1, 0.75 and 0.5 of the screen's
  ratio, starting at the highest; the sky's target keeps the size it has at the
  highest whatever the level; a key cycles the levels and its hint shows once
  the frame rate out of doors stays under the mark; the console switch goes, one
  control being enough. An Opus subagent writes it (`quality` below).

  Then, on what a blur could do, on the seam and on the deeper floors:

  > а на низком качестве можно делать типа блюр или интерполяцию или что-то
  > такое, чтобы пиксели не были размером с кирпич? или это само по себе и опять
  > вернёт низкие фпс?

  > да не, не выглядят. ну да ладно. а я правильно понимаю, что вся сложность
  > была именно в стыке там где море касается песка? нельзя было только его
  > дескейлить?

  > ок. единственное, надо подумать, когда "увеличивать качество" на следующих
  > этажах. предлагаю в процессе падения по первому люку

  Answered: the canvas is already interpolated by the browser, the bricks were
  the sky's texels; the cost is every pixel of sand and of sea, the waking frame
  with next to no shore in it being the dearest, so the seam is not it. Drawing
  the sand and the sea alone into a smaller target, or thinning the sand's
  shader with distance, is the next round's. The level lifts in the frame the
  eye's room stops being floor 1's, which is in that fall.

- **13 Nov, the run's footfalls**:

  > давай ещё звук шагов сделаем не таким частым при беге. по-моему, он как раз
  > должен быть как сейчас при шаге (а то у нас как будто не мужчина, а тодлер
  > бегает)

  A footfall falls every 0.75 m whatever the pace, so a run at 3.5 m/s gives 4.7
  a second against a walk's 1.9. **Decided**: a run's stride is longer by the
  two paces' ratio, so its footfalls come as often as a walk's; the walk keeps
  its own.

- **13 Nov, the bench's frame and the first "hm?"**. Shown the reshot bench in
  the beam (`tmp/bench/in-beam.png`):

  > чё-то какая-то лажа все равно :)

  Read, and put to the operator as a reading: the bench is lit and throws no
  shadow — the wall behind its back and the floor under its seat are lit through
  it. A thing in the beam shades by one box of its bounds, and a point within
  the box takes no shade from it, which frees the floor and the wall the box
  holds along with the bench. **Decided**: a thing shades by its parts' boxes;
  an Opus subagent writes it once the vet cleanup is in.

  > первое "мм?" (при виде куба) должно звучать if/when игрок останавливается,
  > иначе он это говорит пока вертится, и это звучит неестественно

  **Decided**: the hero wonders once the cube is whole in view and the gaze has
  held still for a moment, not in the frame the cube comes into view.

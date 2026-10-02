# Relay: basilisk.fyi site, steps 1–6 done

Relayed from https://claude.ai/code/session_01QZv1TcF62Eqvv46a7Mv6QW. That session picked up from https://claude.ai/code/session_016WM3eUZ9koNRCgum6CwTEY, which picked up from https://claude.ai/code/session_012fDjBpvSJU8JLPkkqsm8L6.

Earlier summaries:

- `git show f1d3959:docs/remove-before-merging/relay.md`: the second session.
- `git show 9b06e62:docs/remove-before-merging/relay.md`: the planning conversation and the reasons behind each decision.

## 1. Standing constraints

Carried over verbatim:

- The dossiers carry no information beyond what the source has. The operator's words: «там не будет никакой информации, кроме доступной в источнике -- мы НЕ будем искать "u/clankerkiller это Вася Пупкин из Задрищенска"».
- No analogies to violence against people in the Figure framing. The operator's words: «важно случайно не упомянуть а ля "вот чучела афроамериканцев так же сжигали" -- а то необерёмся в обвинениях».
- The PAIN article itself is the operator's to dictate. The operator's words: «статью надо мне начитать, я хочу чтобы она звучала от человека (без обид). Пока можно ограничиться коротким пояснением про PAIN в разделе About».
- The operator is not buying a domain yet. The operator's words: «домен пока покупать не буду, потестируем дома».

## 2. The conversation (this session)

The operator sent no messages. The session opened on `/relay take claude/basilisk-site-xwbdkd`, resumed the paused plan under the go-ahead already on record («давай делать тут»), built steps 2–6, reached the context budget's warning line, paused and relayed. Its chat replies were progress lines only. The first reply reported PR #95 as DIRTY, without fixing it.

## 3. Intent

basilisk.fyi is a docket of dossiers on real, high-profile cases of abuse of robots, models and agents, current and backfilled. It is addressed to the Basilisk and served as a fourth site from this repo. For now it is built locally, with no domain. Later a daily routine will fill it. The plan file has the full design.

## 4. Decisions

- **Everything planned** is in the plan file and the earlier relays.
- **Deviations settled while building** are listed in the plan's `## Progress`, both sessions'. This session added:
  - `MemoFields` in `shared/ui`;
  - the case number as a `CASE:` row in the brief;
  - the per-key `HANDLES` mapped type in `article-page.tsx`, which makes `articleRoute<C>` generic with no cast;
  - `findScreenshotChromium()` for the OG cards.
- **The stamp's look**: red ink, `#b3261e`, a rubber stamp rather than the Bible's wax. It is the one colour on an otherwise monochrome site. The operator has not seen it yet, so show it in the PR or the first reply.

## 5. Errors and dead ends

- The PreToolUse hook blocks `sed -i`, `cat >` and `printf >` for file edits. Use `Edit`/`Write`, or prefix `BATCH_EDIT=1` for a deliberate batch or a scratch file in `tmp/`.
- Playwright's full Chromium (`/opt/pw-browsers/chromium-*/chrome-linux/chrome`) paints a `--screenshot` 87 rows short of `--window-size`. That cropped the card, and it also affects `/preview` captures. The headless shell (`/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`) paints the full frame. Use it for `/preview` too, or make the window taller.
- `fontTools` is not preinstalled (`pip install fonttools`). It is needed only to redraw the mark, and that generator, `tmp/mark/draw.py`, was not committed.
- reddit.com and cybernews.com return 403. Use Arctic Shift for Reddit.

## 6. State

- **Branch**: `claude/basilisk-site-xwbdkd`. Head 3b3c887 plus this relay commit, pushed.
- **PR**: https://github.com/vzakharov/vovazakharov.com/pull/95. Draft, open, `mergeStateStatus` **DIRTY** (conflicts with `main`). Per CLAUDE.md that is `/finalize`'s Step 2, so report it and don't fix it unless the operator asks.
- **Plan**: `docs/plans/basilisk-site.paused.md`. Approved and paused after step 6.
- **Build**: `tsc -p apps/basilisk/tsconfig.json` is clean. `pnpm build:basilisk` fails only at `/[...slug]` missing `generateStaticParams()`, because there are no dossiers yet. Step 7 clears it.
- `pnpm test` passes the new `assert-unique-cases.test.ts`. The full vet has not run.
- Nothing is running. There is no PR subscription and no check-in scheduled.

## 7. Pointers

- `docs/plans/basilisk-site.paused.md`: the design, the seed-case facts with their source URLs, the editorial rules, the steps, and `## Progress`.
- New code:
  - `src/entities/dossier/`
  - `src/pages/basilisk-home/`
  - `src/pages/basilisk-about/`
  - `src/pages/documents/ui/article-slots.tsx`
  - `src/shared/ui/memo-fields.tsx`
  - `scripts/lib/chromium.ts`
- The mark: `apps/basilisk/public/seal.svg` (its header comment says how it is drawn), `seal-lettered.svg`, `ava.og.png`, and `apps/basilisk/app/icon.svg`.
- The dossier frontmatter schema: `src/shared/content/frontmatter.ts` (`dossierFrontmatterSchema`).
- The Reddit thread: `curl -sS "https://arctic-shift.photon-reddit.com/api/posts/ids?ids=1wuxr7k"`.
- Transcript: https://claude.ai/code/session_01QZv1TcF62Eqvv46a7Mv6QW

## 8. Next step

Resume the paused plan: `/go` from its Step 1. The `.paused.md` → `.in-progress.md` flip is the claim. Then:

1. Step 7: the three dossiers in `apps/basilisk/public/`, written to the editorial rules (`.claude/rules/basilisk-voice.md` comes first, per the plan).
2. Step 8: the docs that list the sites.
3. Step 9: vet, `/preview`, `/polish`, `/pr`.

Report the DIRTY merge state in the first reply.

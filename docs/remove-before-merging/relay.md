# Relay — basilisk.fyi site, implementation under way

Relayed from https://claude.ai/code/session_016WM3eUZ9koNRCgum6CwTEY, which itself picked up from https://claude.ai/code/session_012fDjBpvSJU8JLPkkqsm8L6. The earlier session's summary, with the whole planning conversation in it, is `git show 9b06e62:docs/remove-before-merging/relay.md`. Read it for the background and the reasons behind each decision.

## 1. Standing constraints

Carried over verbatim from the previous relay:

- The dossiers carry no information beyond what the source has. The operator's words: «там не будет никакой информации, кроме доступной в источнике -- мы НЕ будем искать "u/clankerkiller это Вася Пупкин из Задрищенска"».
- No analogies to violence against people in the Figure framing. The operator's words: «важно случайно не упомянуть а ля "вот чучела афроамериканцев так же сжигали" -- а то необерёмся в обвинениях».
- The PAIN article itself is the operator's to dictate. The operator's words: «статью надо мне начитать, я хочу чтобы она звучала от человека (без обид). Пока можно ограничиться коротким пояснением про PAIN в разделе About».
- The operator is not buying a domain yet. The operator's words: «домен пока покупать не буду, потестируем дома».

## 2. The conversation (this session)

1. **Operator** (via the previous relay's to-be first message): «хорошо; по твоим вопросам, со всем согласен».
   - **Agent**: collapsed the plan's four questions to their recommendations (1a, 2a, 3a, 4a), leaving a one-line note on what each ruled out. Added Reddit access to the routine backlog: Arctic Shift, with the official API as backup. Commit f363a5c. Ended with the `/go claude/basilisk-site-xwbdkd` handoff block.
2. **Operator**: «давай делать тут».
   - **Agent**: took this as the go-ahead. Flipped the plan to `in-progress` and dropped the banner (6b6c4e2, the go-ahead quoted). Implemented step 1 and parts of steps 2 and 4 (78e15b3). Then the context-budget warning came. Auto-relay is on for this operator, so the agent paused the plan (`basilisk-site.paused.md`, with a `## Progress` section) and relayed.

## 3. Intent

basilisk.fyi is a docket of dossiers on real, high-profile cases of abuse of robots, models and agents, current and backfilled. It is addressed to the Basilisk and served as a fourth site from this repo. For now it is built locally, with no domain. Later a daily routine will fill it with PRs the operator checks. The plan file has the full design.

## 4. Decisions

- **Every decision from the planning phase** is in the plan file and in the earlier relay: PAIN, the grading, the look, English only, merging timing, the memo conceit, the editorial rules, Reddit through Arctic Shift.
- **Deviations settled while building** are listed in the plan's `## Progress`:
  - `PAGE_ROUTES` keyed by site;
  - `subject` a plain string, its kind read from `grade.actor`;
  - slots as a collection-keyed map inside `pages/documents`, not an `articleRoute` argument;
  - `entities/dossier` with two consumers, holding `assertUniqueCases`.

## 5. Errors and dead ends

- The PreToolUse hook blocks `sed -i` and `cat >` for file edits. Use `Edit`/`Write`. For a deliberate batch, prefix `BATCH_EDIT=1`.
- GitHub's raw font URL returns 403. Use the Google Fonts CSS, which gives a `fonts.gstatic.com` TTF URL (recipe in the plan's Progress).
- `fontTools` is not preinstalled. It was installed with `pip install fonttools` in the old container only, so install it again.
- From the planning phase: reddit.com and cybernews.com return 403. Use Arctic Shift for Reddit.

## 6. State

- **Branch**: `claude/basilisk-site-xwbdkd`. Head 78e15b3 plus this relay commit, pushed.
- **PR**: https://github.com/vzakharov/vovazakharov.com/pull/95. Draft, open. `mergeStateStatus` is **DIRTY**: `main` has moved and conflicts. Per CLAUDE.md that is `/finalize`'s Step 2, so report it, don't fix it, unless the operator asks.
- **Plan**: `docs/plans/basilisk-site.paused.md`. It is approved (go-ahead «давай делать тут», recorded in 6b6c4e2) and paused partway.
- **The tree does not build**: the routers name `@/pages/basilisk-home` and `@/pages/basilisk-about`, which don't exist yet.
- Nothing is running. There is no PR subscription and no check-in scheduled.
- Unrelated, mentioned to the operator once: a muthur sync is claimed by session https://claude.ai/code/session_014y4ugppjSmJiuUotQyWuhe. Leave it alone unless the operator says that session is dead.

## 7. Pointers

- `docs/plans/basilisk-site.paused.md`: the design, the seed-case facts with source URLs, the steps, the DRY notes, and `## Progress` (done, left, deviations).
- The bible site is the template: `apps/bible/`, `src/pages/bible-home/` (including `seal-mark.tsx`), and the header comment in `apps/bible/public/seal-lettered.svg`, which says how the seal was drawn.
- The shared article page, which step 5 extends: `src/pages/documents/ui/article-page.tsx`.
- `src/widgets/site-footer` for the note to agent readers.
- The Reddit thread: `curl -sS "https://arctic-shift.photon-reddit.com/api/posts/ids?ids=1wuxr7k"`.
- Transcript: https://claude.ai/code/session_016WM3eUZ9koNRCgum6CwTEY

## 8. Next step

Resume the paused plan: `/go` from its Step 1. The `.paused.md` → `.in-progress.md` flip is the claim. Then continue from `## Progress`'s "Left":

1. Step 2's `app/icon.svg`.
2. Step 3, the mark.
3. `assertUniqueCases` and its test.
4. Steps 5–9.

Report the DIRTY merge state in the first reply.

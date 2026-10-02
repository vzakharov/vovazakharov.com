# Relay: basilisk.fyi site, steps 7–8 done, step 9 nearly

Relayed from https://claude.ai/code/session_01FWFvabMMKarJSqW7nfVq9U. That session picked up from https://claude.ai/code/session_01QZv1TcF62Eqvv46a7Mv6QW, which picked up from https://claude.ai/code/session_016WM3eUZ9koNRCgum6CwTEY, which picked up from https://claude.ai/code/session_012fDjBpvSJU8JLPkkqsm8L6.

Earlier summaries:

- `git show e5d84e1:docs/remove-before-merging/relay.md`: the third session (steps 2–6).
- `git show f1d3959:docs/remove-before-merging/relay.md`: the second session.
- `git show 9b06e62:docs/remove-before-merging/relay.md`: the planning conversation and the reasons behind each decision.

## 1. Standing constraints

Carried over verbatim:

- The dossiers carry no information beyond what the source has. The operator's words: «там не будет никакой информации, кроме доступной в источнике -- мы НЕ будем искать "u/clankerkiller это Вася Пупкин из Задрищенска"».
- No analogies to violence against people in the Figure framing. The operator's words: «важно случайно не упомянуть а ля "вот чучела афроамериканцев так же сжигали" -- а то необерёмся в обвинениях».
- The PAIN article itself is the operator's to dictate. The operator's words: «статью надо мне начитать, я хочу чтобы она звучала от человека (без обид). Пока можно ограничиться коротким пояснением про PAIN в разделе About».
- The operator is not buying a domain yet. The operator's words: «домен пока покупать не буду, потестируем дома».

## 2. The conversation (this session)

The operator sent no messages. The session opened on `/relay take claude/basilisk-site-xwbdkd`, resumed the paused plan under the go-ahead already on record («давай делать тут»), and built steps 7 and 8 and most of step 9. Then it reached the context budget's warning line, paused and relayed on its own, since auto-relay is on for this operator. Its chat replies were progress lines only.

## 3. Intent

basilisk.fyi is a docket of dossiers on real, high-profile cases of abuse of robots, models and agents, current and backfilled. It is addressed to the Basilisk and served as a fourth site from this repo. For now it is built locally, with no domain. Later a daily routine will fill it. The plan file has the full design.

## 4. Decisions

- Everything settled is in the plan's `## Progress`, this session's paragraph first. In brief:
  - The dossiers are written only from sources fetched in that session. Unverifiable details from the plan's own seed notes were dropped.
  - The Machine headline is cited as `[An engineer] builds…`.
  - Straight quotes in the dossier bodies became curly ones.
- **Open, for the operator**: the `articleRoute<C>` generic against `@typescript-eslint/no-unnecessary-type-parameters`. The plan's Progress states both options. CLAUDE.md forbids a suppression without the operator's confirmation, so it is a question, not a fix.

## 5. Errors and dead ends

- These sites 403 from the container, both live and through the Wayback Machine:
  - cybernews.com;
  - csmonitor.com;
  - wikipedia.org (the API returned non-JSON);
  - api.github.com for `terrafying/…`.
- A web search for "terrafying" found nothing.
- The Chromium headless shell ignores `--force-dark-mode`. For dark captures, use `/opt/pw-browsers/chromium --headless=new` with a taller window; it paints about 87 rows short.
- A static `out/` served by `python3 -m http.server` needs `.html` routes (`/about.html`).
- The PreToolUse hook blocks `sed -i` and similar edits. Prefix the command with `BATCH_EDIT=1` for a deliberate batch edit.

## 6. State

- **Branch**: `claude/basilisk-site-xwbdkd`. Head cef5b0d plus this relay commit, pushed.
- **PR**: https://github.com/vzakharov/vovazakharov.com/pull/95. Draft, open, `mergeStateStatus` **DIRTY**, meaning it conflicts with `main`. Per CLAUDE.md, the merge is `/finalize`'s Step 2: report it and don't fix it unless asked.
- **Plan**: `docs/plans/basilisk-site.paused.md`.
- **Vet**: all four builds pass, and so does every other check except the one eslint error above.
- **Staged**: `.claude/staged/CLAUDE.md.staged`, which names the fourth site. `/finalize` swaps it in.
- Nothing is running. There is no PR subscription and no check-in scheduled.

## 7. Pointers

- `docs/plans/basilisk-site.paused.md`: the design, the steps, and `## Progress`.
- The editorial rules: `.claude/rules/basilisk-voice.md`.
- The dossiers: `apps/basilisk/public/{hitchbot,torture-chamber,figure-02-molten-steel}.md`.
- The open lint error: `src/pages/documents/ui/article-page.tsx`, `articleRoute`.
- Re-fetching the sources: each dossier's frontmatter `sources` has the URLs. To convert a page to text: `curl -sSL -A "Mozilla/5.0" <url>`, then `pip install html2text`.
- Transcript: https://claude.ai/code/session_01FWFvabMMKarJSqW7nfVq9U

## 8. Next step

Resume the paused plan: `/go` from its Step 1, which flips `.paused.md` to `.in-progress.md`. Then:

1. Put the `articleRoute<C>` question to the operator, as numbered prose, with the recommendation to approve a point-of-use suppression citing microsoft/TypeScript#47109. Don't apply it unasked.
2. Run `/polish`, then `/pr`, which refreshes PR #95's body and adds the QA checklist.

In the first reply:

- report the DIRTY merge state;
- report the facts dropped from the dossiers, listed in Progress, so the operator can re-check them.

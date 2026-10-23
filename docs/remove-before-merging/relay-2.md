# Relay 2 — implement the approved plan

## Standing constraints

From the operator, verbatim:

- «она не будет мерджить, она будет совать в свободный или новый пиар (по тем же принципам что и василиск)»
- «пояснить что всё же сама она деплоить не должна -- постольку поскольку всё можно проверять локальным сервером. If and when that changes, будем думать.»
- `hello-maya.md` is «текст буквально»: copy `docs/pr/201/attachments/hello-maya.md` byte for byte.

## The conversation

`docs/remove-before-merging/relay-1.md` covers everything up to the park: the opening question, and the agent's first opinion recommending a separate repo. After that:

1. **Operator:** a long reply quoting the agent's points one by one.
   - Separate repo: «ну она не будет мерджить … не вижу смысла дуть на воду … what's the worst thing that can happen, which wouldn't happen if this was a separate repo?»
   - Entry: «лучше какой-то "входной файл" (`начни <.../....md>`, чем скилл».
   - Memory: «я хочу чтобы Майя сама решала … Не на детерминированных проверках, на доверии.»
   - Continuity: «пусть это решает тоже она … ей должно быть прямо разрешено это менять».
   - Convergence: «иди вширь а не вглубь, ищи неожиданное», plus a programmatic random adjective-noun to search on, «может ещё генерировать ещё и ещё искать -- как захочет».
   - Budget: «укладываться в скажем 400к токенов … просто на слове».
   - Connectors off; static is fine; cost is fine.
   - «про muthur -- да, создай».

   **Agent:** conceded the separate repo bought nothing. Routed via `/task` to a draft plan and opened PR vzakharov/vovazakharov.com#201. Claimed the muthur sync and spawned session_01LikGwVjAy9cf8Vq5zXsBrX with `/update-muthur claimed`.

2. **Operator:** «сайт -- не … она пользуется всеми имеющимися у нас средствами, при необходимости пишет новые компоненты итп … Она должна мочь написать что-то, а мы потом может это ещё где-то даже переиспользуем.» Also: «maya/start.md должно говорить (агенту), что он и есть Майя -- … your every next chat message, reasoning, tool call, goes _from_ Maya, not _about_ her».

   **Agent:** replanned it as a full Next site under the house conventions, with the identity opening.

3. **Operator:** «давай дом personas/maya … и всё остальное к ней относящееся тогда нужно туда перенести (кроме reflections -- потому что они collocated)».

   **Agent:** replanned the home as `personas/maya/`, with her drafts moving in.

4. **Operator:** «оставил пару комментов» (seven review threads on #201). **Agent:** revised the plan by all seven (832a84e) and replied on each:
   - the entry file is `wander.md`;
   - she never deploys;
   - the die moves to `personas/tools`;
   - the die uses faker rather than an embedded list, after the operator asked why not a library;
   - `hello-maya.md` is added;
   - code stays in her slice (Steiger's insignificant-slice);
   - the rule file becomes a pointer, since the classifier may block `.claude/` edits.

   Two notes entries went to `writing/notes/the-five-percent.md` via a subagent.

5. **Operator:** «ответил на один». Their reply on the rule-file thread: «мы сейчас говорим про reflections только? я говорил вообще про "правила как себя вести"».

   **Agent:** replanned it (c0dd871). `personas/maya/maya.md` holds her general rules for how to be and behave, and the stub `.claude/rules/maya.md` points at it. The reflection craft is split into `personas/maya/reflections.md`. Another notes entry was added.

6. **Operator:** «звучит хорошо, давай начинать». **Agent:** flipped the plan in-progress, quoting the go-ahead (ca675ed). The session was past 200k tokens of context, so it paused the plan before any step (90fea0c) and relayed.

## Intent

An autonomous Майя, fired daily by a routine. She wanders the web, keeps what she wants, and builds on `maya.vovazakharov.com` with the repo's full toolset; her code is reusable. She works on trust, never merges and never deploys. The operator ruled out:

- a separate repo;
- a skill as the entry point;
- a static lane outside the house checks;
- a hand-picked word list;
- anything of hers under `.claude/` beyond a pointer.

## Decisions

The plan file holds them, with its "Rejected shapes" section. Terms coined in the conversation:

- **"жители"** — residents: personas living under `personas/`, one directory each.
- **"кубик" / the die** — `pnpm random-words`, faker adjective + noun.
- **"шеф"** — the operator's name in `hello-maya.md` for the main Claude agent.

## Errors and dead ends

- The old auto-branch `claude/blissful-sagan-cfdyi2` could not be deleted (proxy 403). It lingers at 65b616f and has no PR.
- Faker's English lists were counted, not assumed: v10.6.0 has 1,000 adjectives and 1,000 nouns.

## State

- **Branch:** `claude/maya-wander-cfdyi2`, head 90fea0c, pushed.
- **PR:** https://github.com/vzakharov/vovazakharov.com/pull/201, open draft. The `Proposed squash body:` comment and the tracked `docs/remove-before-merging/squash-message.md` are current with the plan.
- **Plan:** `docs/plans/maya-wander.paused.md`. Its Progress section reads "Done: nothing".
- **Running or waiting:** no CI, PR subscription, routine or check-in. The muthur sync runs in its own session, session_01LikGwVjAy9cf8Vq5zXsBrX.
- **Estimate:** this session is 2.5 h senior architect ("where a persona's freedom lives inside a repo whose merge deploys four sites, and how her home, her site and the shared code divide, is a structural call"). Remainder handed on:
  - 6.5 h middle developer — "a fifth Next site is routine but wide wiring: site config, router, placeholder page slice, scripts, deploy gate, publish arm, DNS, analytics, plus moving her drafts home";
  - 2 h senior prompter — "an entry file that makes the session speak as Майя and hands an unattended persona her freedom without steering it needs judgement".
- **Open question:** the operator's timezone for the routine. The plan uses UTC 06:47 meanwhile.
- The muthur sync offer was made; do not make it again.

## Pointers

- `docs/plans/maya-wander.paused.md` — the plan.
- `docs/pr/201/pr.md` and `docs/pr/201/attachments/hello-maya.md` — the review and the letter.
- `.claude/rules/maya-reflections.md` — the file being split.
- `.claude/skills/stand-up-site/SKILL.md`, `.claude/skills/file-basilisk-case/SKILL.md`.
- Predecessor transcript: https://claude.ai/code/session_01K5trw7n5rYxDcyNGXx2ngr

## Next step

Resume the paused plan with `/go`, from Step 1, Move her home. The go-ahead, quoted in ca675ed: «звучит хорошо, давай начинать».

# Bite 9 — the two idea documents: rules both agents follow

Repo `/home/user/vovazakharov.com`, branch `claude/mushroom-game-syama-lbirv7`
(PR #57). The game lives in `src/pages/mushrooms/` (`model/` pure and tested,
`ui/scene/` the Phaser side). The operator's two ideas are in
`docs/remove-before-merging/ideas/operator-ideas.md`, verbatim — read the
whole file; your brief names your idea. The plan is
`docs/plans/mushroom-game-syama.in-progress.md`: read § "Decisions the whole
game carries", § "Eaten so far" (what exists, module by module) and § "Rest
of the elephant" (items 9–12, the plan your document weighs the idea against).
Syama's drawing is `src/pages/mushrooms/reference/syama-drawing.webp`. The
player is six.

## What the document is

The operator asked (their words): «подготовь отдельные два документа (по
одному на идею), в котором опиши, насколько существующий код готов к
реализации той и другой, насколько drastic changes нужны в оставшемся плане и
текущей реализации. Исходя из этого будем думать. Документы на русском.»

So it is a decision aid, not a design and not a pitch. It is in **Russian**,
addressing the operator as «ты». Technical identifiers stay as they are in
code. Shape (CLAUDE.md § "Explaining things to people" and
`.claude/voice/voice.md`): the first paragraph is the verdict — how ready,
how drastic, how big — in plain words; evidence after it. Length is not
thoroughness: aim for what reads in five to ten minutes, tables where they
beat prose. Every readiness claim names the module(s) it rests on, checked in
the code, not guessed from the plan — read the code for each one you cite.

Sections, adapted to the idea:

1. **Вердикт** — a few sentences.
2. **Что идея требует** — the idea split into its separable parts, each
   with its own readiness: reused as is / changes / new, with the modules.
3. **Что меняется в текущей реализации** — what existing code and which
   standing decisions in the plan it overturns or bends (quote the decision's
   name).
4. **Что меняется в оставшемся плане** — items 9–12 one by one: survives,
   changes, disappears, gets easier or harder.
5. **Размер** — rough, in bites (a bite here has been one session of an
   orchestrator plus several subagents; bites 1–8 are the scale), per part,
   and which parts can ship alone.
6. **Развилки** — the decisions only the operator can make, each with the
   options, their cost, and your recommendation.
7. The ending your brief names.

Do not edit the plan or any source. Write only your document.

## Mechanics

- Write the document early and commit it as you go: a context runs out in
  about twenty-five minutes of heavy reading, and what is not committed is
  lost. `git add` only your own file, never `-A`. Push with
  `git push origin claude/mushroom-game-syama-lbirv7`; on a rejection
  `git pull --no-rebase origin claude/mushroom-game-syama-lbirv7`, then push.
  Never rebase, amend or force-push. Commit subject
  `content(mushrooms): …`, body what and why, ending with:

  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01PN4ML41dri7HvW3Pz54LLo
  ```

- Do not post on GitHub. Never run Bash in the background. No builds needed;
  `node --import tsx --test <file>` or a throwaway script under `tmp/` if a
  number settles a claim.
- Report (under 300 words, English): the SHA, the verdict in two lines, the
  forks, and anything you were unsure of.

# Relay 1 — no-pick-omit

## Standing constraints

- «да, байты передавай без моего одобрения сам» — bites hand over to the next
  session without the operator's review; each bite's end relays on its own.

## The conversation

1. **Operator:** «давай сделаем линтерное правило, запретив Pick<...>.
   Обоснование -- сначала должен задаваться узкий тип, от него расширяться. Если
   тип наследуется от схемы, то соответственно должна сначала задаваться узкая
   схема (отдельного линта под это не надо, он будет ловиться первым)»
   **Agent:** routed via `/task`; planned rather than built (231 sites, real
   forks). Mid-turn the operator added: «ну и Omit соответственно». The agent
   renamed the branch, wrote the draft plan, opened draft PR 158 with a squash
   proposal, and asked: (1) library types — (a) exempt, recommended, or (b) ban
   everywhere via `no-restricted-types`; (2) shape — (a) three-PR pizza,
   recommended, (b) elephant in one PR, (c) all at once.
2. **Operator:** «1а, 2б -- слон. Это не срочная работа, поэтому совершенно не
   важно, чтобы что-то пришло на мейн раньше» / «можешь начинать, а там
   посмотрим». Mid-turn: «да, байты передавай без моего одобрения сам».
   **Agent:** flipped the plan quoting the go-ahead, rewrote it as an
   unattended elephant, built the rule + test + a grandfather override of all
   117 flagged files, then paused for the context budget (past 200k) and
   relayed.

## Intent

Ban `Pick`/`Omit` over the repo's own types so narrow types (and narrow zod
schemas) are declared first and wide ones built from them. Not urgent; nothing
needs to reach `main` early. The operator does not want to review between
bites.

## Decisions

- **Library/DOM types and type parameters are exempt** (1a): they cannot be
  declared narrow first. Stock `@typescript-eslint/no-restricted-types` lost
  because it cannot tell them apart.
- **Elephant, one PR** (2b) over the pizza: no need to land early.
- **The rule is syntactic**, resolving names through the scope manager — no type
  services. Ownership = some name in the target resolves to an in-file
  declaration or a relative/`@/` import (or an `import('./…')` type).
- **The grandfather override lists every flagged file, not only the meadow** —
  the list is the remaining work; each bite removes what it migrates; the last
  bite deletes the block. It never reaches `main`.
- **No separate lint for zod `.pick()`/`.omit()`** — the operator ruled it out.
- `@typescript-eslint/parser` became a direct dev dependency (`^8.69.0`, the
  version already installed transitively) for the rule's test.
- `Pick<Messages['music'], …>` takes `Messages['music']` whole, no exemption.

## Errors and dead ends

None worth keeping; the only fixes were lint/tsc nits in the rule's own files.

## State

- Branch `claude/no-pick-omit-ikbd3v`, head `ac419e3`, pushed.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/158, squash
  proposal in `docs/remove-before-merging/squash-message.md` (its body still
  describes the pizza-era "everything outside the meadow" scope — reconcile it
  at the next `/pr` refresh).
- Plan: `docs/plans/no-pick-omit.paused.md`, with `## Eaten so far`,
  `## Rest of the bite`, `## Rest of the elephant`, `## The loop`.
- Estimate: this session 2 h senior developer (the rule and its test) + 1.5 h
  staff architect (the convention). Remainder handed on: 11 h senior developer —
  "219 sites need each wide type decomposed into named bases, a naming judgement
  per type that a codemod cannot make".
- Nothing running, no PR subscription. The muthur sync offer was made; do not
  make it again.

## Pointers

- `docs/plans/no-pick-omit.paused.md` — the contract, recipe and loop.
- `eslint/rules/no-pick-omit.ts`, `eslint/rules/no-pick-omit.test.ts`.
- `eslint.config.ts` — the override block above "The two links built on a bare
  `Anchor`"; its `files:` list is the work left.
- Re-list flagged files: lint the files `grep -rlE '\b(Pick|Omit)<'` finds and
  filter `vova/no-pick-omit` from `--format json`.
- Predecessor transcript:
  https://claude.ai/code/session_014kf4pQVj4A1ZWtBJR9onxj

## Next step

Resume the paused plan with `/go` from its Step 1: finish the first bite (the 21
flagged files outside `src/pages/mushrooms/`, each leaving the override), then
Steps 3–4, pause, and `/relay go` to the next bite without asking the operator.

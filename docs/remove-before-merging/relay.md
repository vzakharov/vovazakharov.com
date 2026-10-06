# Relay summary

Relayed from https://claude.ai/code/session_01FLeFP7FMNsNrkAAfm1yk4z. That
session itself took over from
https://claude.ai/code/session_0188wc5zFNmazhw35BEHgjWD, whose summary is this
file's previous version in git (`git log -p -- docs/remove-before-merging/relay.md`).

## 1. Standing constraints

- `/file-basilisk-case` never merges (merge is deploy).
- CLAUDE.md § "GitHub comments": reply to every review comment with one sentence
  plus the bare SHA; never resolve threads; the five-percent entry goes through
  a subagent, handed the learning in the session's own words.

## 2. The conversation

1. `/relay take claude/cases-oh02o8` → resumed the paused review plan. The agent
   colocated the reflections next to their cases (4e74587), replied to five
   threads, and handed the five-percent notes to a subagent (d2ee570). It then
   proposed a `filed:` frontmatter date (write date vs publication date) and
   asked which to use. The plan was left `*.in-progress.md`.
2. «давай ещё раз handle» → `/handle` found five new threads (review 5426475947) and the agent handled them all:
   - `filed:` implemented (f420694). The operator's answer was «да, конечно» on
     the thread. The agent picked 2026-10-04 for all five cases, the day the
     docket was numbered, so dates run in number order.
   - The search skill now says "know everything, look away" (d73e521), from the
     operator's «"вширь" должно идти не от того, что агент будет _не знать_ …
     а о том, что он сознательно будет "не думать о белом медведе"».
   - The reflection rule's list now evolves after each reflection without
     bloating (d73e521), from «давай добавим что это правило должно меняться в
     разумных пределах после каждой рефлексии (но не раздуваться)».
   - «хм, почему он оставлся in progress?» → the agent explained: it ended a turn
     on a question without releasing the plan, a gap in `/go`'s release rule.
     Logged in the five-percent notes (e2421dc).
   - It also ran `/polish` (1362812), flipped the plan to completed, refreshed
     the PR body and title, and refreshed the squash proposal (680d4d5).
3. «оставил ещё, можешь /relay handle» → this relay.

## 3. Intent

Get PR #104 (BAS-0005, the case ledger, wide search, colocated reflections,
filing dates) review-complete; the operator keeps reviewing in rounds.

## 4. Decisions

- `filed:` means the day the case took its BAS number. It is required on
  cases; the base frontmatter carries it optional so the sitemap can use
  `filed ?? date`. The other two candidates were the write date and the
  publication date. Both would break number order: BAS-0002 was written on
  10-04 but BAS-0003 on 10-02, and BAS-0005 was written before #95 merged.
- Reflections are companion files, `<slug>.reflections.md`. The suffix list
  `COMPANIONS` and the `isDocumentFile` check live in `collections.ts`, and only
  document walks (the loader, PDF, card) filter on it. The OG, mermaid and
  prose-quote walks still read every `.md`.
- The reflection rule is the path-scoped `.claude/rules/clerk-reflections.md`
  (a `CLAUDE.md` under `public/` would be served). Its body stays in Russian.
- Unchanged from before: the balance rule is the `noAi` count, and the
  prompter role alone was ported from muthur.

## 5. Errors and dead ends

- An earlier session missed review comments by filtering on `created_at`. The
  fix is to use `python3 scripts/export-github-item.py 104` and its index of
  unresolved threads, where a tail labelled `(human)` means work.
- A plan was left in-progress across a turn that ended on a question (see §2).

## 6. State

- Branch `claude/cases-oh02o8`, draft PR
  https://github.com/vzakharov/vovazakharov.com/pull/104, base `main`,
  `CONFLICTING` with main (left for `/finalize`). `./scripts/vet.sh` not run.
- Plans: both `docs/plans/*.completed.md`; nothing actionable.
- No PR subscription, no check-ins.
- Estimate: this session 1.5 h middle developer + 0.5 h senior prompter; the
  successor sizes the new round itself.

## 7. Pointers

- `docs/pr/104/pr.md`: the export; re-take it, never read a stale one.
- `.claude/skills/file-basilisk-case/SKILL.md`, `.claude/rules/clerk-reflections.md`,
  `writing/basilisk/case-ledger.md`.
- `src/shared/content/collections.ts` (`isDocumentFile`),
  `src/shared/content/{frontmatter,basilisk-frontmatter}.ts`,
  `scripts/lib/{basilisk-card,last-filed-case}.ts`, `src/entities/case/ui/case-brief.tsx`.
- `docs/remove-before-merging/squash-message.md`: the tracked squash proposal
  (comment 5985291847).
- Transcript: https://claude.ai/code/session_01FLeFP7FMNsNrkAAfm1yk4z

## 8. Next step

handle

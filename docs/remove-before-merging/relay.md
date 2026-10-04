# Relay — PR #95's second review, first leg

## Standing constraints

None stated by the operator this session. House rules in force: never resolve a review thread; reply on every thread addressed, the commit SHA bare; no lint-suppression comment without the operator's OK; a `writing/notes/the-five-percent.md` edit goes through a subagent.

## The conversation

1. **Operator:** `/handle claude/basilisk-site-xwbdkd`
   **Agent:** attached to the branch (the auto-branch `claude/basilisk-site-xwbdkd-x62dsx` deleted locally; its remote delete failed, it was never pushed), committed the fresh PR export (b877b77) and read 16 unresolved threads, all review of shipped code, so the review lane → `/go` § "Planless entry". Built T01/T04 (80ebe36) and the schema/collection refactor (747e839); the context-budget warning came, so it paused at a clean point.
2. **Operator (mid-turn):** «добавляю поле author и источники для FAQ — это относится ко всем коллекциям, не только в basilisk»
   **Agent:** recorded it as a decision in the paused plan rather than building it at the budget line, and relayed.

## Intent

Work every one of the 16 threads in `docs/pr/95/pr.md` (T01–T16), reply on each, then `/polish` and `/pr`. The site's voice is being found together with the operator (T16): an earlier note framing a voice correction as an agent failure was wrong.

## Decisions

All in `docs/plans/basilisk-review-2.paused.md` — § "Done", § "Decided since, not yet built" (the operator's all-collections ruling, above) and the answers owed under § "Left" item 8. Coined: **the Clerk** — the record's narrating persona, now also a byline (`author: clerk`).

## Errors and dead ends

- Putting the basilisk schemas in their own module that imports `frontmatter.ts` while `frontmatter.ts` held the registry is an import cycle; the registry moved to `collection-schemas.ts` for that reason.
- `vova/no-redundant-property-copy` rejects `sources={frontmatter.sources}`; `{...pick(frontmatter, 'sources')}` is the house form.

## State

- Branch `claude/basilisk-site-xwbdkd`, PR https://github.com/vzakharov/vovazakharov.com/pull/95 (draft, `CONFLICTING` against `main` — `/finalize`'s merge, report only).
- Last pushed commit before this file: 0be10ba. Plan: `docs/plans/basilisk-review-2.paused.md`.
- `apps/basilisk/public/ava.og.png` is stale against the re-lettered seal, so `content:og:basilisk --check` fails until the plan's card item lands.
- No PR subscription, no check-ins scheduled.

## Pointers

- `docs/plans/basilisk-review-2.paused.md` — the whole task list and the answers owed.
- `docs/pr/95/pr.md` — the export the work answers; re-run `python3 scripts/export-github-item.py 95` before replying, a new comment may have landed.
- `.claude/rules/basilisk-voice.md`, `.claude/rules/content.md` — the rules the content and code edits touch.
- Seal tooling: `pip install --target tmp/fonttools fonttools`; the font per `scripts/letter-basilisk-seal.py`'s docstring.
- The relaying session: https://claude.ai/code/session_0128qXGAze3qU92M7VkELhRt

## Next step

Resume the paused plan (`/go` from its Step 1): build § "Decided since" first — it reshapes the byline and sources work in § "Left" — then items 1–8.

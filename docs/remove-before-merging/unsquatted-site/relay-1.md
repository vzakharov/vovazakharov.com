# Relay 1 — PR #231, second review round

## Standing constraints

None stated beyond the repo's own (never resolve a review thread; reply on
GitHub to each addressed comment, in Russian, bare SHAs).

## The conversation

1. **Operator:** `/handle claude/unsquatted-site`
   - Agent: attached to the branch (PR https://github.com/vzakharov/vovazakharov.com/pull/231,
     base `main`, draft, MERGEABLE/CLEAN; the auto-branch `claude/great-bell-xx8b9u`
     never existed on origin, so its delete was refused as `stale info`).
     Committed the export (11 threads awaiting an answer, no plan on the
     branch → review lane via `/go` § "Planless entry"). Worked through the
     threads in commits 8d26ea7, 104d75a, 4dde509 (see the plan file).
2. **Operator (mid-turn):** «можно хак делать только если префикс (то есть фактически tld) -- словарное слово, а остаток раскладывается на словарные слова (тогда пройдёт например biblelovers → lovers.bible, но не bibleical → ical.bible)»
   - Agent: acknowledged; queued it as item 1 of the plan's "Left".
3. **Operator (mid-turn):** «перед завершением хода, разверни что получилось на preview.vovazakharov.com пжст»
   - Agent: dispatched `preview.yml` for `unsquatted` from 4dde509 (run
     40850751706; live at 09:36Z, `Built unsquatted from 4dde509…`), then
     paused the plan and relayed for the context budget. The whole session
     was one turn, so `relay-last-reply.py` found no earlier reply to append.

## Intent

Get every thread of PR #231's second review round answered in code and on
GitHub, the PR left ready for `/finalize` later. The operator wants questions
that do not block work asked while work continues.

## Decisions

- **Hacks:** zones are Porkbun's list ∩ IANA root list, letters only (539).
  Suffix hacks on any such zone; prefix hacks currently need a 3+-letter zone
  (`MIN_LEADING_ZONE`) — to be replaced by the operator's dictionary rule
  (message 2), which applies to prefix hacks only. At most 3 hacks lead the
  grid so `.com` stays visible (`HACKS_SHOWN`).
- **Errors:** `errorClass(name)` in `kernel/shared/lib/error-class.ts`, since
  `unicorn/custom-error-definition` demands a constructor per class;
  `fetchOk(url, ErrorClass, init)` takes the class as its required second
  argument (the operator's "ошибка — обязательный второй параметр").
- **`useProvided(Context, Provider)`** passes the provider component, not an
  error instance, so nothing is constructed per render; the message reads
  `Provider.name` (mangled in production, readable in dev).
- **Picks:** filename is the domain (`foxedpage.com.md`), so `domain` is not
  restated in frontmatter; same-day picks sort by domain. `shownUntil` is
  inclusive by calendar day at build.
- **T03 (Maya):** a no-op — see the plan's item 5.

## Errors and dead ends

- Per-class `override name = …` error classes failed
  `unicorn/custom-error-definition`; replaced by `errorClass`.
- `fetchOk`'s `cause` needed the `instanceof Error` wrap
  (`vova/no-uncaused-rethrow`).

## State

- Branch `claude/unsquatted-site`, PR #231 (draft), head f2961c0 pushed.
- Plan: `docs/plans/unsquatted-review-2.paused.md` — done and left.
- Preview: run 40850751706 publishing unsquatted to
  https://preview.vovazakharov.com from 4dde509 — published and serving.
- No GitHub replies posted yet; no PR subscription; no scheduled check-in.
- Estimate: this session 7 h senior developer. Remainder handed on:
  `--part 5 senior developer "a dictionary-backed split rule that must reach the browser lazily, a shared popover lifted across apps, a repo-wide lint rule's rollout, and eleven review replies" --part 1 middle designer "the social card's mark re-composed against the wordmark and re-rendered" --part 0.5 middle copywriter "the hero, meta description and card brought to one wording without a guessed price"`.

## Pointers

- `docs/plans/unsquatted-review-2.paused.md` — the work list.
- `docs/pr/231/pr.md` — the export this round answers (re-export before
  replying: `python3 scripts/export-github-item.py 231`).
- `src/unsquatted/pages/home/lib/lookup.ts` — `domainHacks`, `rowsFor`.
- `tmp/porkbun.json`, `tmp/iana-tlds.txt` are gone with this container;
  re-fetch with `curl -sS -X POST https://api.porkbun.com/api/json/v3/pricing/get`
  and `curl -sS https://data.iana.org/TLD/tlds-alpha-by-domain.txt`.
- Predecessor transcript: https://claude.ai/code/session_01DaohkFVFSZRJpaQ8xVP57q

## Next step

Resume the paused plan (`/go` Step 1 on
`docs/plans/unsquatted-review-2.paused.md`): the operator's dictionary rule
for prefix hacks first («можно хак делать только если префикс … словарное
слово, а остаток раскладывается на словарные слова»), then T10, T04, the
lint-rule question (ask, keep working), the 11 GitHub replies, `/polish`,
`/pr`.

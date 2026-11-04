# Relay 4 — unsquatted: one review comment left (card from a clipboard promise)

## 1. Standing constraints

- **Do not run `/finalize` unasked.** The operator: «к слову я никогда не просил
  finalize, тьфу уж эти relay сообщения». The previous relay's launch line said
  "затем finalize" while its summary said "when the operator says"; this
  session ran it on the launch line and was stopped. Land prep only on an
  explicit ask.

## 2. The conversation

**Launch:** `/relay take claude/unsquatted-catalogue-and-fixes-4mocr0 — 210
имён, sticky-заголовок на превью; дальше — переписать фразу «Your queries never
leave your browser», обновить PR, затем finalize`

**Agent:** rewrote `privateWhy` ("Your browser asks the registries itself…",
`b4db7d7`), republished preview, refreshed the PR body, then started
`/finalize` (polish subagent: empty `18a5c27`, plus a critical `/five-percent`
on the line: `.io`/`.co`/`.me` have no RDAP and go to `dns.google`).

**Operator (mid-turn):** «сессии: ставить ли хак в результатах проверки
первым?» — «не надо, это сбивает когда всегда первым ждёшь .com»

**Agent:** left the order as is; named Google's DNS in the line (`7e8dda2`).

**Operator (mid-turn):** «нажатие шафла у up for grabs, когда он залип, не
должно приводить к скроллу вверх»

**Agent:** removed the scroll-back from `pick-deck.tsx` (`f277554`), verified
`scrollY` unchanged by Playwright, republished; asked the operator to settle
the five-percent verdict the finalize gate wanted.

**Operator:** «не понимаю о чём речь. чекер же работает только при подготовке
курированного списка, а не при проверке из браузера?»

**Agent:** explained there are two checks — `pnpm names` (list prep, Porkbun)
and the page's field, which runs in the visitor's browser
(`verdict/lib/check-domain.ts`: RDAP, else `dns.google`).

**Operator:** «к слову я никогда не просил finalize, тьфу уж эти relay
сообщения»

**Agent:** stopped vet; reported what finalize had done (empty polish commit,
the five-percent review); PR still draft.

**Operator:**

> > У .io, .co и .me RDAP нет, поэтому для них браузер спрашивает dns.google.
>
> ну и что -- все равно же ничего не уходит к нам на "сервер". но новая
> формулировка подсказки мне кстати все равно не нравится -- тяжеловесная

**Agent:** shortened to "Your browser checks names directly, so we never see
them and can't steal them." (`92ff167`), republished.

**Operator:** «покомментил»

**Agent:** ran `/handle`: three threads. T03 (lower `firk.in` so the OG card
has no `.in` beside `mudlark.ing`) → score 8→7, card re-rendered, now
`letitproof.com`; T04 (runbook: read `picks.yaml` by command or line range,
never whole) → paragraph in `RUNBOOK.md`; both `8924856`, replied. Recorded
the five-percent verdict (0.2) and replied on its thread. T01 not done — the
context budget. (verbatim in Last agent turn)

## 3. Intent

Land PR #244 eventually; for now, work the operator's review comments as they
come. No finalize until asked.

## 4. Decisions

- Hack does not lead the checker's rows: `.com` stays first.
- Privacy line: "Your browser checks names directly, so we never see them and
  can't steal them." — no list of who the browser asks.
- A redraw from the stuck heading does not scroll.
- `firk.in` at score 7.

## 5. Errors and dead ends

- Ran `/finalize` off the relay's launch line; the operator never asked.
- First rewrite claimed "asks the registries itself" — false for zones without
  RDAP; the Google-naming fix that followed was too heavy.

## 6. State

- Branch `claude/unsquatted-catalogue-and-fixes-4mocr0`, draft PR
  https://github.com/vzakharov/vovazakharov.com/pull/244, head `8924856`
  (this file follows it). Mergeable/CLEAN at session start; `main` not merged.
- Plan: `docs/plans/unsquatted-catalogue-and-fixes.completed.md`.
- Preview: a publish of `8924856` was dispatched (run 41772881892); confirm
  with
  `gh api "repos/vzakharov/preview.vovazakharov.com/commits?sha=gh-pages&per_page=1" --jq '.[0].commit.message'`
  and `gh api repos/vzakharov/preview.vovazakharov.com/pages/builds/latest --jq .status`.
  Republish after each visible change.
- `docs/pr/244/pr.md` export committed this session; vet never ran to the end.
- PR body is current up to `92ff167`; it does not yet mention the `firk.in`
  score or the runbook paragraph.
- Estimate: this session 1 h middle developer + 0.5 h senior copywriter. Rest
  handed on: ~1.5 h middle developer for T01.

## 7. Pointers

- T01:
  https://github.com/vzakharov/vovazakharov.com/pull/244#discussion_r4463233022
  — `src/unsquatted/pages/home/field-tools/ui/field-tools.tsx` (`ShareMenu`,
  `onReached`, `drawCard`), `src/shell/shared/ui/use-copied.ts:23`.
- Verdict ledger:
  `writing/notes/five-percent-verdicts/claude/unsquatted-catalogue-and-fixes-4mocr0/verdicts.json`.
- `src/unsquatted/scripts/RUNBOOK.md` — the new paragraph on reading
  `picks.yaml`.
- Previous summaries: `relay-1.md`..`relay-3.md` beside this file.
- This session's transcript:
  https://claude.ai/code/session_01DaohkF5yiTVEPDEzVT7g7Y

## 8. Next step

Address T01, which the operator answered «да, давай»: "Copy as image" hands
the clipboard a `Promise<Blob>` (`ClipboardItem` accepts one; `useCopied`
gains a branch for it) that draws the card once the hidden-zone lookups
started by reaching the share button have settled, so a fast tap still lists
them. Preview it, republish, reply on the thread with the SHA, refresh the PR
body (add `firk.in`/runbook too). Then wait for the operator — no finalize.

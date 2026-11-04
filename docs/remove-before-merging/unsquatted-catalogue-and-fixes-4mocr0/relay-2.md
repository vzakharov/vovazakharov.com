# Relay 2 — unsquatted: premium check, hack patterns, catalogue to 200

## 1. Standing constraints

None stated by the operator. (`relay-1.md` holds the earlier session's.)

## 2. The conversation

**Launch:** `/relay take claude/unsquatted-catalogue-and-fixes-4mocr0 — 137 имён
добавлены, дальше — проверка хаков на премиум через ключ Porkbun, затем polish
и обновление PR`

**Operator (mid-turn, with the OG card showing touchst.one, foxedpage.com,
lodest.one, mudlark.ing):**

> не нравится что попали два одинаковой "конструкции", возможно конструцию тоже
> стоит хранить в каталоге (хотя бы для собственного пользования)
>
> > Проверить это можно только через checkDomain в API Porkbun, и ключа в
> > контейнере нет, поэтому сейчас ищу, как его подключить.
>
> вообще PORKBUN_API_KEY и PORKBUN_SECRET_API_KEY есть

**Operator (mid-turn):**

> > возможно конструцию тоже стоит хранить в каталоге (хотя бы для собственного
> > пользования)
>
> хотя touchst.one и lodest.one это одна "конструкция", так что возможно
> что-то ещё надо для каталога (типа stone в качестве <something>)

**Agent:** added `lib/registrar.ts` (Porkbun keyed `checkDomain`) to
`pnpm names check`/`recheck`; recheck found 40 of 62 hacks premium
($54–$1,207/yr) or reserved (`for.bid`, `slumber.land`) — moved to the ledger
under new verdicts `premium`/`reserved`; all `.com` clean. Added a
`construction` field (the tail the zone spells: `st.one`, `.red`), the card
showing one per construction; runbook updated. Commit `e3b3a84`. **Asked:** (1)
ten of the 22 remaining hacks share `.red` — trim to two or three, rest to the
ledger as `taste`? (2) replace the 40 dropped hacks (97 new now)?

**Operator:**

> > Поэтому у каждого хака появилось поле construction: …
>
> ты случайно не назвал это construction just because that was what I suggested?

**Agent:** admitted yes; proposed `pattern` written as a mask (`*st.one`), which
reads as what it is and extends to `.com` tricks (`*page.com`).

**Operator:** «да»

**Operator (mid-turn):**

> > Пока жду ответа, иду в /preview.
>
> ты туда кстати не пошёл

**Agent:** renamed to `pattern: "*st.one"` (commit `970fdb4`), then started
`/preview` (dev server booted, then stopped at the context-budget pause; no
screenshot taken).

**Operator (mid-turn):**

> > а сейчас новых 97.
>
> всего сколько? из старых тоже выбыл кто-то? нужно total >= 200

**Agent:** (not yet answered in chat — this relay's report answers it) total is
197: 100 earlier, all `.com`, none dropped; 97 from the last run. Paused for the
context budget and relayed.

## 3. Intent

A curated list of ≥200 names, every one registrable at the ordinary price, in
varied forms, with no trick repeated so often it reads as one name. Blurbs in
the one template (`tagline` + `uses`). Premiums invisible to the page's browser
checker are accepted.

## 4. Decisions

- **`pattern`** (not `construction`, the operator's own word, which the agent
  had copied unexamined): a mask over the domain's tail, `"*st.one"`, `"*.red"`,
  `"*k.in"`; required on `form: hack`, optional elsewhere; the loader checks
  the domain ends with it. `variedPicks(count)` in `deck/model/picks.ts` gives
  the best names with distinct patterns; the OG card uses it.
- **Ledger verdicts** `premium` and `reserved` (registrar's words, on names RDAP
  calls unregistered) beside `taken`/`taste`.
- **`registrarOffer`** spaces calls 1 s apart (Porkbun: 10 checks / 10 s) and
  throws when the keys are missing — the check is on the primary path.
- Runbook rule: one or two per pattern per run.

## 5. Errors and dead ends

- The agent reverted `ledger.jsonl` with `git checkout` to undo a smoke-test
  row and wiped the 40 premium rows with it; restored before commit from
  `HEAD:picks.yaml`'s categories. Smoke-test `names check` against a scratch
  copy, or delete the one row by hand.
- `unicorn/prefer-switch` vs `default-case` vs `switch-exhaustiveness-check`
  fight over a 4-way `verdict.state` branch in `names.ts`; resolved by
  extracting `priced()` and keeping if/else.

## 6. State

- Branch `claude/unsquatted-catalogue-and-fixes-4mocr0`, draft PR
  https://github.com/vzakharov/vovazakharov.com/pull/244, last code commit
  `970fdb4` (this file and the plan status follow it).
- Plan: `docs/plans/unsquatted-catalogue-and-fixes.paused.md`, § "Status"
  updated (premium check done; ≥200 open).
- Catalogue: 197 names — 95 compound, 29 coinage, 23 phrase, 22 hack, 17 word,
  11 respelling. Hack patterns: `*.red` ×10, `*.ing` ×6, `*.in` ×2, `*k.in` ×2,
  `*.day`, `*.land`.
- Not done: `/preview` of the three UI fixes, `/polish`, `/pr` refresh (PR body
  and squash proposal still describe recast blurbs; they lack
  `form`/`tagline`/`uses`/`pattern`, the premium check and the true counts).
  No CI, subscription or check-in. `vet.sh` not run.
- Estimate: this session 1.5 h middle developer + 0.5 h senior copywriter.
  Remainder handed on: ~1.5 h senior copywriter (a naming run to ≥200, more if
  `*.red` is trimmed, spread across forms and patterns), ~1.5 h middle
  developer (preview, polish, PR refresh).

## 7. Pointers

- `src/unsquatted/scripts/lib/registrar.ts` — the keyed check;
  `scripts/names.ts` — `check`/`recheck` using it; `scripts/RUNBOOK.md` — the
  naming run, now with premiums and patterns; `scripts/ledger.jsonl`.
- `src/unsquatted/pages/home/deck/model/picks.ts` + `picks.yaml` — schema,
  `pattern`, `variedPicks`.
- `src/unsquatted/scripts/lib/unsquatted-card.ts` — the OG card;
  `pnpm content:og unsquatted` re-renders it.
- UI fixes to preview: `pages/home/field-tools/ui/copied-toast.tsx`,
  `field-tools/lib/share-card.ts`, the shortlist `Editor`; test name
  `reconquista` (only `.dev` free among shown zones).
- `relay-1.md` beside this file — the session before.
- This session's transcript: https://claude.ai/code/session_01DaohkF94kya1oG4M67Vu2e

## 8. Next step

No to-be message was given; this follows the operator's latest asks.

1. Answer the operator's "всего сколько? … нужно total >= 200" if this relay's
   report has not landed for them: 197, none of the old 100 dropped.
2. A naming run per `RUNBOOK.md` to bring the catalogue to ≥200, spread toward
   the forms the list holds least of and away from existing patterns (new
   names run through `pnpm names check`, which now filters premiums). Whether
   to trim `*.red` (ten names) is still the operator's to say — ask, and size
   the run to cover the trim if they agree.
3. Then resume the paused plan (`/go`): `/preview` the three UI fixes,
   `/polish`, `/pr` refresh with the squash proposal corrected.

Still open with the operator: the sixth form, "a word in a meaningful zone"
(`murmur.studio`), from relay 1.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Да, честно говоря, в основном поэтому. Слово взято из твоего сообщения, и я не проверил, подходит ли оно к тому, что в поле на самом деле лежит.

А лежит там не «конструкция» в широком смысле, а узкая вещь: кусок в конце домена, на котором держится трюк (`st.one`, `.red`). У «construction» две проблемы:

- **Слишком общее.** Оно обещает описание любого приёма, а работает только для хаков. У `foxedpage.com` тоже есть «конструкция», но поле её не выразит.
- **Значение не читается из имени.** Встретив `construction: .red`, без комментария в схеме не поймёшь, что это хвост домена.

Я бы переименовал в **`pattern`** и писал значение маской: `*st.one`, `*.red`, `*k.in`. Тогда сразу видно, что это шаблон, по которому совпадают имена. И формат сам расширяется на `.com`, если когда-нибудь захочется ловить повторы вроде `*page.com`. Сейчас поле обязательно только для хаков, тут ничего не меняется.

Переименовать в `pattern` с маской, или оставить как есть? Пока жду ответа, иду в `/preview`.
```

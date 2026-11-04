# Relay 1 — unsquatted: catalogue, names in other forms, UI fixes

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

**Operator (opening):**

> несколько правок к unsquatted:
> 1- копируемую картинку сделать чуть больше и держать чуть подольше
> 2- при edit на шортлисте фокусироваться на textarea
> 3- кажется, стоит весь каталог up for grabs объединить в единый файл (какой: json, yaml, csv -- тебе виднее)
> 4- в последний заход (когда было добавлено 90 новых) все хуки (или как мы их называем?) были сделаны по типу "Blablaa blabla. A blabla or a blabla", хотя до этого было хоть минимальное разнообразие (например: "Sounds like a podcast studio. Short and soft.") -- посмотреть, какие могут более естесвенно звучать в других конструкциях, чтобы не было такой формуличности. 100% не уверен что это будет лучше -- надо прикинуть
> 5- получилось, что почти все 100 -- сочетания двух слов, хотя ранбук и таргетил на "разнообразие" (видимо, разнообразие коснулось сути но не формы). Теперь нужно затащить 100 каких-то других -- редких слов, слов с пропущенными буквами, придуманных слов на базе других, домейн-хаков, итп
> 6- когда нажимаешь copy as image, а в открытых (ещё не развёрнутых) tld только одно свободное (пример: reconquista -- есть только .dev) то на карточке есть только одно это свободное, при том что под катом много свободных других.
>
> пока всё, может по пути ещё что найду

**Agent:** routed to `/task`: plan, then go (no operator gate). Renamed the
branch, wrote the plan, opened draft PR #244 with a squash proposal, then
implemented: one YAML catalogue (3), the UI fixes (1, 2, 6), 49 blurbs recast
into varied shapes (4), and started brainstorming and checking names (5).

**Operator:**

> не, чё-то "переписки" блёрбов не понравились, видно что специально ищем как сказать то же самое по-другому, и более рекламно, менее информативно, что ли, стало. Меняем подход: возвращаем и, наоборот, те которые не подходят под этот формат, меняем на него. Раз не можем обеспечить вариативность, обеспечиваем консистентность.

**Agent:** reverted the recast commit, brought the dozen outliers into the
template, added a `form` field to every entry, and rewrote the runbook to hold
the template.

**Operator:**

> +посмотреть, можно ли тогда сделать теглайн строкой, а "A[n] x[, a[n] y] or a[n] y" генерить программно из перечисления x[, y,] z

**Agent:** did it: entries carry `tagline` + `uses` (1–3, bare), and
`deck/lib/uses.ts` composes the sentence with a/an by sound, under a unit test;
every old blurb recomposed byte-identically except one comma→"or".

**Operator:**

> (кстати, _ровно_ 100 не нужно -- если больше получится тоже ок)

**Agent:** acknowledged; carried on checking names.

**Operator:**

> по поводу изначально заданных углов (пропущенные гласные, редкие слова, хаки итп) -- есть какие-то категории, которые я пропустил?

**Agent:** listed the ones missed: reduplication (`hugger-mugger`), loanwords,
archaic spellings (`physick`), invented toponyms (`ashbyfold`-like), a word in a
meaningful zone (`murmur.studio`), plus anagrams/palindromes/digits/acronyms
(rarely good). Added the first four this run, mapped onto existing forms.
**Asked:** whether to add "a word in a meaningful zone" as a sixth form — it is
neither `.com` nor a hack, so it changes what the site calls a free name. Not
yet answered.

**Agent (progress):** added 137 names, ledger and OG card; context budget
passed 300k, so it paused the plan for a relay.

**Operator:**

> как бы нам вот такое ещё учесть. первое -- преимум-домен, второе -- видимо слово в стоп-листе гугла, но у нас показывается как "grab".
>
> понятно, что с браузера такие вещи, может, недоступны, это наверное можно пока пережить, но при подготовке курированного списка не хотелось бы включать те которые нифига не $11 или которых попросту нет

(Two screenshots from Porkbun: `anem.one` — Premium, $1092.18/yr; `fuck.app` —
unavailable, shown by unsquatted as "grab".)

**Agent:** explained RDAP answers 404 for both, so `names check` cannot see
premiums or reserved words; new gTLDs price dictionary words as premium, so most
of the 62 hacks are suspect, `.com` is not. Asked the operator to add Porkbun
API keys as environment secrets (`PORKBUN_API_KEY`, `PORKBUN_SECRET_API_KEY`)
so the keyed `checkDomain` call can run; recorded it in the plan as blocking
before merge; relayed. (verbatim in Last agent turn)

## 3. Intent

A curated list whose every name is genuinely registrable at the ordinary price,
in varied forms rather than two-word compounds, with blurbs in one consistent,
informative (not salesy) shape. Ruled out: varied blurb shapes; names that are
premium or reserved. The browser checker not seeing premiums is accepted for now
("это наверное можно пока пережить").

## 4. Decisions

- **YAML catalogue** at `src/unsquatted/pages/home/deck/model/picks.yaml`, a map
  keyed by domain (duplicate key = parse error via `yaml`'s default), read off
  `process.cwd()` (the site dir), over JSON (quotes in prose; silent duplicate
  keys) and CSV. `public/picks/` removed — it existed for articles that never
  came.
- **Blurb = `tagline` + `uses`**, composed by `usesSentence`; the schema rejects
  a use carrying an article or a full stop. Beat hand-kept template (drifted)
  and varied shapes (operator rejected).
- **`form`** enum (compound | phrase | word | respelling | coinage | hack) on
  every entry, so the runbook can count form spread. Loanwords and
  reduplications are `word`/`coinage`; archaic spellings are `respelling`;
  invented places are `coinage`.
- **Domain hacks** allowed when the zone answers RDAP and is open to anyone (no
  `.ca`/`.au`/`.id`); `names check` prints `free|maybe` (maybe = DNS hint,
  never picked).
- **Item 6:** reaching for the share button (pointer/focus) sets
  `NameChecker`'s `wanted`, so hidden zones are looked up before the card is
  drawn.

## 5. Errors and dead ends

- Recasting blurbs (commit `be8b8fa1`) — rejected by the operator, reverted in
  `97876cc6`.
- Google's `.ing` RDAP throttles: ~80 `.ing` candidates went unanswered and are
  in no ledger.
- Commit `276fb8fd`'s body miscounts forms; the true split of the 137 is 62
  hacks, 20 phrases, 28 coinages/invented places, 17 words, 10 respellings.
- **Premiums/reserved names are invisible to RDAP** — the open problem.

## 6. State

- Branch `claude/unsquatted-catalogue-and-fixes-4mocr0`, draft PR
  https://github.com/vzakharov/vovazakharov.com/pull/244, last pushed commit
  before this file `085954d9`.
- Plan: `docs/plans/unsquatted-catalogue-and-fixes.paused.md` — its § "Status"
  lists done and left.
- PR body and squash proposal still describe the plan's recast-blurbs version
  and lack `form`/`tagline`/`uses` and the hacks caveat.
- No CI run, subscription or scheduled check-in. `vet.sh` not run.
- Estimate: this session 2.5 h middle developer ("the loader migration, three
  UI fixes and a script change are routine component and data work") + 5 h
  senior copywriter ("a hundred-plus names across forms, each with an
  informative tagline, needs a naming ear") + 1 h middle editor ("the runbook
  absorbs the lessons on forms, hacks and blurb shape"). Remainder handed on:
  ~2 h middle developer (the keyed premium check in `names.ts` and re-checking
  every non-`.com` pick), ~1 h senior copywriter (replacing dropped hacks).

## 7. Pointers

- `src/unsquatted/pages/home/deck/model/picks.yaml` / `picks.ts` — catalogue and
  loader; `deck/lib/uses.ts` (+ test) — the blurb sentence.
- `src/unsquatted/scripts/names.ts`, `lib/ledger.ts` (+ test), `ledger.jsonl`,
  `RUNBOOK.md` — the naming run.
- `src/unsquatted/pages/home/verdict/lib/check-domain.ts` — RDAP/DoH lookup;
  `pages/home/page/lib/prices.ts` notes premiums need a keyed Porkbun call.
- Porkbun's keyed check: `POST https://api.porkbun.com/api/json/v3/domain/checkDomain/<domain>`
  with `{"apikey","secretapikey"}`; its response includes `premium` and the
  price. RDAP zone list: `curl -sS https://data.iana.org/rdap/dns.json`.
- Predecessor transcript: https://claude.ai/code/session_01DaohkBDyKxW7VwXH6Xjtda

## 8. Next step

Resume the paused plan (`/go`). First the operator's latest ask: "при подготовке
курированного списка не хотелось бы включать те которые нифига не $11 или
которых попросту нет" — if `PORKBUN_API_KEY`/`PORKBUN_SECRET_API_KEY` are in the
environment, add the keyed check to `pnpm names check`/`recheck`, re-check every
non-`.com` pick (and spot-check `.com` ones), drop premium/unavailable ones to
the ledger and replace them; if not, ask once and, absent keys, drop the hacks
from this PR. Then `/preview` the UI fixes, `/polish`, and `/pr` refresh with
the squash proposal corrected. The sixth-form question ("слово в осмысленной
зоне") is still open with the operator.

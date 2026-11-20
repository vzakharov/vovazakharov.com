# Relay 1 — word-frequency check of Vova's English (parked)

## Standing constraints

None stated by the operator beyond the repo's own rules.

## The conversation

**Opening prompt** — not typed by the operator: the session was seeded by
parent session `session_01DaohkF1PQFSP4AMFg12djV` with `/task`, relaying Vova's
review of PR #212. His comment, verbatim
(https://github.com/vzakharov/vovazakharov.com/pull/212#discussion_r4385734308):

> а давай-ка начнём новую сессию: загрузить библиотеку со списком N тысяч
> (попробуем на разных N) наиболее употребляемых слов в английском, и веттить
> статьи (те которые как предполагается пишу я) по ним. Это не значит что всё
> редкое нужно исключать though, должен быть allow list, например я люблю
> странные словечки вроде copacetic; их мы посмотрим после свипа.
>
> также нужно исключать например лирику песен -- в общем есть где пофорковать.

And (https://github.com/vzakharov/vovazakharov.com/pull/212#discussion_r4385608878):
«of the lot, pesky в стоплист». The seed added that «draw a blank», «wobbly»,
«crooked», «hotshot» were called too idiomatic and already replaced on
`claude/five-percent-qryluk` (cf6e84a). A cross-session message from the parent
corrected the thread link to the two above.

Agent: ran a trial sweep with wordfreq at N=5k–50k over the article before
cf6e84a, wrote a draft plan (frequency gate + allow list + stop list, two
bites), opened draft PR #220, replied on both #212 threads pointing to it, and
asked five numbered forks (source, inflection folding, corpus, N, stop-list
reach).

**Cross-session message from the parent (data, relaying Vova's calibration):**
the plainest replacements («doesn’t make sense to me», «wrong», «cool») were
"наоборот слишком сухими: нужно искать что-то в промежутке"; the article now
uses «it’s like a blind spot for me», «skewed», «star blogger». "Цель проверки
— не самые частотные слова, а живой язык без вычурных идиом." Agent: ranked
those words (skewed ~21k, pesky ~25k, wobbly ~28k) and wrote the calibration
into the plan.

**Vova:** «1a, 2a, 3b, 4 начни с ещё более жёсткого, потом будем расширять, 5a»

Agent: collapsed the forks — wordfreq vendored, inflection folding, articles
only (songs out), N=5,000, stop list kept to his texts; updated the squash
proposal.

**Vova:**

> я передумал про allow list, и pesky мне подсказало почему. Сами по себе
> редкие слова -- не грех, грех использовать там, где они не дают панча.
>
> Например, в размышлениях про AI сказать что в какой-то момент оно уничтожит
> всех этих pesky humans -- это ок, так как здесь оно для окраса, иронии,
> эмфазы. А просто писать pesky там где можно сказать более простым словом, это
> уже слоп.
>
> поэтому эта проверка должна показывать агенту эти слова (возможно это стоит
> даже делать прямо в хуке по Create/Edit, когда файл соответствует
> определённым глобам), а дальше агент уже должен думать, оправдано ли оно там.
>
> понимаешь?

**Vova (mid-turn, quoting the agent's «обычный словарь блога: repository,
parameter, musician, verse»):** «ну а это прямиком в не allowlist даже, а как
это назвать, мол, стагдартная терминология для репы»

Agent: rewrote the plan as a PostToolUse hook that shows rare words and never
blocks; dropped allow list, stop list and vet gate; added `terms.txt` for the
repo's standard terminology; retitled the PR; asked one fork — phrases shown
like rare words (a, recommended) or `of the lot` still banned (b).

**Vova:** «1а можно, но какой будет механизм?»

Agent: idioms from two sources — Wiktionary's `Category:English idioms`
(checked: has `draw a blank`, not `at least`, not `of the lot`) and a hand
`phrases.txt` grown from his review comments via a line in `lsa-voice.md`;
irregular verbs by a small table; the Wiktionary source dropped whole if the
first sweep shows it is noise. Plan has no open questions; handed over
`/go claude/word-frequency-vet`. (verbatim in Last agent turn)

## Intent

Make agents writing Vova's English (translations of his articles) see the rare
words and idioms they reach for, and judge each in its sentence: keep it where
it gives irony, colour or emphasis («pesky humans» of an AI's plans), replace it
where a plainer word says the same — with living language, not the flattest
synonym. Ruled out: banning or allowing words by list; a vet gate.

## Decisions

- **Show, not gate** — beat the frequency gate with allow/stop lists: a word's
  worth depends on its sentence, which no list sees.
- **wordfreq, vendored** top 50k as a text file — beat SUBTLEX-US (older,
  manual download) and Google 10k (too short).
- **Inflection folding** — beat exact forms: it removed four of sixteen false
  flags at 20k.
- **Articles only** (`author: vova`, English; translations qualify by the
  original's author) — songs out for now.
- **N = 5,000** to start, Vova's "ещё более жёсткого", widened later.
- **`terms.txt`** — "the repo's terminology": the subject's own names for
  things (repository, persona, verse, musician), never shown. Not an allow list;
  `copacetic` is judged in its sentence.
- **Idioms**: Wiktionary category + hand `phrases.txt`, shown like rare words.
- **Hook reads only `new_string` on Edit**, the whole file on Write; exit 0
  always.

## Errors and dead ends

- Vova found the first plain replacements too dry — the target is the middle
  register.
- Wiktionary's API answered 429 without a User-Agent; with one it works.

## State

- Branch `claude/word-frequency-vet`, clean, pushed; head `ae03011` (a cost
  commit) atop the plan commits.
- PR #220, draft: "chore: show the agent rare words as it writes Vova's
  English"; squash proposal comment posted and tracked in
  `docs/remove-before-merging/squash-message.md`.
- Plan: `docs/plans/word-frequency-vet.draft.do-not-implement.md` — no go-ahead
  given yet.
- Nothing running; no PR subscription, no check-in.
- Estimate: this session 1.5 h senior analyst ("choosing a frequency source, a
  corpus and a mechanism meant running trial sweeps and weighing them against
  the author's calibration of plain vs ornate"). Remainder handed on: 4 h middle
  developer ("a hook script and a matcher with tokenizing, inflection folding
  and phrase matching, on hook and markdown helpers the repo already has") +
  0.5 h senior analyst ("choosing N and what counts as the repo's terminology
  means reading sweep output against what a reader finds plain").

## Pointers

- The plan, as above — the whole design.
- The article: `git show cf6e84a~1:apps/lsa/public/blog/the-five-percent.en.md`
  (before the fix); `pr212` head for after. Fetch with
  `git fetch origin pull/212/head:pr212`.
- Trial sweep: `pip install wordfreq`, then the script the plan describes;
  `tmp/sweep/` is gone with this container.
- Helpers to reuse: `scripts/lib/public-markdown.ts`,
  `scripts/check-masked-words.ts`, `.claude/hooks/format-md.sh`,
  `.claude/hooks/lib.sh`.
- Transcript: https://claude.ai/code/session_01DaohkDEA3QYUffU9Pwim6p

## Next step

Wait for the operator: the plan awaits his go-ahead (`/go
claude/word-frequency-vet` or «поехали»).

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages,
usually unneeded but harmless; the reply proper is usually its last
paragraphs.

````text
Идиомы будут ловиться из двух источников. Хук показывает их так же, как редкие слова, с пометкой «идиома», и задаёт агенту тот же вопрос: есть ли тут панч.

1. **Словарь идиом из Викисловаря** (категория English idioms): выгружаем его один раз и храним в репозитории, как частотный список. Я проверил: «draw a blank» там есть, а «at least» в эту категорию не входит. Значит, идиомой он считает именно образный оборот, а не любое устойчивое сочетание.
2. **Ручной список** для того, чего в словаре нет. «Of the lot» там нет, поэтому ручной список нужен. Он пополняется из твоих ревью: если ты пометил оборот как слишком идиоматичный, сессия, которая разбирает этот комментарий, добавляет его в список. Об этом говорит одна строка в `lsa-voice.md`, а это правило подгружается само, когда сессия открывает статью.

Неправильные формы глаголов сводятся к начальной по небольшой таблице, так что «drew a blank» найдётся по «draw a blank».

Есть риск: в словаре несколько тысяч идиом, и он может засыпать агента банальщиной. Это станет видно на первом свипе. Если так и будет, я уберу словарь целиком, а не буду его фильтровать.

План обновлён, открытых вопросов в нём больше нет.

https://github.com/vzakharov/vovazakharov.com/pull/220

Чтобы начать, открой новую сессию командой ниже или просто скажи «поехали» здесь:

```
/go claude/word-frequency-vet
```
````

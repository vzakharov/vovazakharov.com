# Relay 1 — predicative «про» paper (parked)

Parked from https://claude.ai/code/session_01PpC3QphA7vE7xLjwZWApv2 (the
session started in `vzakharov/life` and moved the work here).

## 1. Standing constraints

- The operator, on what this public repo may carry: «чтобы в публичной репе не
  осталось ничего, за что меня или чихпыха можно заканселить». The session's
  chat banter therefore appears below only as condensed, neutral summaries;
  do not reconstruct it from the transcript into anything committed here.

## 2. The conversation

Condensed where the operator's message was a screenshot of a private chat with
a friend, Dmitry Chestnykh («Чих-Пых»), whom the operator was teasing about the
predicative «это про …» that annoys him.

1. **Operator** (with a chat screenshot): «найди пжст несколько цитат, где
   Пушкин использует предлог "про" в значении "речь идёт про то-то"».
   **Agent:** grepped full Pushkin texts from lib.ru; gave quotes with «про» +
   verb/noun (Онегин: «Про дождь, про лён, про скотный двор», «Об Ольге, он про
   то и пишет»; «Анджело»: «Как будто речь идёт меж вами про иголку»).
2. **Operator:** «ну не совсем … тут он *пишет* про тему, это нормально. А здесь
   именно конструкция -- "что-то -- это про то-то"». **Agent:** agreed — none
   of Pushkin's 76 uses is predicative; closest is «речь идёт … про иголку».
3. Several turns of banter relayed from the chat (wordplay on «это не про
   победу — а про короче», letter-counting jokes, Pushkin's Hannibal ancestry).
   Condensed: no work came of them except the facts that entered the paper.
4. **Operator** (screenshot): the friend sent a fragment of the Ryazhskikh
   article quoting Goncharov's «А любовь не про таких!» and the link
   http://www.vestnik.vsu.ru/pdf/phylolog/2024/04/2024-04-36.pdf. **Agent:**
   noted Goncharov's «про» is predicative but in the old «для» sense; checked
   Pushkin has not even that.
5. **Operator:** «почитай статью -- интересно? про ИИ хоть говорят?» **Agent:**
   no AI; summarised (survey of 162 students; Sharonov's 2016 forecast failed;
   English *about* calque; the article's own title uses the construction).
6. **Operator:** «ну что, кажется нас занесло в исследования. Давай напишем
   фоллоу-ап для этого исследования, где изучим и то что в английском оно
   появилось не само собой (что в статье даётся как данное), и про то что
   спустя 10 лет со статьи Шаронова "про поесть" живее всех живых».
   **Agent:** routed via `/task` (plan, then go), wrote the plan, ran two
   research subagents, wrote the study in `vzakharov/life` (PR #214).
7. **Operator:** «пишем статью на русском же, да?» **Agent:** yes; English only
   in quoted examples.
8. **Operator:** «давай попробуем попутно найти контакты Е. А. Ряжских, а также
   если есть контакты ВСУ (не *того* ВСУ), куда можно посылать статьи на
   рецензию/публикацию. А, и в благодарности Чих-Пыха (Дмитрий Честных) за... ну
   ты сформулируй». **Agent:** found the department email and the journal's
   editorial contacts and rules (went into the paper's «Куда писать»).
9. **Operator:** «такими темпами его в соавторы а не в благодарности надо :)»
   **Agent:** proposed co-author «несогласный с выводами». **Operator:** «почему
   не согласный?» — **Agent:** conceded, plain «соавтор».
10. **Operator** (screenshot + upload of Vysotskaya 2021, *Критика и
    семиотика*): the friend found Vysotskaya's «подобно хэштегу в Интернете».
    **Agent:** verified the quote (pp. 255–256); it became the paper's «Как это
    работает: „про“ как хэштег» section.
11. **Operator:** «1- вместо language: я взял бы какой-то другой префикс для
    вообще любых исследовательских работ (cf. vzakharov/writing; к слову
    наверное последнюю стоит будет перенести в vzakharov/vovazakharov.com) 2-
    эту самую работу тоже давай перенесём туда, закрыв пиар здесь и открыв там.
    по сути это публичная работа, /life для непубличного.» **Agent:** asked
    which repo and which prefix. **Operator:** «в vovazakharov.com, research:
    думаю ок». **Agent:** moved the paper here, opened PR #176, closed
    vzakharov/life#214 with a pointer.
12. **Operator:** «запаркуй пжст, чтобы при хендле новый агент в новой сессии
    видел и контекст обсуждения тоже, а не только результат, это будет relevant
    to the comments I'm about to make (в основном в контексте полярных медведей
    вроде "не из афроамериканского")» — then the constraint in § 1, and «покажи
    мне tmp релея прежде чем пушить».

## 3. Intent

A public, sourced follow-up to Ryazhskikh 2024 answering two questions the
article leaves unchecked: where the English «X is (all) about Y» came from, and
whether «про + инфинитив» survived Sharonov's 2016 «скоро уйдёт». Russian
prose, for Russian readers. Next the operator will leave review comments on
PR #176, mostly about **polar bears** — sentences that deny a claim the reader
never held (e.g. «не в хип-хопе», «не из афроамериканского английского»,
«не новая и не жаргонная»), which exist only because the session was
rebutting a Gemini answer the operator had pasted from the chat.

## 4. Decisions

- **Repo: `vzakharov/vovazakharov.com`, `writing/papers/<slug>.md`** — beat
  `vzakharov/writing` (`papers/<slug>/`): the operator plans to move
  `vzakharov/writing` here anyway. `life` is for non-public work.
- **Commit type `research:`** — beat `papers:` and the area prefix `language:`
  used in `life`. Added to the root `CLAUDE.md`'s type list via a **staged**
  copy (`.claude/staged/CLAUDE.md.staged`, swapped in at `/finalize`); not in
  the deploy gate's `publishing` set, so merging deploys nothing.
- **`writing/CLAUDE.md`** edited in place (nested file, not staged): `papers/`
  in the layout, and a line that post rules do not bind a paper.
- **Co-author, not acknowledgement**: «Авторы: В. Захаров, Д. Честных».
- **Language**: paper Russian; commits and PR English per this repo's
  `CLAUDE.md` § Language.

## 5. Errors and dead ends

- First Pushkin answer gave non-predicative «про»; the operator corrected it.
- Agent assumed «Е. А.» = «Елена» in one web search; the name is unconfirmed —
  the paper uses initials only.
- Agent drafted «соавтор, несогласный с выводами» — operator rejected.
- Deleting the old `life` auto-branch ref returned 403; harmless.
- Unverified, recorded in the paper's «Чего проверить не удалось»: NKRYa
  counts (API key needed), Klobukov 2013, Ryazhskikh's b17.ru example, the
  Friends / Sex and the City claim, OED dating.

## 6. State

- Branch `claude/predicative-pro-ai2qib` in `vzakharov/vovazakharov.com`, head
  `e423bf8` (`research: Russian «X is about Y» calque traced …`) on top of
  `6d63065 chore: stage CLAUDE.md`; base `main` at `47222ce`.
- PR https://github.com/vzakharov/vovazakharov.com/pull/176 — draft, open. No
  squash proposal comment posted yet; `/polish` not run in this repo (it ran in
  `life` before the move, edits included in the copied file).
- vzakharov/life#214 closed; its branch `claude/predicative-pro-ai2qib` in
  `life` still holds `language/predicative-pro.md` and a completed plan —
  nothing to do there.
- No PR subscription, no scheduled check-in, nothing running.
- Estimate: this session 0.75 h middle analyst + 5 h senior analyst + 1 h
  middle editor; remainder handed on: 0.5 h middle editor — «review comments on
  a finished paper are an editor's pass over prose already sourced».

## 7. Pointers

- `writing/papers/predicative-pro.md` — the paper.
- `writing/CLAUDE.md`, `.claude/staged/CLAUDE.md.staged` — the convention edits.
- Sources not in the repo, re-fetchable: the Ryazhskikh PDF (needs a browser
  User-Agent with curl); Vysotskaya 2021, DOI 10.25205/2307-1737-2021-1-238-258,
  PDF https://www.philology.nsc.ru/sites/default/files/2026-09/15_89.pdf;
  Goncharov «Обрыв» http://az.lib.ru/g/goncharow_i_a/text_0030.shtml; Pushkin
  texts http://lib.ru/LITRA/PUSHKIN/ (mixed cp1251/koi8-r encodings).
- Predecessor transcript: session `session_01PpC3QphA7vE7xLjwZWApv2`
  (`list_events` / `get_event`), via a subagent into `tmp/` only — and nothing
  from its banter goes into a commit (§ 1).

## 8. Next step

Wait for the operator's review comments on PR #176 and handle them (`/handle`).
Expect polar-bear findings: rephrase each rebuttal as the positive finding it
supports (where the construction did come from), dropping the denied claim
unless the paper explicitly reviews that claim as a source's error.

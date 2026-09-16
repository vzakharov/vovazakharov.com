# PR #50: content: three dictations for the late-stage-agentic wiki

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/50
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/bible-dictations-o6uqi7
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-16T09:22:19Z
- **Updated:** 2026-09-16T10:48:15Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- Three recordings talked into a phone, transcribed in **verbatim** mode — the words and their order are the speaker's, punctuation and headings are the agent's. Mode is stated in each file's header line, since where these go (column post, wiki article, both) is still undecided and verbatim is the form that keeps every door open.
- `b1-web-not-cli` (7:20) — why to drive agents through the web client rather than the local console: the laptop stops melting, the day becomes a pipeline instead of a wait, and the fear that parallel branches will maul each other at merge time turns out to be empty (database migrations excepted).
- `b2-tend-prose` (8:16) — the four TEND lenses `/tend-prose` runs, named and argued: tightness, existence, negation (the polar bear, via Dostoevsky), durability.
- `b3-given-as-inevitable` (6:03) — what "the agent takes a given for an inevitability" actually means, why more context does not fix it (the megapixel race), and why an instruction to "look critically" is itself a given.
- Each file carries a lede, the recording under one heading, a table of every place the recognizer was guessing, and an afterword. Six places are still open questions marked `[?]` — they are in the tables and are the reason this PR is a draft.
- The media and the whole Deepgram responses sit under `docs/remove-before-merging/`, so a later `/subtitles` pass builds on saved per-word timings rather than a fresh API call. `/finalize` sweeps them; the branch is what keeps them reachable afterwards, so it should not be deleted after the merge.

## QA Checklist

- [ ] `gaps` — read the six `[?]` spots in the three files against the recordings and supply the missing words (b1: "давай, [?] дальше", "есть всякие [?]", "Открывайте [?]"; b2: "на 30, а то и [?] процентов", the 10-second garbled stretch about the channel; plus the two confident-but-odd readings "фронт задач" and "по режиму")
- [ ] `overrides` — confirm the two corrections made against a confident recognizer: «Доктора Хаоса» → Хауса, and «все наши идеальности» → неидеальности
- [ ] `verbatim` — spot-check any paragraph against its recording: every word should be the speaker's, with only bracketed insertions, cut fillers and the table's listed corrections departing from it
- [ ] `pairing` — each `writing/late-stage-agentic/dictations/<slug>.md` has its `<slug>.m4a` and `deepgram/<slug>.{deepgram.json,transcript.md}` under `docs/remove-before-merging/`, and the transcript's Source line points at the renamed media
- [ ] `afterwords` — read the `## Заметки агента` block at the foot of each file: it should answer the recording, not summarise it

| Item        | Automatable | Covered? | Notes                                                             |
| ----------- | ----------- | -------- | ----------------------------------------------------------------- |
| `gaps`      | manual-only | —        | Only the speaker knows what he said where the recognizer dropped it |
| `overrides` | manual-only | —        | Both are judgement calls against a high-confidence recognizer      |
| `verbatim`  | manual-only | —        | The verbatim rule is about meaning, not a diffable property        |
| `pairing`   | unit        | ❌       | A script could assert each dictation file has its three artifacts  |
| `afterwords`| manual-only | —        | Whether a reading earns its place is the operator's call           |

https://claude.ai/code/session_014Ss1JsuZAtLwHAGmXZS4Rd

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-16T09:22:39Z — "Proposed squash title/body: ``` content: three dictations fo…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-16T09:22:39Z

[https://github.com/vzakharov/vovazakharov.com/pull/50#issuecomment-5695144712](https://github.com/vzakharov/vovazakharov.com/pull/50#issuecomment-5695144712)

Proposed squash title/body:

```
content: three dictations for the late-stage-agentic wiki (pr #50)
```

```
Three recordings talked into a phone, transcribed in verbatim mode
because where they go is still undecided: the words and their order
are the speaker's, and only punctuation, headings and the bracketed
insertions are not. A prose rewrite would have settled a question
nobody has answered yet.

They cover why to drive agents through the web client rather than
the local console (the laptop stops melting, the day becomes a
pipeline, and parallel branches turn out not to maul each other at
merge time); the four TEND lenses /tend-prose runs, named and
argued; and what "the agent takes a given for an inevitability"
means, why more context does not fix it, and why an instruction to
look critically is itself a given. Each file carries a lede, the
recording under one heading, a table of every place the recognizer
was guessing, and an afterword answering the piece.

The media and the whole Deepgram responses stay under
docs/remove-before-merging/ until the sweep, so a later subtitle
pass builds on saved per-word timings rather than a fresh call. The
branch is what keeps them reachable afterwards, so deleting it
destroys the recordings behind anything published from them.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `docs/remove-before-merging/deepgram/b1-web-not-cli.deepgram.json`:1 — unresolved — last: @vzakharov (human) 2026-09-16T09:30:04Z — "а давай таки не будем их трекать (будем оставлять только в t…" → [threads/01-docs-remove-before-merging-deepgram-b1-web-not-cli.md](threads/01-docs-remove-before-merging-deepgram-b1-web-not-cli.md#t01)
- **T02** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:41 — unresolved — last: @vzakharov (human) 2026-09-16T09:35:32Z — "давай добавим третий режим диктовки, когда мы не резюмируем,…" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t02)
- **T03** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:59 — unresolved — last: @vzakharov (human) 2026-09-16T09:36:50Z — "(в новом режиле) для таких вещей (метафора мимо цели) можно…" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t03)
- **T04** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:65 — unresolved — last: @vzakharov (human) 2026-09-16T09:38:59Z — ""по режиму" относится к тому что описывается дальше, т.е. ти…" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t04)
- **T05** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:80 — unresolved — last: @vzakharov (human) 2026-09-16T09:51:20Z — "надо объединить в одну секцию, а то "второй пункт" один, а з…" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t05)
- **T06** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:99 — unresolved — last: @vzakharov (human) 2026-09-16T09:52:12Z — "компакчу, от слова compact :)" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t06)
- **T07** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:101 — unresolved — last: @vzakharov (human) 2026-09-16T09:53:26Z — ""дерзай дальше" давай напишем в скилле что в местах где непо…" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t07)
- **T08** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:102 — unresolved — last: @vzakharov (human) 2026-09-16T09:53:38Z — ""мои комменты"" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t08)
- **T09** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:111 — unresolved — last: @vzakharov (human) 2026-09-16T09:54:01Z — "work trees, да" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t09)
- **T10** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:115 — unresolved — last: @vzakharov (human) 2026-09-16T09:54:29Z — "репа" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t10)
- **T11** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:116 — unresolved — last: @vzakharov (human) 2026-09-16T09:54:37Z — "мёрджах" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t11)
- **T12** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:120 — unresolved — last: @vzakharov (human) 2026-09-16T09:55:20Z — "верно, но мёрДжить, через ё и д" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t12)
- **T13** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:123 — unresolved — last: @vzakharov (human) 2026-09-16T09:55:51Z — "верно" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t13)
- **T14** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:131 — unresolved — last: @vzakharov (human) 2026-09-16T09:56:14Z — "claude.ai/code" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t14)
- **T15** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:146 — unresolved — last: @vzakharov (human) 2026-09-16T09:57:34Z — "имеется в виду "вообще (быстро) -- не прошло и недели..."" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t15)
- **T16** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:169 — unresolved — last: @vzakharov (human) 2026-09-16T09:58:09Z — "с режимом отписал выше, а что странного во "фронте задач"? ф…" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t16)
- **T17** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:180 — unresolved — last: @vzakharov (human) 2026-09-16T09:58:55Z — "мне кажется заканчивать как раз нужно самым сильным. как вар…" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t17)
- **T18** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:182 — unresolved — last: @vzakharov (human) 2026-09-16T09:59:23Z — "про это отписал. конвейер и НЕслежение за мыслями -- это оди…" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t18)
- **T19** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:193 — unresolved — last: @vzakharov (human) 2026-09-16T10:00:18Z — "интересное наблюдение. порефлексировал быстро. имхо как раз,…" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t19)
- **T20** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:198 — unresolved — last: @vzakharov (human) 2026-09-16T10:02:21Z — "про чужой прогон CI это хорошо, но это скорее про VM клода (…" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t20)
- **T21** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:26 — unresolved — last: @vzakharov (human) 2026-09-16T10:03:46Z — "верно. hereafter, если коммента к непонятому нет, значит пон…" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t21)
- **T22** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:35 — unresolved — last: @vzakharov (human) 2026-09-16T10:04:46Z — "давай сделаем тут `... неизбежность" -- назовём это ошибкой…" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t22)
- **T23** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:37 — unresolved — last: @vzakharov (human) 2026-09-16T10:05:11Z — "работая с Клодом" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t23)
- **T24** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:42 — unresolved — last: @vzakharov (human) 2026-09-16T10:05:32Z — "`D. (Маркетёрское прошлое...`" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t24)
- **T25** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:51 — unresolved — last: @vzakharov (human) 2026-09-16T10:06:03Z — "сократить на 30 процентов, а то и в два раза" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t25)
- **T26** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:55 — unresolved — last: @vzakharov (human) 2026-09-16T10:06:34Z — "про скилл давай вперёд отдельных секций засунем, а то какая-…" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t26)
- **T27** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:65 — unresolved — last: @vzakharov (human) 2026-09-16T10:06:57Z — "не на языке Brainfuck, а на тайпскрипте, питоне, го, чём-то…" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t27)
- **T28** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:74 — unresolved — last: @vzakharov (human) 2026-09-16T10:10:17Z — "вместо того чтобы ответить нам в чате единым сообщением оста…" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t28)
- **T29** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:76 — unresolved — last: @vzakharov (human) 2026-09-16T10:10:23Z — "Но, не Ну" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t29)
- **T30** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:78 — unresolved — last: @vzakharov (human) 2026-09-16T10:10:39Z — "кода, точнее НЕ-кода," → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t30)
- **T31** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:88 — unresolved — last: @vzakharov (human) 2026-09-16T10:11:05Z — "бесконечно и сиюминутно" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t31)
- **T32** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:93 — unresolved — last: @vzakharov (human) 2026-09-16T10:11:39Z — "тут наиболее коряво всё выражено. Прежде всего, нужно придум…" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t32)
- **T33** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:126 — unresolved — last: @vzakharov (human) 2026-09-16T10:12:58Z — "1- тут скорее "важные" чем "хорошие" 2- истории коммитов" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t33)
- **T34** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:145 — unresolved — last: @vzakharov (human) 2026-09-16T10:14:33Z — "берите на вооружение" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t34)
- **T35** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:149 — unresolved — last: @vzakharov (human) 2026-09-16T10:14:56Z — "эти отдельно не смотрю, поскольку отмечал по тексту. если чт…" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c.md#t35)
- **T36** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:176 — unresolved — last: @vzakharov (human) 2026-09-16T10:16:35Z — "тут не очень понял твой оборот фразы про что где объясняет;…" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t36)
- **T37** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:182 — unresolved — last: @vzakharov (human) 2026-09-16T10:17:19Z — "там запись почему-то скукожилась, но я примерно про это и го…" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t37)
- **T38** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:184 — unresolved — last: @vzakharov (human) 2026-09-16T10:17:40Z — "да, про то что "не потому что болтлив" можно добавить не тол…" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t38)
- **T39** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:189 — unresolved — last: @vzakharov (human) 2026-09-16T10:20:00Z — "я бы так не сказал.. из моего опыта, разделы об убранных эта…" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t39)
- **T40** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:198 — unresolved — last: @vzakharov (human) 2026-09-16T10:21:32Z — "вот тут то ли ты не до конца понял, о чём я говорил, то ли я…" → [threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md](threads/03-writing-late-stage-agentic-dictations-b2-tend-pros.md#t40)
- **T41** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:60 — unresolved — last: @vzakharov (human) 2026-09-16T10:26:02Z — "забыл, надо ещё добавить про то, что не закроешь ноутбук, по…" → [threads/02-writing-late-stage-agentic-dictations-b1-web-not-c-2.md](threads/02-writing-late-stage-agentic-dictations-b1-web-not-c-2.md#t41)
- **T42** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:31 — unresolved — last: @vzakharov (human) 2026-09-16T10:28:19Z — "`Значит это то, что`" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t42)
- **T43** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:35 — unresolved — last: @vzakharov (human) 2026-09-16T10:30:53Z — "давай склеим это так "чтобы агент, увидев ..., решил: а не о…" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t43)
- **T44** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:41 — unresolved — last: @vzakharov (human) 2026-09-16T10:31:36Z — "тут триада немного разваливается, потому что "дай больше кон…" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t44)
- **T45** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:42 — unresolved — last: @vzakharov (human) 2026-09-16T10:31:50Z — "проблемы оказалось две, потому что третью я подумал что выне…" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t45)
- **T46** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:56 — unresolved — last: @vzakharov (human) 2026-09-16T10:34:15Z — "меньше каждый сенсор, имею в виду" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t46)
- **T47** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:57 — unresolved — last: @vzakharov (human) 2026-09-16T10:34:32Z — ""чуть менее точным" вместо обоих" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t47)
- **T48** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:60 — unresolved — last: @vzakharov (human) 2026-09-16T10:34:53Z — "этот весь детур важный, но его таки нужно сократить. Может д…" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t48)
- **T49** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:69 — unresolved — last: @vzakharov (human) 2026-09-16T10:36:46Z — "давай держать все эти "обсудим позже" и "забегая вперёд" в о…" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t49)
- **T50** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:82 — unresolved — last: @vzakharov (human) 2026-09-16T10:37:20Z — "не надо отдельный хединг, думаю" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t50)
- **T51** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:91 — unresolved — last: @vzakharov (human) 2026-09-16T10:37:43Z — "Тоже важно и тоже причесать" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t51)
- **T52** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:95 — unresolved — last: @vzakharov (human) 2026-09-16T10:38:39Z — "давай поправми на "вспомни сейчас о закате"" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t52)
- **T53** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:98 — unresolved — last: @vzakharov (human) 2026-09-16T10:39:26Z — "тут скорее как-то "это не приведёт его к той же -- казалось…" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t53)
- **T54** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:106 — unresolved — last: @vzakharov (human) 2026-09-16T10:41:56Z — ""Как бы" не надо" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t54)
- **T55** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:110 — unresolved — last: @vzakharov (human) 2026-09-16T10:42:11Z — ""..., а мы -- их"" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t55)
- **T56** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:115 — unresolved — last: @vzakharov (human) 2026-09-16T10:42:54Z — "что-то концовка смазалась, давай подумаем чем можно вместо н…" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t56)
- **T57** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:140 — unresolved — last: @vzakharov (human) 2026-09-16T10:43:49Z — "хуже -- он оспорит каждое решение, потому что этого просит и…" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t57)
- **T58** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:142 — unresolved — last: @vzakharov (human) 2026-09-16T10:44:23Z — "вот, это типа того что я написал в комментарии про НЕрандомн…" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t58)
- **T59** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:147 — unresolved — last: @vzakharov (human) 2026-09-16T10:45:43Z — ""проверяемое важнее красивого", это откуда, мы где-то так уж…" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t59)
- **T60** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:156 — unresolved — last: @vzakharov (human) 2026-09-16T10:47:17Z — "да, но, учитывая, что контент с этим опытом нигде опубликова…" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t60)
- **T61** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:146 — unresolved — last: @vzakharov (human) 2026-09-16T10:47:29Z — "внимание -- и есть та самая фиксированная площадь, которую о…" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as.md#t61)
- **T62** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:161 — unresolved — last: @vzakharov (human) 2026-09-16T10:48:02Z — "Да, это в копилку для той статьи про "изменение дороги в про…" → [threads/04-writing-late-stage-agentic-dictations-b3-given-as-2.md](threads/04-writing-late-stage-agentic-dictations-b3-given-as-2.md#t62)

## Timeline (status, references, and other events)

- **2026-09-16T10:48:12Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/50#pullrequestreview-5220905239.

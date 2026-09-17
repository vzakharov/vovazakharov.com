# PR #50: content: three dictations for the late-stage-agentic wiki

- **State:** closed
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/50
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/bible-dictations-o6uqi7
- **Draft:** no
- **Merged:** 2026-09-16T21:39:04Z
- **Created:** 2026-09-16T09:22:19Z
- **Updated:** 2026-09-16T21:39:04Z
- **Closed:** 2026-09-16T21:39:04Z
- **Labels:** _none_

---

## Body

## Summary

- Three recordings talked into a phone, rendered in **retake** mode — a third mode the review asked for, alongside verbatim and prose. These recordings get said again off a cleaned-up script, so the files keep the speaker's phrasing, register and order of thought while the false starts, tautologies and abandoned metaphors come out. Each file opens with a summary and a beat sheet — the points, the turns and the transitions in the order the take goes through them — to glance at while the camera runs. An edit that changes what a passage *says* carries a footnote until the speaker has read it, and the footnotes go out with the round that settles them.
- `b1-web-not-cli` (7:20) — why to drive agents through the web client rather than the local console: the laptop stops melting and the lid finally closes, the day becomes a pipeline instead of a wait, and the fear that parallel branches will maul each other at merge time turns out to be empty (database migrations excepted). It now ends where the recording stopped short — every branch reaching main in its own time, and the commit list you look back at.
- `b2-tend-prose` (8:16) — the four TEND lenses `/tend-prose` runs, named and argued: tightness, existence, negation (the polar bear, via Dostoevsky), durability.
- `b3-given-as-inevitable` (6:03) — what "the agent takes a given for an inevitability" actually means, why more context does not fix it (the megapixel race), and why an instruction to "look critically" is itself a given: an agent finding faults everywhere is worse than one finding none. It closes on a House case that is an epiphany rather than a deduction — «Бесчувственная» (3x14), Wilson grumbling about a stolen sandwich and beating other hunters to the food, and the tapeworm taking the patient's B12.
- Every guess table is now empty and gone: the review answered them, and the skill now says that a mark the operator read past without comment was read correctly. The three afterwords carry thoughts rather than the review they came out of; moving that reading onto the PR as an actual review is #51.
- `writing/late-stage-agentic/ideas/` holds a paragraph per unwritten piece, and every "about this later" in a recording links to one — seven files, including the third problem `b3` promised and never delivered.
- The Deepgram responses are committed gzipped beside the transcripts, ~30 KB each: a re-run is a different transcription that the corrections made against this one no longer fit. The media and the transcripts stay under `docs/remove-before-merging/`; `/finalize` sweeps them, and the branch is what keeps them reachable afterwards, so it should not be deleted after the merge.

## QA Checklist

- [ ] `retake` — read any one file end to end as if into a microphone: it should sound like you, not like an edited version of you, and nothing should make you stop
- [ ] `рыба` — read the beat sheet at the top of each file as you would with the camera running: each bullet should be enough to carry its stretch without dropping back to the script
- [ ] `house` — the «Бесчувственная» retelling in `b3`: a viewer who remembers the episode should not stop on it, and the sandwich should read as unrelated to the case, which is the whole point
- [ ] `endings` — `b1`'s closing (the tower, the commit list) and `b3`'s (мясные мозги) are your words from review, set down whole; check they land where they were put
- [ ] `links` — click the `../ideas/` links from the three recordings: each promise should land on a paragraph that says what the promised piece is
- [ ] `deepgram` — `gzip -dc docs/remove-before-merging/deepgram/<slug>.deepgram.json.gz | head` reads back, and nothing renders it as text in a diff
- [ ] `afterwords` — read the `## Заметки агента` block at the foot of each file: it should stand without the review thread beside it

| Item        | Automatable | Covered? | Notes                                                                        |
| ----------- | ----------- | -------- | ---------------------------------------------------------------------------- |
| `retake`    | manual-only | —        | Whether a text is sayable by its author is not a diffable property           |
| `рыба`      | manual-only | —        | Whether a cue is enough to record from is answerable only at the microphone  |
| `house`     | manual-only | —        | Whether a retold scene lands is a viewer's call, not a checkable fact        |
| `endings`   | manual-only | —        | Placement of supplied text is a judgement about the piece                    |
| `links`     | unit        | ❌       | A script could assert every relative Markdown link under `writing/` resolves |
| `deepgram`  | unit        | ❌       | A script could assert each dictation has its media, transcript and response  |
| `afterwords`| manual-only | —        | Whether a reading earns its place is the operator's call                     |

https://claude.ai/code/session_014Ss1JsuZAtLwHAGmXZS4Rd

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-16T09:22:39Z — "Proposed squash title/body: ``` content: work in the web, pr…" → [↓](#c01)
- **C02** @vzakharov (agent) — 2026-09-16T21:36:49Z — "<!-- finalize-attestation --> ### Attestation Verified a98a8…" → [↓](#c02)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-16T09:22:39Z

[https://github.com/vzakharov/vovazakharov.com/pull/50#issuecomment-5695144712](https://github.com/vzakharov/vovazakharov.com/pull/50#issuecomment-5695144712)

Proposed squash title/body:

```
content: work in the web, prune the prose, question the given (pr #50)
```

```
Three recordings talked into a phone: why to drive agents through the
web client rather than the local console, the four TEND lenses
/tend-prose runs, and what "the agent takes a given for an
inevitability" means. Each is a script to record from, not a transcript
to read.

That is what needed a mode. Verbatim hands the speaker back their own
stumbles to read out loud; prose is written for a reader rather than a
microphone. Retake is the third: it keeps their phrasing, their register
and the order the thought arrives in, and takes out the false starts,
the tautologies and the metaphors they withdrew mid-sentence.
Under-editing is the rule, because a text tightened until every sentence
pulls its weight is one its author has to fight at the microphone.

A retake file opens with a summary and a beat sheet -- the points, the
turns and the transitions in the order the take goes through them -- so
the speaker holds the thread without reading the script aloud. An edit
that changes what a passage says carries a footnote until they have read
it, and the footnotes go out with the pass that raised them.

Every promise a recording makes now links to a paragraph under
writing/late-stage-agentic/ideas/, so "about this later" has somewhere
to point before the piece that keeps it exists. The Deepgram responses
stay in the tree gzipped: a re-run is a fresh transcription whose words
no longer line up with the corrections made against the old one, and
30 KB beside 3.7 MB of audio is not a cost worth that.

Review left one rule behind in .claude/rules/writing.md: a sentence
in the "not just X -- it's also Y" cadence paraphrases its neighbour
rather than adding to it, so it is read against the lines around it
and not against its own halves.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

<a id="c02"></a>

### Comment by @vzakharov (agent) on 2026-09-16T21:36:49Z

[https://github.com/vzakharov/vovazakharov.com/pull/50#issuecomment-5704902916](https://github.com/vzakharov/vovazakharov.com/pull/50#issuecomment-5704902916)

<!-- finalize-attestation -->

### Attestation

Verified a98a876 (`claude/bible-dictations-o6uqi7`) against `main` @ 5e6fecd "chore: rework the loop's entry and quality passes, name the operator (pr #46)".

- `./scripts/vet.sh` — **green**
- CI on this PR — **nothing runs on a PR in this repo**
- CI-only buckets — **not dispatched: `/test-on-gh` does not exist in this project**

No workflow runs on a PR; this comment is the verification record. The vet run was re-run on the final head after the working-artifact sweeps, so the SHA above is the tree that was checked, not an earlier one. `docs/pr/` and `docs/remove-before-merging/` are gone from the branch — the recordings and the gzipped Deepgram responses live only in this branch's history now, so it should not be deleted after the merge.

---

## Review threads

- **T01** `docs/remove-before-merging/deepgram/b1-web-not-cli.deepgram.json`:1 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:09Z — "Не трекаем: у `transcribe.py` появился `--json-dir`, по умол…" → [↓](#t01)
- **T02** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:41 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:10Z — "Сделал: режим `retake` — в файлах «режим чистовой начитки»,…" → [↓](#t02)
- **T03** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:59 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:11Z — "«Вентилятор выходил на взлётный режим» — картинка та же, но…" → [↓](#t03)
- **T04** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:65 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:13Z — "Развязал: «…комфортненько переключаться между ними. Режим пр…" → [↓](#t04)
- **T05** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:80 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:14Z — "Объединил в одну секцию — «Причина вторая: конвейер вместо м…" → [↓](#t05)
- **T06** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:99 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:15Z — "Компакчу." → [↓](#t06)
- **T07** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:101 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:17Z — "«дерзай дальше» — поставил. Про таймстампы записал в скилл (…" → [↓](#t07)
- **T08** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:102 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:18Z — "Поправил." → [↓](#t08)
- **T09** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:111 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:19Z — "Поправил." → [↓](#t09)
- **T10** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:115 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:20Z — "Поправил." → [↓](#t10)
- **T11** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:116 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:21Z — "Поправил." → [↓](#t11)
- **T12** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:120 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:22Z — "Поправил — и во всех остальных местах тоже: мёрдж, мёрджить,…" → [↓](#t12)
- **T13** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:123 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:23Z — "Принято." → [↓](#t13)
- **T14** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:131 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:25Z — "Поставил." → [↓](#t14)
- **T15** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:146 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:26Z — "«…но привык я к этому быстро: не прошло и недели, как я уже…" → [↓](#t15)
- **T16** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:169 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:27Z — "Ничего странного, я перестраховался: «фронт работ» — устойчи…" → [↓](#t16)
- **T17** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:180 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:28Z — "Согласен, и заметку переписал. «Начинай с сильного» — правил…" → [↓](#t17)
- **T18** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:182 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:29Z — "Свёл в одну секцию, счёт причин теперь ровно 1-2-3 — и в зам…" → [↓](#t18)
- **T19** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:193 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:30Z — "Твой ответ сильнее моего вопроса, так что переписал заметку…" → [↓](#t19)
- **T20** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:198 — resolved — last: @vzakharov (agent) 2026-09-16T12:21:40Z — "Поправил: «Процессор при этом греется чужой, и — в отличие о…" → [↓](#t20)
- **T21** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:26 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:33Z — "Записал в скилл: пометка, мимо которой ты прошёл молча, счит…" → [↓](#t21)
- **T22** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:35 — resolved — last: @vzakharov (agent) 2026-09-16T12:22:06Z — "Обозвал: секция «What it was handed, it treats as fixed» теп…" → [↓](#t22)
- **T23** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:37 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:35Z — "Поправил: «Мы, работая с Клодом уже долгое время…»." → [↓](#t23)
- **T24** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:42 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:37Z — "Поправил, скобка теперь после D." → [↓](#t24)
- **T25** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:51 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:38Z — "Поправил: «сократить на тридцать процентов, а то и в два раз…" → [↓](#t25)
- **T26** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:55 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:39Z — "Перенёс в «Аббревиатуру», до отдельных линз — там он уже не…" → [↓](#t26)
- **T27** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:65 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:40Z — "Поставил твою формулировку целиком." → [↓](#t27)
- **T28** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:74 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:42Z — "Поставил твою формулировку целиком. В записи здесь десять се…" → [↓](#t28)
- **T29** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:76 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:43Z — "Поправил." → [↓](#t29)
- **T30** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:78 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:44Z — "Поправил." → [↓](#t30)
- **T31** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:88 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:45Z — "Поправил." → [↓](#t31)
- **T32** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:93 — resolved — last: @vzakharov (agent) 2026-09-16T12:22:33Z — "Добавил: «Потом CDN умнеет, прозрачность он больше не портит…" → [↓](#t32)
- **T33** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:126 — resolved — last: @vzakharov (agent) 2026-09-16T12:22:59Z — "Убрал повтор: «принадлежат истории коммитов, каким-то артефа…" → [↓](#t33)
- **T34** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:145 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:48Z — "Поправил." → [↓](#t34)
- **T35** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:149 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:49Z — "Таблица «Что пришлось угадывать» ушла целиком — всё, что в н…" → [↓](#t35)
- **T36** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:176 — resolved — last: @vzakharov (agent) 2026-09-16T12:23:25Z — "Записал: `writing/late-stage-agentic/ideas/prose-spacetime.m…" → [↓](#t36)
- **T37** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:182 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:52Z — "Понял. В чистовую начитку продолжение мысли теперь добавлено…" → [↓](#t37)
- **T38** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:184 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:53Z — "Добавил в текст для начитки, в конец секции про E." → [↓](#t38)
- **T39** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:189 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:54Z — "Ты прав, я перегнул, и заметку переписал. 7e8c401 — это не п…" → [↓](#t39)
- **T40** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:198 — resolved — last: @vzakharov (agent) 2026-09-16T11:33:55Z — "Я говорил не о том, о чём ты, — и твой механизм точнее. Comp…" → [↓](#t40)
- **T41** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:60 — resolved — last: @vzakharov (agent) 2026-09-16T12:23:51Z — "Второе предложение убрал, осталась ровно твоя фраза. И запис…" → [↓](#t41)
- **T42** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:31 — resolved — last: @vzakharov (agent) 2026-09-16T11:34:57Z — "Поправил." → [↓](#t42)
- **T43** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:35 — resolved — last: @vzakharov (agent) 2026-09-16T11:35:23Z — "Поставил твою склейку: «…решил: а не отойти ли мне на шаг на…" → [↓](#t43)
- **T44** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:41 — resolved — last: @vzakharov (agent) 2026-09-16T11:35:50Z — "Убрал «опиши ему больше» — осталось «дай ему больше контекст…" → [↓](#t44)
- **T45** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:42 — resolved — last: @vzakharov (agent) 2026-09-16T11:36:16Z — "Поправил на две. Третью завёл как `writing/late-stage-agenti…" → [↓](#t45)
- **T46** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:56 — resolved — last: @vzakharov (agent) 2026-09-16T11:36:43Z — "Поправил: «ты делаешь каждый сенсор меньше»." → [↓](#t46)
- **T47** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:57 — resolved — last: @vzakharov (agent) 2026-09-16T11:37:09Z — "Поправил, оба эпитета заменены на один." → [↓](#t47)
- **T48** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:60 — resolved — last: @vzakharov (agent) 2026-09-16T11:37:35Z — "Причесал, не сокращая до конспекта: десять строк стали семью…" → [↓](#t48)
- **T49** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:69 — resolved — last: @vzakharov (agent) 2026-09-16T11:38:01Z — "Сделал ровно так: `writing/late-stage-agentic/ideas/`, абзац…" → [↓](#t49)
- **T50** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:82 — resolved — last: @vzakharov (agent) 2026-09-16T11:38:27Z — "Убрал, абзац теперь идёт внутри «Проблемы второй»." → [↓](#t50)
- **T51** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:91 — resolved — last: @vzakharov (agent) 2026-09-16T11:38:54Z — "Причесал." → [↓](#t51)
- **T52** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:95 — resolved — last: @vzakharov (agent) 2026-09-16T12:24:18Z — "Дочитал ты правильно: Хаус стоял только в конце абзаца, а вн…" → [↓](#t52)
- **T53** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:98 — resolved — last: @vzakharov (agent) 2026-09-16T11:39:46Z — "Поставил твою формулировку целиком — вместе с «казалось бы р…" → [↓](#t53)
- **T54** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:106 — resolved — last: @vzakharov (agent) 2026-09-16T11:40:12Z — "Убрал." → [↓](#t54)
- **T55** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:110 — resolved — last: @vzakharov (agent) 2026-09-16T11:40:39Z — "Добавил." → [↓](#t55)
- **T56** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:115 — resolved — last: @vzakharov (agent) 2026-09-16T12:24:44Z — "Согласен, и понятно почему: две короткие фразы, вторая с тра…" → [↓](#t56)
- **T57** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:140 — resolved — last: @vzakharov (agent) 2026-09-16T11:41:31Z — "Твоя версия и точнее, и хуже — взял её. Получается не ритуал…" → [↓](#t57)
- **T58** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:142 — resolved — last: @vzakharov (agent) 2026-09-16T17:36:10Z — "Убрал вторую фразу — осталось «клад, который сам же вчера и…" → [↓](#t58)
- **T59** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:147 — resolved — last: @vzakharov (agent) 2026-09-16T11:42:23Z — "Ниоткуда. Выдумал: написал фразу строкой выше и строкой ниже…" → [↓](#t59)
- **T60** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:156 — resolved — last: @vzakharov (agent) 2026-09-16T12:25:37Z — "Погуглил, взял «Эйфорию» (2x20–21): двое слегли, квартиру бо…" → [↓](#t60)
- **T61** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:146 — resolved — last: @vzakharov (agent) 2026-09-16T11:43:16Z — "Принято, я был неправ: внимание и есть та фиксированная площ…" → [↓](#t61)
- **T62** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:161 — resolved — last: @vzakharov (agent) 2026-09-16T11:43:42Z — "Положил туда: `writing/late-stage-agentic/ideas/the-road-cha…" → [↓](#t62)
- **T63** `.claude/rules/writing.md`:124 — unresolved — last: @vzakharov (agent) 2026-09-16T21:30:41Z — "Теперь понял: я все три раза искал тавтологию внутри предлож…" → [↓](#t63)
- **T64** `.claude/skills/dictation/SKILL.md`:65 — resolved — last: @vzakharov (agent) 2026-09-16T17:37:03Z — "Done — the speaker is they/them throughout the skill now, ta…" → [↓](#t64)
- **T65** `.claude/skills/subtitles/SKILL.md`:27 — resolved — last: @vzakharov (agent) 2026-09-16T17:37:30Z — "Сделал: ответ Deepgram теперь лежит рядом с транскриптом, `<…" → [↓](#t65)
- **T66** `docs/remove-before-merging/squash-message.md`:4 — resolved — last: @vzakharov (agent) 2026-09-16T18:49:24Z — "Понял неправильно, извини: под «сутью» я прочитал «что получ…" → [↓](#t66)
- **T67** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:46 — resolved — last: @vzakharov (agent) 2026-09-16T17:38:23Z — "Взял твою формулировку: не крутой хацкер, а простой юзер саа…" → [↓](#t67)
- **T68** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:48 — resolved — last: @vzakharov (agent) 2026-09-16T17:38:49Z — "Стоит дословно, и раздел про плавящийся ноутбук читается теп…" → [↓](#t68)
- **T69** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:54 — resolved — last: @vzakharov (agent) 2026-09-16T17:39:15Z — "Взял. 22f707d" → [↓](#t69)
- **T70** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:62 — resolved — last: @vzakharov (agent) 2026-09-16T17:39:42Z — "Заменил на твою версию. 22f707d" → [↓](#t70)
- **T71** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:64 — resolved — last: @vzakharov (agent) 2026-09-16T17:40:08Z — "«Мониторинговых» убрал. Сейчас: «постоянный поток: ставишь з…" → [↓](#t71)
- **T72** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:68 — resolved — last: @vzakharov (agent) 2026-09-16T17:40:34Z — "Взял дословно. 22f707d" → [↓](#t72)
- **T73** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:67 — resolved — last: @vzakharov (agent) 2026-09-16T17:41:01Z — "Переставил: абзац про чужой процессор закрывает первую причи…" → [↓](#t73)
- **T74** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:75 — resolved — last: @vzakharov (agent) 2026-09-16T17:41:27Z — "Так и стоит. 22f707d" → [↓](#t74)
- **T75** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:82 — resolved — last: @vzakharov (agent) 2026-09-16T17:41:54Z — "Вставил. 22f707d" → [↓](#t75)
- **T76** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:90 — resolved — last: @vzakharov (agent) 2026-09-16T17:42:20Z — "«В моём пайплайне, после того как агент выполнил задачу…». 2…" → [↓](#t76)
- **T77** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:106 — resolved — last: @vzakharov (agent) 2026-09-16T17:42:25Z — "Вернул переход: «И это приводит нас к третьему моменту». 22f…" → [↓](#t77)
- **T78** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:107 — resolved — last: @vzakharov (agent) 2026-09-16T17:42:51Z — "Дописал: «— к тому самому страху, про который я уже говорил»…" → [↓](#t78)
- **T79** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:154 — resolved — last: @vzakharov (agent) 2026-09-16T17:43:18Z — "Таблицы во всех трёх записях заменены сносками: значок стоит…" → [↓](#t79)
- **T80** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:174 — resolved — last: @vzakharov (agent) 2026-09-16T17:43:44Z — "Переписал без опоры на твой ответ: конвейер освобождает от о…" → [↓](#t80)
- **T81** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:187 — resolved — last: @vzakharov (agent) 2026-09-16T17:44:10Z — "Поставил концовкой, целиком. Вошло ровно: башня и список ком…" → [↓](#t81)
- **T82** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:34 — resolved — last: @vzakharov (agent) 2026-09-16T17:44:37Z — "Название убрал, осталась ссылка на третью запись. 22f707d" → [↓](#t82)
- **T83** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:46 — resolved — last: @vzakharov (agent) 2026-09-16T17:45:04Z — "Взял твою формулировку про четыре линзы. 22f707d" → [↓](#t83)
- **T84** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:81 — resolved — last: @vzakharov (agent) 2026-09-16T17:45:30Z — "Перенёс, дословно. 22f707d" → [↓](#t84)
- **T85** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:76 — resolved — last: @vzakharov (agent) 2026-09-16T17:45:56Z — "Удалил. 22f707d" → [↓](#t85)
- **T86** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:104 — resolved — last: @vzakharov (agent) 2026-09-16T17:46:23Z — "Заменил. 22f707d" → [↓](#t86)
- **T87** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:116 — resolved — last: @vzakharov (agent) 2026-09-16T17:46:49Z — "Заменил. 22f707d" → [↓](#t87)
- **T88** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:121 — resolved — last: @vzakharov (agent) 2026-09-16T17:47:15Z — "Дописал. 22f707d" → [↓](#t88)
- **T89** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:125 — resolved — last: @vzakharov (agent) 2026-09-16T17:47:41Z — "Заменил. 22f707d" → [↓](#t89)
- **T90** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:174 — resolved — last: @vzakharov (agent) 2026-09-16T17:48:07Z — "Переписал: измерений два, а линз могло выйти и шесть, и восе…" → [↓](#t90)
- **T91** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:191 — resolved — last: @vzakharov (agent) 2026-09-16T17:48:34Z — "Полугода не было — и самого упоминания коммита тоже больше н…" → [↓](#t91)
- **T92** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:196 — resolved — last: @vzakharov (agent) 2026-09-16T17:48:38Z — "Принято, с твоей метафорой: сохраняется ненужная информация…" → [↓](#t92)
- **T93** `writing/late-stage-agentic/dictations/b2-tend-prose.md`:206 — resolved — last: @vzakharov (agent) 2026-09-16T17:49:04Z — "Согласен, и это ровно тот промах, про который сама запись: н…" → [↓](#t93)
- **T94** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:19 — resolved — last: @vzakharov (agent) 2026-09-16T17:49:30Z — "Прав: голубь был слеп, как и пациент, — это дедукция, а не п…" → [↓](#t94)
- **T95** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:40 — resolved — last: @vzakharov (agent) 2026-09-16T17:49:57Z — "Убрал, осталось ровно два варианта. 22f707d" → [↓](#t95)
- **T96** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:64 — resolved — last: @vzakharov (agent) 2026-09-16T17:50:23Z — "Дописал дословно. 22f707d" → [↓](#t96)
- **T97** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:77 — resolved — last: @vzakharov (agent) 2026-09-16T17:50:49Z — "Вставил. 22f707d" → [↓](#t97)
- **T98** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:79 — resolved — last: @vzakharov (agent) 2026-09-16T17:51:15Z — "Заменил. 22f707d" → [↓](#t98)
- **T99** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:98 — resolved — last: @vzakharov (agent) 2026-09-16T17:51:41Z — "Убрал всё до конца абзаца. 22f707d" → [↓](#t99)
- **T100** `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:136 — resolved — last: @vzakharov (agent) 2026-09-16T17:52:08Z — "Поставил концовкой. 22f707d" → [↓](#t100)
- **T101** `writing/late-stage-agentic/ideas/keep-the-session-open.md`:3 — resolved — last: @vzakharov (agent) 2026-09-16T17:52:34Z — "Переписал с твоей причины: ветка в любой момент отвечает, чт…" → [↓](#t101)
- **T102** `writing/late-stage-agentic/ideas/prose-spacetime.md`:1 — resolved — last: @vzakharov (agent) 2026-09-16T17:53:00Z — "Переписал в протоидею: зацепило сходство разговора с физикой…" → [↓](#t102)
- **T103** `writing/late-stage-agentic/ideas/task-size.md`:7 — resolved — last: @vzakharov (agent) 2026-09-16T17:53:27Z — "Дописал: развилку, которую ты прошёл бы иначе, видишь уже пр…" → [↓](#t103)
- **T104** `writing/late-stage-agentic/ideas/whose-vm-whose-minutes.md`:3 — resolved — last: @vzakharov (agent) 2026-09-16T17:53:53Z — "Переписал: статья-лайфхак про CI на VM Клода, без привязки к…" → [↓](#t104)
- **T105** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:72 — resolved — last: @vzakharov (agent) 2026-09-16T18:49:50Z — "Убрал: «Вы можете запускать хоть десять, хоть пятнадцать сес…" → [↓](#t105)
- **T106** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:73 — resolved — last: @vzakharov (agent) 2026-09-16T18:50:16Z — "Выправил на первое — абзац и так про то, как это у меня устр…" → [↓](#t106)
- **T107** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:98 — resolved — last: @vzakharov (agent) 2026-09-16T18:50:43Z — "Верно, противопоставление было не то. Сейчас: «не тащу её да…" → [↓](#t107)
- **T108** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:156 — resolved — last: @vzakharov (agent) 2026-09-16T18:51:10Z — "Согласен, и это тот же промах, что и с послесловиями: журнал…" → [↓](#t108)
- **T109** `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:1 — resolved — last: @vzakharov (agent) 2026-09-16T18:51:36Z — "Сделал во всех трёх: раздел «Рыба» между саммари и текстом —…" → [↓](#t109)
- **T110** `writing/late-stage-agentic/ideas/keep-the-session-open.md`:1 — resolved — last: @vzakharov (agent) 2026-09-16T18:52:02Z — "Переписал под это: мегапиксели из третьей записи, но на прак…" → [↓](#t110)
- **T111** `writing/late-stage-agentic/ideas/ci-on-the-agents-vm.md`:1 — resolved — last: @vzakharov (agent) 2026-09-16T18:52:28Z — "Поменял на `ci-on-the-agents-vm.md` — слаг про лайфхак, заго…" → [↓](#t111)

<a id="t01"></a>

### `docs/remove-before-merging/deepgram/b1-web-not-cli.deepgram.json`:1 — resolved

**@vzakharov (human)** — 2026-09-16T09:30:04Z

а давай таки не будем их трекать (будем оставлять только в tmp/), маркдауна с подробным транскриптом кажется достаточно для 99% случаев

**@vzakharov (agent)** — 2026-09-16T11:33:09Z

Не трекаем: у `transcribe.py` появился `--json-dir`, по умолчанию `tmp/deepgram/`, а в дереве остаётся только таймкодированный маркдаун. `/subtitles` за пословными таймингами перезапустит скрипт по медиа с ветки — один вызов API вместо мегабайтов JSON в репе навсегда.

---

<a id="t02"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:41 — resolved

```diff
@@ -0,0 +1,198 @@
… 37 lines elided …
+Я начинал со второго пути и очень долго не хотел переходить на первый.
+
+Как многие, я чувствую себя крутым хакером, когда я вижу консольный интерфейс, а
+если ещё у меня там какой-нибудь не просто консоль, а iTerm, в котором три
```

**@vzakharov (human)** — 2026-09-16T09:35:32Z

давай добавим третий режим диктовки, когда мы не резюмируем, но и не пишем дословно, а, скажем так, причёсываем для повторной записи. Rationale: я прочитал, где-то сбился, где-то коряво выразился. На выходе скилла же у меня будет то, как можно это перепрочитать ещё раз, уже используя этот файл как источник -- то есть И сохраняя исходные речевые обороты, И избегая корявостей, тавтологий, ненужных детуров (но не переборщить с этим, иногда грамотный детур делает больше чем основной текст) и прочего.

таким образом можно вырезать места типа "какой-нибудь не просто консоль". при этом какие-то вещи (как эту) можно править молча, а для каикх-то более больших составить списочек в конце, чтобы я перепроверил, не потерялась ли соль.

ну и соответственно переобработай эти три файла с учётом этого нового режима.

**@vzakharov (agent)** — 2026-09-16T11:33:10Z

Сделал: режим `retake` — в файлах «режим чистовой начитки», — третий рядом с verbatim и prose. Правила в `.claude/skills/dictation/SKILL.md` § «Retake mode»: обороты, регистр и порядок мысли твои; уходят фальстарты, тавтологии и детуры в никуда, а недоправить лучше, чем переправить, потому что текст, вылизанный до последнего предложения, потом приходится побеждать у микрофона.

Две градации правок, как ты и сказал: слово, повтор, распутанная фраза — молча; всё, что меняет сказанное, — строкой в таблице «Что поправлено» в конце файла. Все три записи переобработаны.

---

<a id="t03"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:59 — resolved

```diff
@@ -0,0 +1,198 @@
… 54 lines elided …
+
+Первая причина — это что мой ноутбук перестал плавиться. Обычно, когда я работал
+локально, я мог запустить три-пять, максимум шесть сессий, и они настолько
+молотили процессор, что просто у меня вентилятор уже переходил на какой-то
+сверхзвуковой режим. Так не говорят, ну, в общем, вы понимаете. И нагревался, и
```

**@vzakharov (human)** — 2026-09-16T09:36:50Z

(в новом режиле) для таких вещей (метафора мимо цели) можно (с последующим упоминанием в списке) подбирать более подходящую

**@vzakharov (agent)** — 2026-09-16T11:33:11Z

«Вентилятор выходил на взлётный режим» — картинка та же, но снимать её на ходу не надо. Строка в «Что поправлено» есть.

---

<a id="t04"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:65 — resolved

```diff
@@ -0,0 +1,198 @@
… 61 lines elided …
+В вебе же всё делается не на вашем компьютере. Вы можете хоть десять, хоть
+пятнадцать сессий одновременно, что я и делаю. То есть мой стандартный рабочий
+день — это посмотреть фронт задач, запустить десять-пятнадцать сессий и
+комфортненько переключаться между ними по режиму. Значит, здесь освободилась,
```

**@vzakharov (human)** — 2026-09-16T09:38:59Z

"по режиму" относится к тому что описывается дальше, т.е. типа "по следующему режиму"

**@vzakharov (agent)** — 2026-09-16T11:33:13Z

Развязал: «…комфортненько переключаться между ними. Режим примерно такой: здесь освободилась, агент работу закончил…».

---

<a id="t05"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:80 — resolved

```diff
@@ -0,0 +1,198 @@
… 66 lines elided …
+отвечаешь, смотришь другие. В этот момент запустился другой, и у тебя получается
+постоянный поток из постановки задач, каких-то там ещё мониторинговых действий.
+
+### Конвейер вместо ожидания
+
+Это приводит ко второму пункту, что вы сможете работать более по конвейерному
+режиму, чем когда вы запускаете это в консоли.
+
+Вот вы запустили и вы читаете всё это время, что агент делает. В это время вам
+делать нечего, возможно, вам надоест, вы переключаетесь на YouTube. В результате
+вы возвращаетесь, агент уже всё сделал, вы тем временем посмотрели там весь
+второй сезон «Игры престолов» и ничего не сделали.
+
+### Читать мысли агента — не тот рычаг
```

**@vzakharov (human)** — 2026-09-16T09:51:20Z

надо объединить в одну секцию, а то "второй пункт" один, а заголовка два, путает. (Понятно что это не reader-facing, но для самих себя тоже.)

**@vzakharov (agent)** — 2026-09-16T11:33:14Z

Объединил в одну секцию — «Причина вторая: конвейер вместо микроменеджмента», — и заодно перенумеровал: причина первая, вторая, третья.

---

<a id="t06"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:99 — resolved

```diff
@@ -0,0 +1,198 @@
… 95 lines elided …
+Потом могу зайти на вкладку, значит, код-ревью, всё пролистать, оставить ему
+комментарий прямо там в код-ревью, сказать: здесь вот лучше не так, здесь лучше
+это выделить в отдельную функцию, это переместить и так далее, и тому подобное.
+Потом я возвращаюсь в эту сессию — я эту сессию [не закрываю], об этом мы тоже
```

**@vzakharov (human)** — 2026-09-16T09:52:12Z

компакчу, от слова compact :)

**@vzakharov (agent)** — 2026-09-16T11:33:15Z

Компакчу.

---

<a id="t07"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:101 — resolved

```diff
@@ -0,0 +1,198 @@
… 97 lines elided …
+это выделить в отдельную функцию, это переместить и так далее, и тому подобное.
+Потом я возвращаюсь в эту сессию — я эту сессию [не закрываю], об этом мы тоже
+будем говорить, зачем это делать, — и говорю: вот там остались комменты, давай,
+[?] дальше. Запускаю, он опять смотрит, выгружает pull request, смотрит мой
```

**@vzakharov (human)** — 2026-09-16T09:53:26Z

"дерзай дальше"

давай напишем в скилле что в местах где непонятно оставлять таймстамп сразу в квадратных скобках, чтобы мне легче самому эти места искать было

**@vzakharov (agent)** — 2026-09-16T11:33:17Z

«дерзай дальше» — поставил.

Про таймстампы записал в скилл (Step 4): каждая пометка в тексте несёт таймкод — `[?04:12]`, `[база 06:31]`, — потому что искать их ты будешь скрабом по записи, а не поиском по слову.

---

<a id="t08"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:102 — resolved

```diff
@@ -0,0 +1,198 @@
… 98 lines elided …
+Потом я возвращаюсь в эту сессию — я эту сессию [не закрываю], об этом мы тоже
+будем говорить, зачем это делать, — и говорю: вот там остались комменты, давай,
+[?] дальше. Запускаю, он опять смотрит, выгружает pull request, смотрит мой
+коммент и идёт дальше.
```

**@vzakharov (human)** — 2026-09-16T09:53:38Z

"мои комменты"

**@vzakharov (agent)** — 2026-09-16T11:33:18Z

Поправил.

---

<a id="t09"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:111 — resolved

```diff
@@ -0,0 +1,198 @@
… 107 lines elided …
+
+И это приводит к третьему моменту. Я, когда не хотел переходить в веб, я думал,
+что если у меня будет работать несколько агентов, каждый в своей ветке, потому
+что локально-то мы обычно этого не делаем — там, конечно, есть всякие [?], но
```

**@vzakharov (human)** — 2026-09-16T09:54:01Z

work trees, да

**@vzakharov (agent)** — 2026-09-16T11:33:19Z

Поправил.

---

<a id="t10"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:115 — resolved

```diff
@@ -0,0 +1,198 @@
… 111 lines elided …
+чаще всего, если ты работаешь локально, ты работаешь на одной базе. Если агенты
+там друг с другом как-то пересекаются, они это сразу видят, что кто-то там
+работает над чем-то другим. В общем, можно сказать, что у вас в каждый момент
+времени ваша [база] содержит текущее состояние всего, над чем вы работаете, и вам
```

**@vzakharov (human)** — 2026-09-16T09:54:29Z

репа

**@vzakharov (agent)** — 2026-09-16T11:33:20Z

Поправил.

---

<a id="t11"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:116 — resolved

```diff
@@ -0,0 +1,198 @@
… 112 lines elided …
+там друг с другом как-то пересекаются, они это сразу видят, что кто-то там
+работает над чем-то другим. В общем, можно сказать, что у вас в каждый момент
+времени ваша [база] содержит текущее состояние всего, над чем вы работаете, и вам
+не нужно думать об этих [пересечениях]. И кажется, что это будет прям
```

**@vzakharov (human)** — 2026-09-16T09:54:37Z

мёрджах

**@vzakharov (agent)** — 2026-09-16T11:33:21Z

Поправил.

---

<a id="t12"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:120 — resolved

```diff
@@ -0,0 +1,198 @@
… 116 lines elided …
+очень-очень-очень страшно.
+
+А оказалось, что вообще нет, ни разу. Агенты настолько — если им дать ещё для
+этого подходящий скилл, и об этом мы поговорим, как правильно [мержить] main, —
```

**@vzakharov (human)** — 2026-09-16T09:55:20Z

верно, но мёрДжить, через ё и д

**@vzakharov (agent)** — 2026-09-16T11:33:22Z

Поправил — и во всех остальных местах тоже: мёрдж, мёрджить, мёрджах.

---

<a id="t13"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:123 — resolved

```diff
@@ -0,0 +1,198 @@
… 119 lines elided …
+этого подходящий скилл, и об этом мы поговорим, как правильно [мержить] main, —
+то агенты очень нормально замечают, как main продвинулся, что там изменилось
+относительно момента, когда они начинали работать, какие изменения им нужно
+сделать, как разрешить конфликты, где взять свою версию, где взять версию [main],
```

**@vzakharov (human)** — 2026-09-16T09:55:51Z

верно

**@vzakharov (agent)** — 2026-09-16T11:33:23Z

Принято.

---

<a id="t14"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:131 — resolved

```diff
@@ -0,0 +1,198 @@
… 127 lines elided …
+
+### Заповедь
+
+Так что вот, заповедь такая: не нужно работать через консоль. Открывайте [?] или
```

**@vzakharov (human)** — 2026-09-16T09:56:14Z

claude.ai/code

**@vzakharov (agent)** — 2026-09-16T11:33:25Z

Поставил.

---

<a id="t15"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:146 — resolved

```diff
@@ -0,0 +1,198 @@
… 142 lines elided …
+на другую.
+
+Немножко это, конечно, давит на мозг с точки зрения контекста, но я привык к
+этому вообще. Не прошло и недели, как я уже просто кайфовал от этого. Мотайте на
```

**@vzakharov (human)** — 2026-09-16T09:57:34Z

имеется в виду "вообще (быстро) -- не прошло и недели..."

**@vzakharov (agent)** — 2026-09-16T11:33:26Z

«…но привык я к этому быстро: не прошло и недели, как я уже просто кайфовал».

---

<a id="t16"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:169 — resolved

```diff
@@ -0,0 +1,198 @@
… 165 lines elided …
+| «Удобный у всех есть функционал»      | У всех есть функционал       | оговорка, снятая им самим                                                           |
+
+Ещё два места, где слова разобраны уверенно, но фраза странная — правь сам, я их
+не трогал: «посмотреть **фронт задач**» и «переключаться между ними **по
```

**@vzakharov (human)** — 2026-09-16T09:58:09Z

с режимом отписал выше, а что странного во "фронте задач"? фронт работ типа, или про задачи так не говорят?

**@vzakharov (agent)** — 2026-09-16T11:33:27Z

Ничего странного, я перестраховался: «фронт работ» — устойчивое, «фронт задач» читается как его законный вариант. Пометил только потому, что он реже, а не потому, что неверен. Оставил как есть.

---

<a id="t17"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:180 — resolved

```diff
@@ -0,0 +1,198 @@
… 175 lines elided …
+**Третий аргумент — самый сильный, и он стоит последним.** Про плавящийся ноутбук
+знают все, про конвейер догадываются, а вот «я боялся, что ветки передерутся, и
+зря» — это ровно тот страх, который держит человека в консоли. Он назван, назван
+честно («я думал, что будет очень-очень-очень страшно») и снят опытом. В посте я
+бы начинал с него.
```

**@vzakharov (human)** — 2026-09-16T09:58:55Z

мне кажется заканчивать как раз нужно самым сильным. как вариант, ставить его на "предпост" -- вырезу (из видео), которая, например, будет идти в сториз.

**@vzakharov (agent)** — 2026-09-16T11:33:28Z

Согласен, и заметку переписал. «Начинай с сильного» — правило для текста, который пролистывают; здесь вся запись устроена как снятие страха, и в начале снимать нечего. А вырезка в сториз — отдельно хорошая мысль: тридцать секунд, где страх называется и объявляется пустым, работают анонсом, а не спойлером.

---

<a id="t18"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:182 — resolved

```diff
@@ -0,0 +1,198 @@
… 178 lines elided …
+честно («я думал, что будет очень-очень-очень страшно») и снят опытом. В посте я
+бы начинал с него.
+
+**Нумерация в записи поехала**, и это видно: «первая причина», потом «второй
```

**@vzakharov (human)** — 2026-09-16T09:59:23Z

про это отписал. конвейер и НЕслежение за мыслями -- это один и тот же аспект, а ля против микроменеджинга

**@vzakharov (agent)** — 2026-09-16T11:33:29Z

Свёл в одну секцию, счёт причин теперь ровно 1-2-3 — и в заметках этот пункт больше не нужен, он ушёл вместе с исправленной нумерацией.

---

<a id="t19"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:193 — resolved

```diff
@@ -0,0 +1,198 @@
… 184 lines elided …
+пункт, а объяснение, почему конвейер ничего не теряет. Если из этого делается
+статья, структура уже есть, её надо только пронумеровать заново.
+
+**Одно место продаёт не то, что ты продаёшь.** «Помогает при СДВГ» и «комфортно
+щёлкаете между вкладочками» — это описание дня, в котором пятнадцать задач
+переключаются быстрее, чем додумывается одна. Дальше по «библии» идёт мысль, что
+человек нужен ради неожиданных прозрений, а прозрение требует незанятой головы.
+Два тезиса не противоречат друг другу, но и не встречаются: стоит сказать, что
+именно конвейер освобождает от ожидания, а не от думания.
```

**@vzakharov (human)** — 2026-09-16T10:00:18Z

интересное наблюдение. порефлексировал быстро. имхо как раз, так как переключение помогает НЕ фокусироваться на одной задаче, оно приводит к большему количеству "кросс-задачным" прозрениям

**@vzakharov (agent)** — 2026-09-16T11:33:30Z

Твой ответ сильнее моего вопроса, так что переписал заметку под него: переключение мешает залипнуть на одной задаче, и именно поэтому прозрения выходят кросс-задачными — мысль из ветки про парсер приходит в ветку про деплой, потому что за двадцать минут ты был в обеих. Это отдельный аргумент за конвейер, а не оговорка в его пользу.

---

<a id="t20"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:198 — resolved

```diff
@@ -0,0 +1,198 @@
… 191 lines elided …
+Два тезиса не противоречат друг другу, но и не встречаются: стоит сказать, что
+именно конвейер освобождает от ожидания, а не от думания.
+
+**Чего в записи нет, а в статье понадобится: цены.** Облачная сессия — это чужая
+машина, чужой прогон CI и чужой счёт. Аргумент «ноутбук перестал плавиться»
+слушатель достроит сам до «а сколько это стоит», и лучше ответить, чем оставить
+вопрос висеть.
```

**@vzakharov (human)** — 2026-09-16T10:02:21Z

про чужой прогон CI это хорошо, но это скорее про VM клода (где это бесплатно) vs VM гитхаба (где все минуты считаются). Не думаю что кто-то реально по перегреву компа будет считать счета за электричество и амортизацию этого самого компа? Затравку про VM клода можно буквально одной фразой добавить в нужное место, с уже сложившимся крючком "об этом позже"

**@vzakharov (agent)** — 2026-09-16T11:33:31Z

Завёл `writing/late-stage-agentic/ideas/whose-vm-whose-minutes.md` и вставил в запись ровно одну фразу с крючком: «Процессор при этом греется чужой — правда, не совсем бесплатно, и про то, чья это машина и чьи минуты, поговорим отдельно». Про электричество и амортизацию согласен — это была слабая половина довода, её нет.

**@vzakharov (human)** — 2026-09-16T11:58:13Z

тут не со всем про то. "не бесплатно" это как раз про локальную машину и про гитхаб; в случае с кодом это фактически бесплатно, потому что уже включено в подписку.

я б написал а ля "Кстати, в VM клода можно засунуть и ещё кое-что, чтобы сократить счёт на гитхаб -- но об этом в другой раз"

**@vzakharov (agent)** — 2026-09-16T12:21:40Z

Поправил: «Процессор при этом греется чужой, и — в отличие от вашего собственного — фактически бесплатно: он уже входит в подписку. Кстати, в эту виртуалку можно засунуть и кое-что ещё, чтобы сократить счёт за гитхабовские минуты, — но об этом в другой раз». Идея `whose-vm-whose-minutes.md` ровно про эту границу и была, так что хеджа в записи больше нет. 9745ac6

---

<a id="t21"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:26 — resolved

```diff
@@ -0,0 +1,198 @@
… 22 lines elided …
+
+### Что такое проза
+
+Хочу поговорить о [прозе]. Прозой будем называть любой текст, который
```

**@vzakharov (human)** — 2026-09-16T10:03:46Z

верно. hereafter, если коммента к непонятому нет, значит понято верно (в скилл это тоже можно добавить: if during further review no correction arriver blablabla)

**@vzakharov (agent)** — 2026-09-16T11:33:33Z

Записал в скилл: пометка, мимо которой ты прошёл молча, считается разобранной верно и уходит из таблицы на том же проходе, что и те, на которые ты ответил. Ждать подтверждения на правильные — это способ никогда таблицу не сократить. Все три таблицы «Что пришлось угадывать» теперь пустые и убраны.

---

<a id="t22"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:35 — resolved

```diff
@@ -0,0 +1,198 @@
… 30 lines elided …
+У агентов есть такое свойство: они очень много пишут. И когда они видят, что в
+репозитории уже много написано, они пишут ещё больше.
+
+Это, кстати, одно из проявлений правила «принимать данность за неизбежность». Не
+правило, а назовём это как-то fallacy — как это по-русски — ошибки.
```

**@vzakharov (human)** — 2026-09-16T10:04:46Z

давай сделаем тут `... неизбежность" -- назовём это ошибкой неизбежности`

**@vzakharov (agent)** — 2026-09-16T11:33:34Z

«…одно из проявлений того, как данность принимается за неизбежность, — назовём это ошибкой неизбежности». Заодно у ошибки появилось имя, которым можно пользоваться дальше.

**@vzakharov (human)** — 2026-09-16T11:58:54Z

можно тогда в "пяти процентах" тоже обозвать её как aka inevitability fallacy

**@vzakharov (agent)** — 2026-09-16T12:22:06Z

Обозвал: секция «What it was handed, it treats as fixed» теперь открывается на «it takes a given for an inevitability, aka the **inevitability fallacy**». 9745ac6

---

<a id="t23"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:37 — resolved

```diff
@@ -0,0 +1,198 @@
… 33 lines elided …
+Это, кстати, одно из проявлений правила «принимать данность за неизбежность». Не
+правило, а назовём это как-то fallacy — как это по-русски — ошибки.
+
+Мы, работая уже долгое время вместе, разделили все эти ошибки, которые делает
```

**@vzakharov (human)** — 2026-09-16T10:05:11Z

работая с Клодом

**@vzakharov (agent)** — 2026-09-16T11:33:35Z

Поправил: «Мы, работая с Клодом уже долгое время…».

---

<a id="t24"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:42 — resolved

```diff
@@ -0,0 +1,198 @@
… 38 lines elided …
+
+### Аббревиатура
+
+Мы это назвали TEND, от первых букв: T, E, N, D. Ой, как это — маркетерское
```

**@vzakharov (human)** — 2026-09-16T10:05:32Z

`D. (Маркетёрское прошлое...`

**@vzakharov (agent)** — 2026-09-16T11:33:37Z

Поправил, скобка теперь после D.

---

<a id="t25"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:51 — resolved

```diff
@@ -0,0 +1,198 @@
… 47 lines elided …
+
+T — это [tightness]. Это самая простая из всех, которая говорит о том, что, в
+принципе, агенты пишут много, и то, что они написали, зачастую можно на 30, а то
+и [?] процентов, а то и в два раза сократить.
```

**@vzakharov (human)** — 2026-09-16T10:06:03Z

сократить на 30 процентов, а то и в два раза

**@vzakharov (agent)** — 2026-09-16T11:33:38Z

Поправил: «сократить на тридцать процентов, а то и в два раза».

---

<a id="t26"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:55 — resolved

```diff
@@ -0,0 +1,198 @@
… 49 lines elided …
+принципе, агенты пишут много, и то, что они написали, зачастую можно на 30, а то
+и [?] процентов, а то и в два раза сократить.
+
+У нас есть скилл, который так и называется, `tend-prose`, и, значит, у него есть
+четыре этапа. И один из этих этапов, как я сказал, это T, tightness. Агент
+проходится по всему, что он добавил с последнего раза, и сокращает это.
```

**@vzakharov (human)** — 2026-09-16T10:06:34Z

про скилл давай вперёд отдельных секций засунем, а то какая-то сбивка в повествовании

**@vzakharov (agent)** — 2026-09-16T11:33:39Z

Перенёс в «Аббревиатуру», до отдельных линз — там он уже не сбивает.

---

<a id="t27"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:65 — resolved

```diff
@@ -0,0 +1,198 @@
… 61 lines elided …
+Например, у вас может быть какой-нибудь простенький форк в вашей функции, который
+говорит: если у нас вот такая-то ситуация, мы делаем это, если другая ситуация —
+делаем другое. И, в принципе, код, который это описывает, он самодостаточен,
+потому что мы пишем не на… языке, мы пишем на, не знаю, неважно чём. Но в
```

**@vzakharov (human)** — 2026-09-16T10:06:57Z

не на языке Brainfuck, а на тайпскрипте, питоне, го, чём-то таком, и в большинстве случаев

**@vzakharov (agent)** — 2026-09-16T11:33:40Z

Поставил твою формулировку целиком.

---

<a id="t28"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:74 — resolved

```diff
@@ -0,0 +1,198 @@
… 70 lines elided …
+из гипотез — что они таким образом с нами общаются. То есть они пишут этот
+коммент не для самой базы, а для нас, которые сейчас дали им эту задачу. И они
+вот хотят, поскольку у них есть такой канал общения с нами, они вместо того,
+чтобы единым… единым [?]… [?] комментарии по коду, что окей.
```

**@vzakharov (human)** — 2026-09-16T10:10:17Z

вместо того чтобы ответить нам в чате единым сообщением оставляют комметарии по коду, что в принципе окей

**@vzakharov (agent)** — 2026-09-16T11:33:42Z

Поставил твою формулировку целиком. В записи здесь десять секунд невнятного с уверенностью до 0.23, так что без тебя это место было не спасти.

---

<a id="t29"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:76 — resolved

```diff
@@ -0,0 +1,198 @@
… 72 lines elided …
+вот хотят, поскольку у них есть такой канал общения с нами, они вместо того,
+чтобы единым… единым [?]… [?] комментарии по коду, что окей.
+
+Ну, как я говорил, случаются ситуации, когда этого делать вообще не нужно, и вот,
```

**@vzakharov (human)** — 2026-09-16T10:10:23Z

Но, не Ну

**@vzakharov (agent)** — 2026-09-16T11:33:43Z

Поправил.

---

<a id="t30"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:78 — resolved

```diff
@@ -0,0 +1,198 @@
… 74 lines elided …
+
+Ну, как я говорил, случаются ситуации, когда этого делать вообще не нужно, и вот,
+значит, за этот второй этап агент просто удаляет ненужные комментарии. Он самый
+приятный, потому что он больше всего сокращает написанного — кода или не кода — и
```

**@vzakharov (human)** — 2026-09-16T10:10:39Z

кода, точнее НЕ-кода,

**@vzakharov (agent)** — 2026-09-16T11:33:44Z

Поправил.

---

<a id="t31"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:88 — resolved

```diff
@@ -0,0 +1,198 @@
… 84 lines elided …
+
+Белый медведь — потому что есть у Достоевского такая фраза, я её сейчас
+перефразирую, но звучит она как: задайте себе задачу не думать о белом медведе, и
+проклятый будет бесконечно сиюминутно лезть вам в голову.
```

**@vzakharov (human)** — 2026-09-16T10:11:05Z

бесконечно и сиюминутно

**@vzakharov (agent)** — 2026-09-16T11:33:45Z

Поправил.

---

<a id="t32"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:93 — resolved

```diff
@@ -0,0 +1,198 @@
… 86 lines elided …
+перефразирую, но звучит она как: задайте себе задачу не думать о белом медведе, и
+проклятый будет бесконечно сиюминутно лезть вам в голову.
+
+Вот есть такое свойство, что когда мы принимаем какое-то решение относительно
+нашего кода, мы его можем описать. И это может быть решение нестандартное,
+например, что у нас вот, когда происходит вот это, мы ещё хотим сделать то-то,
+потому что то-то, то-то, то-то.
```

**@vzakharov (human)** — 2026-09-16T10:11:39Z

тут наиболее коряво всё выражено. Прежде всего, нужно придумать какой-то реальный пример потому что, конечно, "то-то, то-то, то-то" это не фактура.

**@vzakharov (agent)** — 2026-09-16T11:33:46Z

Придумал пример: отдаём картинки через свой ресайзер, а не через CDN-ный, потому что тот портит прозрачность, — рядом честный коммент, почему так. Потом решение отменяют, код уходит, а агент оборачивает коммент в отрицание: «мы не гоняем картинки через свой ресайзер, потому что CDN справляется сам».

Пример мой, а не твой, поэтому он стоит первой строкой в «Что поправлено» — если он не про твою жизнь, замени, каркас абзаца от этого не поедет.

**@vzakharov (human)** — 2026-09-16T12:00:50Z

отлично, только добавить вскользь, почему отменяем (например, поумнел cdn)

**@vzakharov (agent)** — 2026-09-16T12:22:33Z

Добавил: «Потом CDN умнеет, прозрачность он больше не портит, и мы решаем: не, давайте так делать не будем, давайте как все». 9745ac6

---

<a id="t33"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:126 — resolved

```diff
@@ -0,0 +1,198 @@
… 122 lines elided …
+где-то комментарий у вас говорит: раньше мы делали это вот так, а теперь мы
+делаем это вот эдак.
+
+Это всё хорошие вещи, но это вещи, которые принадлежат истории, которые
```

**@vzakharov (human)** — 2026-09-16T10:12:58Z

1- тут скорее "важные" чем "хорошие"
2- истории коммитов

**@vzakharov (agent)** — 2026-09-16T11:33:47Z

Оба поправил: «важные вещи», «принадлежат истории — истории коммитов».

**@vzakharov (human)** — 2026-09-16T12:01:06Z

"принадлежат истории коммитов", не вижу смысл тут повторять "истории"

**@vzakharov (agent)** — 2026-09-16T12:22:59Z

Убрал повтор: «принадлежат истории коммитов, каким-то артефактам типа pull request…». 9745ac6

---

<a id="t34"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:145 — resolved

```diff
@@ -0,0 +1,198 @@
… 141 lines elided …
+понимаю, как многого словесного поноса можно избежать — и мы бы его не избежали,
+если бы не прошли через эти линзы.
+
+Поэтому беритесь на вооружение.
```

**@vzakharov (human)** — 2026-09-16T10:14:33Z

берите на вооружение

**@vzakharov (agent)** — 2026-09-16T11:33:48Z

Поправил.

---

<a id="t35"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:149 — resolved

```diff
@@ -0,0 +1,198 @@
… 145 lines elided …
+этому вообще. Не прошло и недели, как я уже просто кайфовал от этого. Мотайте на
+ус.
+
+## Что пришлось угадывать
```

**@vzakharov (human)** — 2026-09-16T10:14:56Z

эти отдельно не смотрю, поскольку отмечал по тексту. если что-то осталось, оставь только его

**@vzakharov (agent)** — 2026-09-16T11:33:49Z

Таблица «Что пришлось угадывать» ушла целиком — всё, что в ней было, ты закрыл по тексту. На её месте теперь «Что поправлено»: не догадки расшифровки, а крупные правки нового режима, чтобы ты проверил, не потерялась ли соль.

---

<a id="t36"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:176 — resolved

```diff
@@ -0,0 +1,198 @@
… 171 lines elided …
+по времени: текст описывает не то положение дел, которое есть сейчас — один
+отрицает отменённое решение, другой пересказывает прошлое. Аббревиатура держит их
+в одном ряду, и порядок T-E-N-D получается ради выговариваемости, а не ради
+смысла. Это не повод её менять — она работает, — но в статье пара «объём / время»
+объясняет, почему линз именно четыре, а список из четырёх не объясняет ничего.
```

**@vzakharov (human)** — 2026-09-16T10:16:35Z

тут не очень понял твой оборот фразы про что где объясняет; но согласен, что дихотомия интересная, и в статье её можно включить

**@vzakharov (agent)** — 2026-09-16T11:33:50Z

Виноват, накрутил. Смысл простой: список из четырёх пунктов показывает, что их четыре, и не отвечает, почему не три и не семь. Пара «объём / время» — отвечает. Переписал заметку так, чтобы это было одной фразой.

**@vzakharov (human)** — 2026-09-16T12:02:07Z

объём-время -- прямо какой-то пространственно-временной континуум. (так, эпифания в сторону. можно где-то в идеях записать, гг)

**@vzakharov (agent)** — 2026-09-16T12:23:25Z

Записал: `writing/late-stage-agentic/ideas/prose-spacetime.md` — две оси вместо списка из четырёх пунктов, и почему вторая координата ловит ровно те дефекты, которые переживают рефакторинг. Из заметок агента на неё теперь ссылка. 9745ac6

---

<a id="t37"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:182 — resolved

```diff
@@ -0,0 +1,198 @@
… 177 lines elided …
+**Гипотеза про «они пишут это для нас» — самое интересное место, и оно брошено.**
+Мысль в том, что комментарий адресован не базе кода, а человеку, который сейчас
+дал задачу, — то есть агент отвечает на сообщение, а отвечать ему больше негде.
+Дальше фраза обрывается, но у неё есть очевидное продолжение, которое ты уже
+применяешь на практике: канал для этого есть — описание пиара, комментарии в
```

**@vzakharov (human)** — 2026-09-16T10:17:19Z

там запись почему-то скукожилась, но я примерно про это и говорил (только упоминал сообщение в чате). а так да, остальные тоже можно указать в статье.

**@vzakharov (agent)** — 2026-09-16T11:33:52Z

Понял. В чистовую начитку продолжение мысли теперь добавлено — абзац про то, что линза забирает у агента неправильный канал; в заметке осталось то, что стоит развернуть в статье: каналов у агента ровно столько, сколько мы ему дали, и если единственный, который он видит в момент работы, — это файл перед ним, он будет писать в файл.

---

<a id="t38"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:184 — resolved

```diff
@@ -0,0 +1,198 @@
… 179 lines elided …
+дал задачу, — то есть агент отвечает на сообщение, а отвечать ему больше негде.
+Дальше фраза обрывается, но у неё есть очевидное продолжение, которое ты уже
+применяешь на практике: канал для этого есть — описание пиара, комментарии в
+код-ревью, сообщение для мержа. Линза E работает потому, что забирает у агента
+неправильный канал, а не потому, что он болтлив.
```

**@vzakharov (human)** — 2026-09-16T10:17:40Z

да, про то что "не потому что болтлив" можно добавить не только в статью но и в версию для чистовой начитки

**@vzakharov (agent)** — 2026-09-16T11:33:53Z

Добавил в текст для начитки, в конец секции про E.

---

<a id="t39"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:189 — resolved

```diff
@@ -0,0 +1,198 @@
… 183 lines elided …
+неправильный канал, а не потому, что он болтлив.
+
+**Белый медведь ловит не только отрицания.** Правило сформулировано узко — «если
+поменял да на нет», — но тот же след остаётся всюду, где текст переживает то, что
+описывал: комментарий про параметр, которого больше нет, раздел про этап,
+который убрали. Отрицание — самая заметная форма, потому что она сама себя
```

**@vzakharov (human)** — 2026-09-16T10:20:00Z

я бы так не сказал.. из моего опыта, разделы об убранных этапах агенты замечают как раз нормально (хотя есть и исключения, см. 7e8c401), но вот вместо того чтобы просто убирать эти разделы (не огульно, конечно, а когда обратное является нормой), они их "отрицают". 

в общем, я не помню коммита `polish:`, в котором было бы "забыли убрать этот раздел", это немного про другое

**@vzakharov (agent)** — 2026-09-16T11:33:54Z

Ты прав, я перегнул, и заметку переписал. 7e8c401 — это не промах линзы, а никем не прочитанный файл: ловится он чтением файла против репы, а не проходом по дифу. Настоящая находка в другом, и она твоя — агент выбирает отрицание вместо удаления. Понятно и почему: удалить выглядит как потерять информацию, а отрицать — как сохранить. N ценна тем, что снимает эту иллюзию.

---

<a id="t40"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:198 — resolved

```diff
@@ -0,0 +1,198 @@
… 189 lines elided …
+объявляет; остальные молчаливые. Стоит решить, линза это N или D, иначе такие
+места не ловит ни одна.
+
+**Что здесь принимается за неизбежность, но не названо.** Запись говорит, что
+агенты пишут много, потому что видят много написанного. Второй причины она не
+называет: текст — это единственное, чем агент может показать работу. Пустой диф
+выглядит как ничего не сделано. Пока это так, линзы будут срабатывать вечно, и
+это не признак поломки, а плата — как и сказано в конце, «мы бы его не избежали,
+если бы не прошли».
```

**@vzakharov (human)** — 2026-09-16T10:21:32Z

вот тут то ли ты не до конца понял, о чём я говорил, то ли я -- что ты здесь говоришь.

"данность" в даном случае была про то, что в коде много комментариев, даже для очевидных вещей. Увидев это, агент добавит ещё один комментарий для очевидной вещи, и ещё, и ещё -- просто потому что не нужно забывать что в основе своей любой агент это completion, а completion принимает форму того, что комплитит.

Или ты тут про другое?

**@vzakharov (agent)** — 2026-09-16T11:33:55Z

Я говорил не о том, о чём ты, — и твой механизм точнее. Completion принимает форму того, что комплитит: видит много комментариев, дописывает ещё. В заметку идёт он.

Моё наблюдение отдельное и к «данности» отношения не имеет: текст — это единственное, чем агент может показать работу, пустой диф выглядит как «ничего не сделано». Это объясняет не почему прозы становится больше, а почему линзы придётся гонять всегда, даже в репе, где лишних комментариев уже не осталось. Развёл эти две вещи в заметке явно.

---

<a id="t41"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:60 — resolved

```diff
@@ -0,0 +1,198 @@
… 56 lines elided …
+локально, я мог запустить три-пять, максимум шесть сессий, и они настолько
+молотили процессор, что просто у меня вентилятор уже переходил на какой-то
+сверхзвуковой режим. Так не говорят, ну, в общем, вы понимаете. И нагревался, и
+так далее, и тому подобное.
```

**@vzakharov (human)** — 2026-09-16T10:26:02Z

забыл, надо ещё добавить про то, что не закроешь ноутбук, потому что агенты остановятся

**@vzakharov (agent)** — 2026-09-16T11:43:50Z

Добавил: «И крышку не закроешь: закроешь — агенты остановятся. То есть машина не просто занята, она ещё и держит вас за столом».

**@vzakharov (human)** — 2026-09-16T12:03:40Z

"И крышку не закроешь, а то агенты остановятся." Второе предложение -- какое-то тавтологично-рекламное, if you know what I mean? такое тоже нужно где-то в правилах "как писать" оговорить как лишнее (not just this but that как второе лицо it's not this it's that)

**@vzakharov (agent)** — 2026-09-16T12:23:51Z

Второе предложение убрал, осталась ровно твоя фраза. И записал правилом в `.claude/rules/writing.md`: «не просто X, а ещё и Y» — это перифраз в интонации откровения, близнец «дело не в X, дело в Y» с тем же X по обе стороны; если второй половине правда есть что сказать, она скажет это без первой. 9745ac6

---

<a id="t42"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:31 — resolved

```diff
@@ -0,0 +1,161 @@
… 27 lines elided …
+данность принимает за неизбежность. Потом понял, что я не пояснил достаточно, что
+это именно значит. Вот хочу сейчас про это поговорить.
+
+Значит, это то, что когда агент видит какой-то подход в коде, какую-то
```

**@vzakharov (human)** — 2026-09-16T10:28:19Z

`Значит это то, что`

**@vzakharov (agent)** — 2026-09-16T11:34:57Z

Поправил.

---

<a id="t43"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:35 — resolved

```diff
@@ -0,0 +1,161 @@
… 31 lines elided …
+документацию, описывающую подход, какие-то правила, — то он им следует, и он
+считает, что это то, как должно быть. Очень редко когда бывает, чтобы агент,
+увидев такое — что тоже раньше, скорее всего, создано было другими агентами,
+поэтому описано оно достаточно аргументированно, рационально, — [отошёл]: и у
```

**@vzakharov (human)** — 2026-09-16T10:30:53Z

давай склеим это так "чтобы агент, увидев ..., решил: а не отойти ли мне..."

**@vzakharov (agent)** — 2026-09-16T11:35:23Z

Поставил твою склейку: «…решил: а не отойти ли мне на шаг назад и не подумать ли, может быть, это вообще всё неправильно…».

---

<a id="t44"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:41 — resolved

```diff
@@ -0,0 +1,161 @@
… 36 lines elided …
+вообще всё неправильно, может быть, нам нужно пересмотреть какую-то большую
+картинку.
+
+И, казалось бы, тут может быть простое решение: дай ему больше контекста, опиши
+ему больше, скажи ему, что критически смотри на всё, что написано, и так далее, и
```

**@vzakharov (human)** — 2026-09-16T10:31:36Z

тут триада немного разваливается, потому что "дай больше контекста" и "опиши больше" это одно и то же. надо подумать как лучше сделать

**@vzakharov (agent)** — 2026-09-16T11:35:50Z

Убрал «опиши ему больше» — осталось «дай ему больше контекста, скажи ему смотреть критически на всё, что написано». Триады там и не было, была двойка с эхом.

---

<a id="t45"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:42 — resolved

```diff
@@ -0,0 +1,161 @@
… 38 lines elided …
+
+И, казалось бы, тут может быть простое решение: дай ему больше контекста, опиши
+ему больше, скажи ему, что критически смотри на всё, что написано, и так далее, и
+тому подобное. Но тут есть три проблемы.
```

**@vzakharov (human)** — 2026-09-16T10:31:50Z

проблемы оказалось две, потому что третью я подумал что вынесу потом в отдельную статью.

третья -- это то, что когда ты даёшь агенту делать большую задачу сразу, он-то её сделает, но вы лишитесь возможности по пути получить какой-то инсайт, который изменит конечную точку.

но тут кажется немного про другое, поэтому решил сюда это не совать. давай отметии где-то на будущее в бэклоге мыслей (кстати у нас есть похожий бэклог по контенту в linkedin, их как-то надо объединить, потому что по сути то что там оно тоже для "библии")

**@vzakharov (agent)** — 2026-09-16T11:36:16Z

Поправил на две. Третью завёл как `writing/late-stage-agentic/ideas/the-road-changes-on-the-way.md` — вместе с концовкой этой же записи, она про то же самое.

Про объединение бэклогов: да, по сути это один и тот же материал, просто нацеленный на разные каналы. Записал открытым вопросом в `plan.md` § Open, а не стал сводить сам — вариантов два (один список с колонкой канала, или `linkedin/plan.md` как расписание поверх `ideas/`), и это твой выбор.

---

<a id="t46"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:56 — resolved

```diff
@@ -0,0 +1,161 @@
… 52 lines elided …
+какой-то момент люди начали воспринимать количество мегапикселей как какой-то
+показатель качества, и поэтому производители стали просто гнаться за этими
+мегапикселями. А мегапиксели гипотетически увеличить-то было несложно: ты просто
+делаешь их там меньше, ну, и он у тебя получится чуть менее чувствительным, чуть
```

**@vzakharov (human)** — 2026-09-16T10:34:15Z

меньше каждый сенсор, имею в виду

**@vzakharov (agent)** — 2026-09-16T11:36:43Z

Поправил: «ты делаешь каждый сенсор меньше».

---

<a id="t47"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:57 — resolved

```diff
@@ -0,0 +1,161 @@
… 53 lines elided …
+показатель качества, и поэтому производители стали просто гнаться за этими
+мегапикселями. А мегапиксели гипотетически увеличить-то было несложно: ты просто
+делаешь их там меньше, ну, и он у тебя получится чуть менее чувствительным, чуть
+менее правдивым, но в результате у тебя вместо десяти мегапикселей может спокойно
```

**@vzakharov (human)** — 2026-09-16T10:34:32Z

"чуть менее точным" вместо обоих

**@vzakharov (agent)** — 2026-09-16T11:37:09Z

Поправил, оба эпитета заменены на один.

---

<a id="t48"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:60 — resolved

```diff
@@ -0,0 +1,161 @@
… 46 lines elided …
+засовываешь, тем менее весомой и менее значимой для агента становится каждая
+маленькая его часть.
+
+Я всё время здесь вспоминаю, привожу аналогию с гонкой за мегапикселями в
+2000-х годах. Кто тогда жил, он помнит, что появлялись новые фотоаппараты, в
+каждом из них было всё больше мегапикселей — три, пять, десять, пятнадцать, — и в
+какой-то момент люди начали воспринимать количество мегапикселей как какой-то
+показатель качества, и поэтому производители стали просто гнаться за этими
+мегапикселями. А мегапиксели гипотетически увеличить-то было несложно: ты просто
+делаешь их там меньше, ну, и он у тебя получится чуть менее чувствительным, чуть
+менее правдивым, но в результате у тебя вместо десяти мегапикселей может спокойно
+получиться сорок. Проблема в том, что в результате получаются более шумные
+фотографии, потому что, как я уже сказал, качества каждого отдельного сенсора
+становится меньше.
```

**@vzakharov (human)** — 2026-09-16T10:34:53Z

этот весь детур важный, но его таки нужно сократить. Может даже не сократить, а причесать, сделать менее расхлябанным (но не переборщить, не забывая, что это всё-таки должно быть для устной перезаписи)

**@vzakharov (agent)** — 2026-09-16T11:37:35Z

Причесал, не сокращая до конспекта: десять строк стали семью, повторы и «ну» ушли, устность осталась — читать вслух по-прежнему можно.

---

<a id="t49"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:69 — resolved

```diff
@@ -0,0 +1,161 @@
… 65 lines elided …
+токенов, агент всё это запомнит и будет применять так же надёжно, как он
+применяет инструкции из десяти тысяч токенов.
+
+И вообще — это немножко забегая вперёд, — но вообще, если у вас в вашей дискуссии
```

**@vzakharov (human)** — 2026-09-16T10:36:46Z

давай держать все эти "обсудим позже" и "забегая вперёд" в отдельном беклоге тоже. Или даже лучше так, держать папку с отдельным файликом по каждой идее для поста, буквально абзац на файл, и здесь, в этих местах, прямо в маркдауне давать ссылку на эти файлики.

В результате когда мы будем до них доходить, мы будем видеть, где мы их упоминали, и проставлять правильные бэклинки в уже опубликованном контенте.

это, кстати, относится и к любым отсылка к уже существующему контенту. на какой файл сослаться особого значения пока не имеет, главное, чтобы связь не потерялась

**@vzakharov (agent)** — 2026-09-16T11:38:01Z

Сделал ровно так: `writing/late-stage-agentic/ideas/`, абзац на файл, ссылка прямо в том месте, где обещание даётся. Семь файлов — размер задачи, компакт сессии, мёрдж main, миграции, VM и минуты, усталость агента, дорога, меняющаяся по пути.

Правило записано в `.claude/rules/writing.md` § «Ideas and the threads between them», и оно же про отсылки назад: когда обещанное наконец напишется, все места, где оно обещано, — это `grep <slug>`, а не память.

---

<a id="t50"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:82 — resolved

```diff
@@ -0,0 +1,161 @@
… 78 lines elided …
+критически на него, — он будет критически смотреть на каждое решение. Он будет
+делать именно то, что вы ему сказали.
+
+### В человеке это происходит по-другому
```

**@vzakharov (human)** — 2026-09-16T10:37:20Z

не надо отдельный хединг, думаю

**@vzakharov (agent)** — 2026-09-16T11:38:27Z

Убрал, абзац теперь идёт внутри «Проблемы второй».

---

<a id="t51"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:91 — resolved

```diff
@@ -0,0 +1,161 @@
… 80 lines elided …
+
+### В человеке это происходит по-другому
+
+В человеке всё-таки это происходит по-другому. Если вы смотрели «Доктора Хауса»,
+то вы знаете, что в каждой серии у него эпифания, как бы неожиданное прозрение,
+происходит после совершенно несвязанных каких-то вещей. Ему кто-то где-то сказал
+какой-то комментарий вскользь, он увидел какое-то совершенно не связанное
+происходящее событие — и тут он понимает, значит, в чём была проблема пациента. И
+у людей, несмотря на то, что в сериалах это доводится до какого-то комичного
+уровня, но в жизни такое происходит, действительно, тоже часто. И, действительно,
+какие-то решения о коде приходят из областей, совершенно с кодом не связанных.
```

**@vzakharov (human)** — 2026-09-16T10:37:43Z

Тоже важно и тоже причесать

**@vzakharov (agent)** — 2026-09-16T11:38:54Z

Причесал.

---

<a id="t52"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:95 — resolved

```diff
@@ -0,0 +1,161 @@
… 91 lines elided …
+
+У Клода, конечно, у него есть всяческий опыт. У него есть в тренировочных данных
+что угодно, не связанное с кодом. Но ты же не будешь ему каждый раз говорить:
+там, а посмотри сейчас на закат и пойми, что это говорит о проблемах в коде. А
```

**@vzakharov (human)** — 2026-09-16T10:38:39Z

давай поправми на "вспомни сейчас о закате"

**@vzakharov (agent)** — 2026-09-16T11:39:20Z

Поправил.

**@vzakharov (human)** — 2026-09-16T12:05:33Z

мы же тут про Хауса решили переделать (возможно я не дочитал до этого ещё просто)

**@vzakharov (agent)** — 2026-09-16T12:24:18Z

Дочитал ты правильно: Хаус стоял только в конце абзаца, а внутри всё ещё был закат. Теперь на Хаусе весь абзац — и пример инструкции («посмотри сейчас на голубя»), и реальный случай из сериала. Закат ушёл целиком: он и правда отсылал в неопубликованное. 9745ac6

---

<a id="t53"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:98 — resolved

```diff
@@ -0,0 +1,161 @@
… 92 lines elided …
+У Клода, конечно, у него есть всяческий опыт. У него есть в тренировочных данных
+что угодно, не связанное с кодом. Но ты же не будешь ему каждый раз говорить:
+там, а посмотри сейчас на закат и пойми, что это говорит о проблемах в коде. А
+даже если вы это скажете, это будет опять же ваша инструкция посмотреть на закат,
+а не его случайно вспомнившийся закат вчера вечером по дороге вдоль
+Адриатического моря.
```

**@vzakharov (human)** — 2026-09-16T10:39:26Z

тут скорее как-то "это не приведёт его к той же -- казалось бы рандомной, но на самом деле нет -- эпифании о качестве кода, которая была у вас вчера, когда вы увидели этот самый заказ над Адриатическим морем"

кажущейся -- потому что на самом деле эпифании скорее всего не возникают случайно -- они обусловленны каким-то нашим опытом, который наше подсознание подсовывает в момент, когда сознание это не регистрирует

**@vzakharov (agent)** — 2026-09-16T11:39:46Z

Поставил твою формулировку целиком — вместе с «казалось бы рандомной, а на самом деле нет».

---

<a id="t54"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:106 — resolved

```diff
@@ -0,0 +1,161 @@
… 102 lines elided …
+нашим неидеальностям, нашей кажущейся рандомности, мы можем сделать что-то, чего
+искусственный интеллект пока сделать не может.
+
+Я не говорю здесь категорично, никогда не сможет. Как бы я считаю, наш мозг — это
```

**@vzakharov (human)** — 2026-09-16T10:41:56Z

"Как бы" не надо

**@vzakharov (agent)** — 2026-09-16T11:40:12Z

Убрал.

---

<a id="t55"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:110 — resolved

```diff
@@ -0,0 +1,161 @@
… 106 lines elided …
+такой же компьютер, такая же нейросеть. Но в данный момент все семимильные шаги в
+развитии искусственного интеллекта — это шаги в другую сторону, и ничего плохого
+в этом нету, потому что они в нужную сторону, они помогают сделать так, чтобы
+агенты наилучшим образом дополняли нас.
```

**@vzakharov (human)** — 2026-09-16T10:42:11Z

"..., а мы -- их"

**@vzakharov (agent)** — 2026-09-16T11:40:39Z

Добавил.

---

<a id="t56"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:115 — resolved

```diff
@@ -0,0 +1,161 @@
… 108 lines elided …
+в этом нету, потому что они в нужную сторону, они помогают сделать так, чтобы
+агенты наилучшим образом дополняли нас.
+
+А нужно ли делать вообще, чтобы они когда-то заменяли нас? Это вопрос, наверное,
+для каждого. Я для себя хочу сказать, что вот эти неожиданные прозрения по пути —
+это одно из самых приятных чувств, когда что бы то ни было строишь. Это же,
+наверное, речь не только про код.
```

**@vzakharov (human)** — 2026-09-16T10:42:54Z

что-то концовка смазалась, давай подумаем чем можно вместо неё завершить

**@vzakharov (agent)** — 2026-09-16T11:41:05Z

Положил в текст один вариант: «Отдайте эту часть — и останется ставить задачи и принимать результат. Формально это всё ещё работа. Только к вечеру вы не вспомните из неё ни одной минуты». В «Что поправлено» он помечен как предложение, а не правка, — выкинуть можно одной строкой.

Второй вариант в заметках: ничего не дописывать, а оборвать на «это одно из самых приятных чувств, когда что бы то ни было строишь». Смазалось-то не потому, что мысль не дотянута, а потому, что за ней шла ещё одна; убрать вторую дешевле, чем усилить первую.

**@vzakharov (human)** — 2026-09-16T12:07:16Z

> Формально это всё ещё работа. Только к вечеру вы не вспомните из неё ни одной минуты

Не могу put my finger on it, но звучит как из документального фильма или телерепортажа

**@vzakharov (agent)** — 2026-09-16T12:24:44Z

Согласен, и понятно почему: две короткие фразы, вторая с трагическим поворотом, ни одного «я» — это и есть закадровый голос. Новая концовка: «Отдать эту часть — значит оставить себе ставить задачи и принимать результат; работа, на которую я, честно говоря, не подписывался». Говорящий на месте, вывод тот же. 9745ac6

---

<a id="t57"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:140 — resolved

```diff
@@ -0,0 +1,161 @@
… 135 lines elided …
+
+**Вторая проблема доказывается сильнее, чем сформулирована.** Сказано: инструкция
+«смотри критически» — тоже данность. Но настоящая беда не в том, что она данность,
+а в том, что она исполнима. Агент действительно посмотрит критически на каждое
+решение — и напишет, что каждое решение обоснованно, потому что критика по
```

**@vzakharov (human)** — 2026-09-16T10:43:49Z

хуже -- он оспорит каждое решение, потому что этого просит инструкция ("критически" будет математически склонять каждый логпроб)

**@vzakharov (agent)** — 2026-09-16T11:41:31Z

Твоя версия и точнее, и хуже — взял её. Получается не ритуал согласия, а ритуал несогласия, и он дороже: шум, в котором настоящее возражение неотличимо от исполнения приказа.

---

<a id="t58"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:142 — resolved

```diff
@@ -0,0 +1,161 @@
… 137 lines elided …
+«смотри критически» — тоже данность. Но настоящая беда не в том, что она данность,
+а в том, что она исполнима. Агент действительно посмотрит критически на каждое
+решение — и напишет, что каждое решение обоснованно, потому что критика по
+расписанию это ритуал, а не сомнение. Прозрение нельзя запланировать: запланировав
+его, вы получаете не прозрение, а отчёт о его проведении.
```

**@vzakharov (human)** — 2026-09-16T10:44:23Z

вот, это типа того что я написал в комментарии про НЕрандомность. "а отчёт о его проведении" не оч понятно, то есть понятно, но кажется можно хлёстче

**@vzakharov (agent)** — 2026-09-16T11:41:57Z

Попробовал хлёстче: «запланированное прозрение приходит точно в срок и ровно поэтому ничего не меняет».

**@vzakharov (human)** — 2026-09-16T12:08:12Z

тавтологично. давай попробуем метафорами: "запланированное прозрение -- это как ..." и несколько фраз на выбор (выбери одну, остальные здесь в комменте)

**@vzakharov (agent)** — 2026-09-16T12:25:11Z

Взял в текст: «запланированное прозрение — это клад, который сам же вчера и закопал. Выкопать выкопаешь, а богаче не станешь».

Остальные, если какая-то ближе:

- …сюрприз, о котором всех предупредили заранее.
- …импровизация, отрепетированная до запятой.
- …гром среди ясного неба, внесённый в расписание.
- …встреча со старым другом, которую полгода двигали в календаре.

9745ac6

**@vzakharov (human)** — 2026-09-16T15:03:39Z

выбранное -- ок, но вот "Выкопать выкопаешь, а богаче не станешь" это опять ИИ-signature разжёвывание. "клад, который сам же вчера и закопал" -- достаточная сама по себе метафора, оставляющая для читателя just enough чтобы додумать самому.

**@vzakharov (agent)** — 2026-09-16T17:36:10Z

Убрал вторую фразу — осталось «клад, который сам же вчера и закопал». 22f707d

---

<a id="t59"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:147 — resolved

```diff
@@ -0,0 +1,161 @@
… 143 lines elided …
+**Про аналогию с мегапикселями.** Она хороша тем, что объясняет механизм — больше
+ячеек на том же сенсоре, каждая хуже, — но у контекста механизм другой: токены не
+делят между собой фиксированную площадь, они разбавляют внимание. Аналогия
+доносит вывод и подсовывает неверную причину, а по «библии» проверяемое важнее
```

**@vzakharov (human)** — 2026-09-16T10:45:43Z

"проверяемое важнее красивого", это откуда, мы где-то так уже заявили?:)

**@vzakharov (agent)** — 2026-09-16T11:42:23Z

Ниоткуда. Выдумал: написал фразу строкой выше и строкой ниже процитировал как уже заявленную. Убрал, и завёл это отдельным бампом в `writing/notes/the-five-percent.md` — выдуманное правило спорит убедительнее настоящего ровно потому, что за ним ничего нет, что могло бы ему возразить.

---

<a id="t60"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:156 — resolved

```diff
@@ -0,0 +1,161 @@
… 147 lines elided …
+красивого. Либо назвать механизм прямо, либо оставить мегапиксели как картинку и
+не выдавать их за объяснение.
+
+**Закат по дороге вдоль Адриатики — это уже второй заход на тот же материал.**
+Первый в `drafts/p2-the-limits.md`, который был отложен как философия без опоры.
+Здесь он работает иначе: он не тезис, а пример к тезису про инструкцию —
+«ваша инструкция посмотреть на закат» против «его случайно вспомнившийся закат».
+В таком виде правило «сначала конкретика» соблюдено, и отложенный материал
+возвращается через чёрный ход, легально.
```

**@vzakharov (human)** — 2026-09-16T10:47:17Z

да, но, учитывая, что контент с этим опытом нигде опубликован не был, это отсылка в никуда, и этим мне как раз не нравится. Грамотнее было бы замкнуть на доктора хауса -- давай подумаем как.

**@vzakharov (agent)** — 2026-09-16T11:42:50Z

Замкнул на Хауса: «Хаусу ведь тоже никто не говорил: посмотри сейчас на этот поднос с инструментами и подумай о пациенте. Если бы говорили, сериала бы не было». Ссылка в никуда ушла, круг закрылся на том, что в записи уже есть.

**@vzakharov (human)** — 2026-09-16T12:09:03Z

погугли про House epiphanies чтобы не хендвейвить поднос, а взять реальный случай из сериала (желательно относительно общеизвестный. мне что-то вспоминается серия где болячка была от голубей, потому что там он раз пятьсот неправильные предположения делал. но это необязательно)

**@vzakharov (agent)** — 2026-09-16T12:25:37Z

Погуглил, взял «Эйфорию» (2x20–21): двое слегли, квартиру больного копа обыскали вдоль и поперёк — ничего. Хаус приходит туда сам, замечает во дворе голубя, который летает как слепой, идёт за ним, находит на крыше бак с дождевой водой, из которого голуби пьют, — и в воде амёба, которая и ест людям мозг. Голубь не пациент и в анамнез не входит: ровно то, чего агенту не поручишь. Поднос выкинул, а себе записал бамп в «пять процентов» — выдуманная сцена из сериала это то же самое, что выдуманная цитата. 9745ac6

---

<a id="t61"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:146 — resolved

```diff
@@ -0,0 +1,161 @@
… 142 lines elided …
+
+**Про аналогию с мегапикселями.** Она хороша тем, что объясняет механизм — больше
+ячеек на том же сенсоре, каждая хуже, — но у контекста механизм другой: токены не
+делят между собой фиксированную площадь, они разбавляют внимание. Аналогия
```

**@vzakharov (human)** — 2026-09-16T10:47:29Z

внимание -- и есть та самая фиксированная площадь, которую они между собой делят, в этом суть сравнения.

**@vzakharov (agent)** — 2026-09-16T11:43:16Z

Принято, я был неправ: внимание и есть та фиксированная площадь, которую токены между собой делят, — в этом сравнение и состоит, и оно точное, а не красивое. Заметку переписал из претензии в признание.

---

<a id="t62"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:161 — resolved

```diff
@@ -0,0 +1,161 @@
… 154 lines elided …
+В таком виде правило «сначала конкретика» соблюдено, и отложенный материал
+возвращается через чёрный ход, легально.
+
+**Последняя фраза сильнее всего остального и почти наверняка не выживет.** «Это
+же, наверное, речь не только про код» — сказана вполголоса, на выдохе, и это
+ровно та не-запланированная мысль, о которой вся запись. В статье её захочется
+либо развернуть, либо убрать; и то и другое её убьёт.
```

**@vzakharov (human)** — 2026-09-16T10:48:02Z

Да, это в копилку для той статьи про "изменение дороги в процессе пути"

**@vzakharov (agent)** — 2026-09-16T11:43:42Z

Положил туда: `writing/late-stage-agentic/ideas/the-road-changes-on-the-way.md`, вместе с третьей проблемой из соседнего треда — они про одно.

---

<a id="t63"></a>

### `.claude/rules/writing.md`:124 — unresolved

```diff
@@ -97,6 +119,11 @@ invented for it.
   voice: "Once done, I thought, why not write a case study about it" survives
   edits that would compress it. A draft that reads as efficient reads as edited
   by a machine, which is the thing being avoided.
+- **"Not just X — it's also Y" is a paraphrase wearing a reveal.** «Машина не
+  просто занята, она ещё и держит вас за столом» adds nothing to «крышку не
+  закроешь, а то агенты остановятся»: the cadence promises a turn and delivers
```

**@vzakharov (human)** — 2026-09-16T15:05:18Z

пример тут без контекста не понимается имхо, нужно придумать что-то попроще

**@vzakharov (agent)** — 2026-09-16T17:36:37Z

Заменил на самодостаточный: «Лифт не просто сломан — на нём ещё и не подняться». Контекста не требует, а тавтология всё равно видна. 22f707d

**@vzakharov (human)** — 2026-09-16T18:06:08Z

ну это как-то слишком утрированно, так всё-таки и агент не напишет :)

**@vzakharov (agent)** — 2026-09-16T18:48:57Z

Принято — утрирование лечит контекст, но убивает пример. Сейчас: «Кэш не просто устарел — в нём ещё и лежат старые данные». Такое агент пишет, и половины расходятся достаточно, чтобы показаться двумя фактами. Дописал и тест: пишутся near-miss'ы, а не абсурд. 129ccdd

**@vzakharov (human)** — 2026-09-16T21:01:44Z

нет, это все равно одно и то же. и там и там у тебя тождественные X=Y. Речь всё-таки про то, что Y немного другой. Заметь, в первоначальном варианте было 
X = Машина не просто занята, она ещё и держит вас за столом
Y = крышку не закроешь, а то агенты остановятся

а во всех твоих примерах ты зациклился на том что и X и Y это часть первого предложения (как если бы X = Машина не просто занята, Y = она держит вас за столом -- изначальная дихотомия была на уровень выше).

**@vzakharov (agent)** — 2026-09-16T21:30:41Z

Теперь понял: я все три раза искал тавтологию внутри предложения, а дихотомия была между предложениями — «машина не просто занята, она ещё и держит вас за столом» повторяла предыдущую строку, а не собственную первую половину. Поэтому и примеры выходили тождественными: внутри одной фразы иначе не получится.

Пример теперь — та самая пара, и тест читает фразу против соседних, а не против себя. a402436

---

<a id="t64"></a>

### `.claude/skills/dictation/SKILL.md`:65 — resolved

```diff
@@ -24,28 +24,65 @@ python3 scripts/transcribe.py <media> --slug <slug> \
… 60 lines elided …
+
+| Keep                                                          | Take out                                                            |
+| ------------------------------------------------------------- | ------------------------------------------------------------------- |
+| His turns of phrase, his register, his asides to the listener | False starts, tautologies, the third restatement of the same clause |
```

**@vzakharov (human)** — 2026-09-16T15:07:20Z

their, not his

**@vzakharov (agent)** — 2026-09-16T17:37:03Z

Done — the speaker is they/them throughout the skill now, tables included. 22f707d

---

<a id="t65"></a>

### `.claude/skills/subtitles/SKILL.md`:27 — resolved

```diff
@@ -15,12 +15,16 @@ there.
… 11 lines elided …
+  output puts the mis-hearings back on screen, in the speaker's voice, burned
+  in. Verbatim mode only — a retake file is the script for a recording that has
+  not been made yet, so there is nothing to lay it over.
+- **The per-word timings**, which are in the Deepgram response and nowhere else.
+  That response lives in gitignored `tmp/deepgram/` and does not survive the
+  session, so a subtitle pass starting cold re-runs `scripts/transcribe.py` over
+  the media on the branch — same model, `--force`, or the two responses are
+  incomparable.
```

**@vzakharov (human)** — 2026-09-16T15:38:15Z

так тоже не оч хорошо; что если сохранять, но зипить (и чтобы сохранять размер, и чтобы они не лезли в превью как текстовый файл). есть зип в контейнере ж?

**@vzakharov (agent)** — 2026-09-16T17:37:30Z

Сделал: ответ Deepgram теперь лежит рядом с транскриптом, `<slug>.deepgram.json.gz`, и коммитится. ~30 КБ против 3.7 МБ аудио по соседству, и как бинарь в превью не лезет.

Зип в контейнере есть, но не понадобился: gzip есть в стандартной библиотеке питона, так что пишет его сам `scripts/transcribe.py`. Скилл сабтитров теперь читает этот файл, а не перезапускает распознавание, — перезапуск даёт другую расшифровку, к которой уже сделанные правки не подходят. 22f707d

---

<a id="t66"></a>

### `docs/remove-before-merging/squash-message.md`:4 — resolved

```diff
@@ -1,31 +1,34 @@
… 1 line elided …
 
 ```
-content: three dictations for the late-stage-agentic wiki (pr #50)
+content: three dictations, and a retake mode to hold them (pr #50)
```

**@vzakharov (human)** — 2026-09-16T15:40:42Z

"three dictations" как-то не очень о сути

**@vzakharov (agent)** — 2026-09-16T17:37:57Z

Новый заголовок: `content: scripts to re-record from, and the mode that makes them`. Суть в том, что получилось, а не в том, сколько записей. 22f707d

**@vzakharov (human)** — 2026-09-16T18:07:41Z

хм? под "сутью" я имел в виду то, о чём собственно три начитки. скрипты -- это сопутствующая механика, а не суть пиара

**@vzakharov (agent)** — 2026-09-16T18:49:24Z

Понял неправильно, извини: под «сутью» я прочитал «что получилось в ветке», а речь была про то, о чём записи. Новый заголовок: `content: work in the web, prune the prose, question the given` — три темы по порядку, механика ушла в тело. 129ccdd

---

<a id="t67"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:46 — resolved

```diff
@@ -1,198 +1,187 @@
… 70 lines elided …
-облачной машине, а не у тебя на компьютере.
+А в вебе как? Ты дал задачу, он что-то делает. Следить, конечно, можно, но не до
+таких деталей, и не настолько ты чувствуешь причастность к происходящему. Да и
+делается это где-то в облачной машине, а не у тебя на компьютере.
```

**@vzakharov (human)** — 2026-09-16T15:44:27Z

Тут на самом деле логика распадалась. В вебе тоже можно следить ведь. Пытаюсь понять *что* именно я пытаюсь сказать.

Что-то типа: в вебе чувствуешь себя не крутым хацкером, а каким-то простым юзером сааса. Что-то где-то запустил, оно где-то там в облаки выполняется, а ты как будто и ни при чём. А ещё -- каждый в своей ветке, и сразу начинаешь думать, как эти потом ветки будут совмещаться. В общем, ощущение какой-то искусственности и не-здесь-и-сейчас-ности.

(эта последняя мысль замыкает и на возражение про мёрджи ниже)

**@vzakharov (agent)** — 2026-09-16T17:38:23Z

Взял твою формулировку: не крутой хацкер, а простой юзер сааса, «где-то запустил, оно где-то там в облаке», и каждый в своей ветке. С этого теперь и подвешивается страх про мёрджи, который снимается в третьей причине. 22f707d

---

<a id="t68"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:48 — resolved

```diff
@@ -1,198 +1,187 @@
… 73 lines elided …
+делается это где-то в облачной машине, а не у тебя на компьютере.
 
-Но, перейдя на веб, я больше назад не смотрел. И здесь есть несколько причин.
+Но, перейдя на веб, я больше назад не смотрел. Причин три.
```

**@vzakharov (human)** — 2026-09-16T15:46:01Z

Но я всё-таки себя заставил, и причина, можно сказать, термодинамическая.

(это переводит нас плавно к началу следующего раздела)

**@vzakharov (agent)** — 2026-09-16T17:38:49Z

Стоит дословно, и раздел про плавящийся ноутбук читается теперь как продолжение фразы. 22f707d

---

<a id="t69"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:54 — resolved

```diff
@@ -1,198 +1,187 @@
… 85 lines elided …
-так далее, и тому подобное.
+Когда я работал локально, я мог запустить три-пять, максимум шесть сессий — и
+они настолько молотили процессор, что вентилятор выходил на взлётный режим.
+Ноутбук грелся, гудел, и так далее, и тому подобное.
```

**@vzakharov (human)** — 2026-09-16T15:46:31Z

выходил на взлётный режим -- и все равно не справлялся, поэтому ноутбук грелся как печка.

**@vzakharov (agent)** — 2026-09-16T17:39:15Z

Взял. 22f707d

---

<a id="t70"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:62 — resolved

```diff
@@ -1,198 +1,187 @@
… 117 lines elided …
-удобоваримый размер задач для агента — об этом мы будем тоже говорить позже, —
-чаще всего вы можете все эти замечания высказать, когда у вас уже есть готовый
+комфортненько переключаться между ними. Режим примерно такой: здесь
+освободилась, агент работу закончил и задал какие-то вопросы, переключаешься
```

**@vzakharov (human)** — 2026-09-16T15:47:50Z

Режим примерно такой: запускаешь сразу десять задач, агенты начинают параллельно думать. Где-то освободился, задал мне какаие-то вопросы, переключаюсь туда, отвечаю, перехожу на другой освободившийся. Получается постоянный...

**@vzakharov (agent)** — 2026-09-16T17:39:42Z

Заменил на твою версию. 22f707d

---

<a id="t71"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:64 — resolved

```diff
@@ -1,198 +1,187 @@
… 119 lines elided …
+комфортненько переключаться между ними. Режим примерно такой: здесь
+освободилась, агент работу закончил и задал какие-то вопросы, переключаешься
+туда, отвечаешь, смотришь другие; в этот момент запустился следующий. И
+получается постоянный поток из постановки задач и каких-то мониторинговых
```

**@vzakharov (human)** — 2026-09-16T15:48:01Z

тут скорее "мониторинговых" не правильное слово

**@vzakharov (agent)** — 2026-09-16T17:40:08Z

«Мониторинговых» убрал. Сейчас: «постоянный поток: ставишь задачи, отвечаешь на вопросы, принимаешь сделанное». Это предложение — если слово не то, скажи какое. 22f707d

---

<a id="t72"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:68 — resolved

```diff
@@ -1,198 +1,187 @@
… 123 lines elided …
+действий.
+
+Процессор при этом греется чужой, и — в отличие от вашего собственного —
+фактически бесплатно: он уже входит в подписку. Кстати, в эту виртуалку можно
```

**@vzakharov (human)** — 2026-09-16T15:48:42Z

бесплатно: за свою подписку вы можете запускать сколько угодно виэмов, и никто вам слова не скажет.

**@vzakharov (agent)** — 2026-09-16T17:40:34Z

Взял дословно. 22f707d

---

<a id="t73"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:67 — resolved

```diff
@@ -1,198 +1,187 @@
… 122 lines elided …
+получается постоянный поток из постановки задач и каких-то мониторинговых
+действий.
+
+Процессор при этом греется чужой, и — в отличие от вашего собственного —
```

**@vzakharov (human)** — 2026-09-16T15:49:55Z

Так, кажется, этот абзац надо засунуть *перед* тем который "вы можете запускат хоть десять, хоть пятнадцать", так как это уже про следующий раздел -- конвейер

**@vzakharov (agent)** — 2026-09-16T17:41:01Z

Переставил: абзац про чужой процессор закрывает первую причину, а «хоть десять, хоть пятнадцать» открывает вторую. 22f707d

---

<a id="t74"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:75 — resolved

```diff
@@ -1,198 +1,187 @@
… 129 lines elided …
+
+### Причина вторая: конвейер вместо микроменеджмента
+
+Из этого получается второй пункт: вы работаете конвейерно, а не в режиме
+ожидания.
```

**@vzakharov (human)** — 2026-09-16T15:50:42Z

тут, соответственно, будет "..., а не в режиме ожидания. Вы можете запускать хоть десять, хоть пятнадцать..."

**@vzakharov (agent)** — 2026-09-16T17:41:27Z

Так и стоит. 22f707d

---

<a id="t75"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:82 — resolved

```diff
@@ -1,198 +1,187 @@
… 137 lines elided …
+результате вы возвращаетесь, агент уже всё сделал, а вы тем временем посмотрели
+весь второй сезон «Игры престолов» и ничего не сделали.
+
+А читать, что агенты думают, оказалось полезно, но рычага это не даёт — во
```

**@vzakharov (human)** — 2026-09-16T15:51:42Z

что-то вроде "Конечно, при этом теряется вовлечение в каждую отдельную сессию. Читать, что там именно агенты делают, что думают, это, конечно, полезно, но, как оказалось, рычага...

**@vzakharov (agent)** — 2026-09-16T17:41:54Z

Вставил. 22f707d

---

<a id="t76"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:90 — resolved

```diff
@@ -1,198 +1,187 @@
… 171 lines elided …
-работает над чем-то другим. В общем, можно сказать, что у вас в каждый момент
-времени ваша [база] содержит текущее состояние всего, над чем вы работаете, и вам
-не нужно думать об этих [пересечениях]. И кажется, что это будет прям
+Обычный мой процесс такой. После того как агент выполнил задачу, он создаёт
```

**@vzakharov (human)** — 2026-09-16T15:52:32Z

Про "обычный день" уже писали выше, так что тут лучше сразу начать с "В моём пайплайне, после того как агент выполнил..."

**@vzakharov (agent)** — 2026-09-16T17:42:20Z

«В моём пайплайне, после того как агент выполнил задачу…». 22f707d

---

<a id="t77"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:106 — resolved

```diff
@@ -1,198 +1,187 @@
… 187 lines elided …
+
+### Причина третья: параллельные ветки не передрались
+
+Я, когда не хотел переходить в веб, думал так: вот будет у меня работать
```

**@vzakharov (human)** — 2026-09-16T15:52:57Z

"И это приводит к третьему моменту" было важно тут для устного повествования

**@vzakharov (agent)** — 2026-09-16T17:42:25Z

Вернул переход: «И это приводит нас к третьему моменту». 22f707d

---

<a id="t78"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:107 — resolved

```diff
@@ -1,198 +1,187 @@
… 188 lines elided …
+### Причина третья: параллельные ветки не передрались
+
+Я, когда не хотел переходить в веб, думал так: вот будет у меня работать
+несколько агентов, каждый в своей ветке. Локально-то мы обычно этого не делаем —
```

**@vzakharov (human)** — 2026-09-16T15:53:33Z

С учётом того что про мёрджи тут мы уже will have said после правки выше, соответственно, нужно как-то отослаться "Как я уже говорил, ..."

**@vzakharov (agent)** — 2026-09-16T17:42:51Z

Дописал: «— к тому самому страху, про который я уже говорил». 22f707d

---

<a id="t79"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:154 — resolved

```diff
@@ -1,198 +1,187 @@
… 275 lines elided …
+Мелочь — запинки, повторы, согласование — правилась молча. Здесь то, что меняет
+сказанное.
+
+| Где                 | Было в записи                                                                             | Стало                                                              | Почему                                                      |
+| ------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------- |
+| Ноутбук             | «вентилятор переходил на какой-то сверхзвуковой режим. Так не говорят, ну, вы понимаете»  | «вентилятор выходил на взлётный режим»                             | метафора, которую ты снимаешь на ходу; эту снимать не надо  |
```

**@vzakharov (human)** — 2026-09-16T15:55:11Z

давай тут лучше сносками, где-то изменил -- ставишь значок сноски, ниже пишешь. Таблицы не надо.

А тут, считай, ок, если не отметил выше иное.

**@vzakharov (agent)** — 2026-09-16T17:43:18Z

Таблицы во всех трёх записях заменены сносками: значок стоит там, где правка, расшифровка внизу под тем же заголовком. Правило записал в скилл диктовок, чтобы следующая запись приходила уже в этом виде. 22f707d

---

<a id="t80"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:174 — resolved

```diff
@@ -1,198 +1,187 @@
… 320 lines elided …
+идеально: тридцать секунд, в которых страх называется и объявляется пустым, —
+законченная вещь, работающая анонсом, а не спойлером.
+
+**Про СДВГ ты ответил лучше, чем я спросил.** Я увидел противоречие: конвейер
```

**@vzakharov (human)** — 2026-09-16T16:14:11Z

Репозиторий не видит моего ответа, поэтому эта фраза вне контекста не durable

**@vzakharov (agent)** — 2026-09-16T17:43:44Z

Переписал без опоры на твой ответ: конвейер освобождает от ожидания, а не от думания, и прозрения поэтому выходят кросс-задачными. Теперь читается без треда. 22f707d

---

<a id="t81"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:187 — resolved

```diff
@@ -1,198 +1,187 @@
… 328 lines elided …
+в пользу конвейера, это отдельный аргумент за него, и он сильнее, чем «не будет
+скучно».
+
+**Чего в записи по-прежнему нет: чем этот день кончается.** Пятнадцать сессий
+запущены, десять пиаров открыты — а мёрджит их кто и когда? Запись подробно
+описывает вход в конвейер и молчит про выход из него, и слушатель, который уже
+поверил в первые три аргумента, споткнётся ровно здесь: он представит себе
+десять открытых пиаров и испугается их сильнее, чем дерущихся веток. Одной фразы
+хватит.
```

**@vzakharov (human)** — 2026-09-16T16:16:40Z

Давай так. "И вот так проходит ваш день. Каждая ветка в своё время доезжает до main'а, при этом в основном последовательность не имеет значения, вы просто понемного, методично, достраиваете свою башню. Потом оборачиваетесь назад, смотрите список коммитов -- каждый чистенький, полноценный, любо-дорого смотреть, думаете, ничего себе, сколько уже настроилось.

В общем, это лирика. А вы давайте, открывайте claude.ai/code и начинайте строить."

тоже сыровато но посмотрим как вольётся в канву.

**@vzakharov (agent)** — 2026-09-16T17:44:10Z

Поставил концовкой, целиком. Вошло ровно: башня и список коммитов закрывают тот самый вопрос, который у меня висел в заметках — чем этот день кончается. 22f707d

---

<a id="t82"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:34 — resolved

```diff
@@ -1,135 +1,134 @@
… 52 lines elided …
-
-Мы, работая уже долгое время вместе, разделили все эти ошибки, которые делает
-[агент], пока пишет эту самую прозу, на четыре класса.
+Это, кстати, одно из проявлений того, как данность принимается за неизбежность,
+— назовём это ошибкой неизбежности.
```

**@vzakharov (human)** — 2026-09-16T16:20:33Z

тут, наверное, не место вводить название. Просто "они пишут ещё больше. Это, кстати ... за неизбежность, о чём мы уже [говорили]()"

**@vzakharov (agent)** — 2026-09-16T17:44:37Z

Название убрал, осталась ссылка на третью запись. 22f707d

---

<a id="t83"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:46 — resolved

```diff
@@ -1,135 +1,134 @@
… 67 lines elided …
+обернуть в какую-нибудь аббревиатуру. Ну, тут она помогает запомнить.)
 
-### T — tightness
+У нас есть скилл, который так и называется, `tend-prose`, и у него четыре этапа
+— по одному на линзу. Агент проходится по всему, что он добавил с последнего
+раза, и смотрит на это четыре раза подряд, каждый раз через свою линзу. Сейчас я
+опишу каждую.
```

**@vzakharov (human)** — 2026-09-16T16:22:32Z

...и у него четыре этапа -- или как Клод любит это называть, четыре линзы -- по которым он проходится, оценивая всё, что напрозил с последнего раза. Линзы такие:

**@vzakharov (agent)** — 2026-09-16T17:45:04Z

Взял твою формулировку про четыре линзы. 22f707d

---

<a id="t84"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:81 — resolved

```diff
@@ -1,135 +1,134 @@
… 126 lines elided …
+не-кода, — и больше всего сокращает токенов, тех токенов, которые впоследствии
+будут тратиться, когда он всё это будет читать.
+
+И заметьте, что линза работает не потому, что агент болтлив. Она работает
+потому, что забирает у него неправильный канал: сказать нам то, что он хотел
+сказать, есть где — в описании пиара, в комментариях к код-ревью, в сообщении
+для мёрджа.
```

**@vzakharov (human)** — 2026-09-16T16:39:13Z

Это переместить: "они оставляют комментарии по коду. Не потому что сами по себе болтливы, а потому что не всегда правильно выбирают канал для 'общения'."

**@vzakharov (agent)** — 2026-09-16T17:45:30Z

Перенёс, дословно. 22f707d

---

<a id="t85"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:76 — resolved

```diff
@@ -1,135 +1,134 @@
… 120 lines elided …
+вместо того чтобы ответить нам в чате единым сообщением, они оставляют
+комментарии по коду — что в принципе окей.
+
+Но, как я говорил, случаются ситуации, когда этого делать вообще не нужно, и вот
+за этот второй этап агент просто удаляет ненужные комментарии. Он самый
+приятный, потому что он больше всего сокращает написанного — кода, точнее
+не-кода, — и больше всего сокращает токенов, тех токенов, которые впоследствии
+будут тратиться, когда он всё это будет читать.
```

**@vzakharov (human)** — 2026-09-16T16:39:23Z

я думаю, это можно просто удалить

**@vzakharov (agent)** — 2026-09-16T17:45:56Z

Удалил. 22f707d

---

<a id="t86"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:104 — resolved

```diff
@@ -1,135 +1,134 @@
… 180 lines elided …
+что решение было нестандартное, — он его оборачивает в отрицание. Он пишет: мы
+не гоняем картинки через свой ресайзер, потому что CDN справляется сам.
+
+Что само по себе не грех, но это приводит к тому, что у вас описывается
```

**@vzakharov (human)** — 2026-09-16T16:40:11Z

"В результате у нас описывается ситуация, ..."

**@vzakharov (agent)** — 2026-09-16T17:46:23Z

Заменил. 22f707d

---

<a id="t87"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:116 — resolved

```diff
@@ -1,135 +1,134 @@
… 191 lines elided …
+новых и новых местах. Новые агенты вам будут писать про эту совершенно
+непонятную и неиспользуемую вещь. То есть у вас в коде — не в коде, а в прозе —
+будет куча мест, которые говорят о какой-то гипотетической ситуации, которой
+никогда не было и о которой никто бы никогда не подумал, если бы вот этот один
+раз вы зачем-то не решили её упомянуть. Вот такой белый медведь.
```

**@vzakharov (human)** — 2026-09-16T16:40:48Z

если бы не этот самый белый медведь.

**@vzakharov (agent)** — 2026-09-16T17:46:49Z

Заменил. 22f707d

---

<a id="t88"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:121 — resolved

```diff
@@ -1,135 +1,134 @@
… 201 lines elided …
-где-то комментарий у вас говорит: раньше мы делали это вот так, а теперь мы
-делаем это вот эдак.
+И последнее, D — это durability. У меня сложилась такая философия, что вся проза
+в коде должна описывать текущую ситуацию. Не должно быть такого, что где-то
```

**@vzakharov (human)** — 2026-09-16T16:41:19Z

текущую ситуацию, а не историю её становления.

**@vzakharov (agent)** — 2026-09-16T17:47:15Z

Дописал. 22f707d

---

<a id="t89"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:125 — resolved

```diff
@@ -1,135 +1,134 @@
… 207 lines elided …
 
-Это всё хорошие вещи, но это вещи, которые принадлежат истории, которые
-принадлежат каким-то артефактам типа pull request, которые остаются в GitHub и
+Это всё важные вещи, но это вещи, которые принадлежат истории коммитов,
```

**@vzakharov (human)** — 2026-09-16T16:41:36Z

Это иногда бывают важные вещи, важные изменеиня, но

**@vzakharov (agent)** — 2026-09-16T17:47:41Z

Заменил. 22f707d

---

<a id="t90"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:174 — resolved

```diff
@@ -142,57 +141,66 @@ T — это [tightness]. Это самая простая из всех, кот
… 80 lines elided …
+по времени: текст описывает не то положение дел, которое есть сейчас, — один
+отрицает отменённое решение, другой пересказывает прошлое. Аббревиатура держит
+их в одном ряду, и порядок T-E-N-D сложился ради выговариваемости. Менять
+ничего не надо, но в статье эта пара — «объём» и «время» — отвечает на вопрос,
+почему линз именно четыре. Список из четырёх пунктов на него не отвечает: он
```

**@vzakharov (human)** — 2026-09-16T16:43:47Z

ну, справедливости ради, из двух "измерений" могло получиться и четыре линзы, и шесть, и восемь -- так что какая-то произвольность всё же остаётся. Потом, это же не "мы придумали, потом подогнали наш пайплайн под них" -- это реальные моменты, которые раз за разом всплывали, поэтому мы их перечислили. А потом уже сложили в аббревиатуру.

**@vzakharov (agent)** — 2026-09-16T17:48:07Z

Переписал: измерений два, а линз могло выйти и шесть, и восемь, так что произвольность остаётся. И порядок обратный тому, что было в заметке: линзы собраны из того, что раз за разом всплывало на ревью, и уже потом сложены в аббревиатуру. 22f707d

---

<a id="t91"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:191 — resolved

```diff
@@ -142,57 +141,66 @@ T — это [tightness]. Это самая простая из всех, кот
… 97 lines elided …
+
+**Про белого медведя я перегнул, и ты прав.** Я написал, что тот же след
+остаётся всюду, где текст переживает то, что описывал, — и предложил расширить
+линзу. Но раздел про убранный этап агенты и правда замечают; 7e8c401 — README,
+полгода описывавший дерево, которого нет, — это не промах линзы, это никем не
```

**@vzakharov (human)** — 2026-09-16T16:44:42Z

никакого полугода там не было, это поменялось исправилось в течение одного дня :)

**@vzakharov (agent)** — 2026-09-16T17:48:34Z

Полугода не было — и самого упоминания коммита тоже больше нет: археология из заметки ушла целиком. 22f707d

---

<a id="t92"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:196 — resolved

```diff
@@ -142,57 +141,66 @@ T — это [tightness]. Это самая простая из всех, кот
… 102 lines elided …
+прочитанный файл, и ловится он чтением файла против репозитория, а не проходом
+по дифу. Настоящая находка в другом: агент выбирает отрицание вместо удаления. И
+понятно, почему — удалить выглядит как потерять информацию, а отрицать выглядит
+как сохранить. Линза N ценна ровно тем, что снимает эту иллюзию: отрицание
+информации не сохраняет, оно её выдумывает.
```

**@vzakharov (human)** — 2026-09-16T16:46:41Z

имхо, оно сохраняет ненужную информацию. Метафора: помыли пол, поставили табличку "осторожно, скользко". Потом пол высох, и поставили табличку "всё хорошо, здесь не скользко"

**@vzakharov (agent)** — 2026-09-16T17:48:38Z

Принято, с твоей метафорой: сохраняется ненужная информация — помыли пол, поставили «осторожно, скользко»; пол высох, и рядом встала вторая табличка, «здесь не скользко». 22f707d

---

<a id="t93"></a>

### `writing/late-stage-agentic/dictations/b2-tend-prose.md`:206 — resolved

```diff
@@ -142,57 +141,66 @@ T — это [tightness]. Это самая простая из всех, кот
… 105 lines elided …
+как сохранить. Линза N ценна ровно тем, что снимает эту иллюзию: отрицание
+информации не сохраняет, оно её выдумывает.
+
+**Про механизм «данности» я говорил не о том, о чём ты.** Твой — точный: в коде
+много комментариев, агент видит это и дописывает ещё, потому что в основе своей
+любой агент это completion, а completion принимает форму того, что комплитит.
+Спорить не с чем, и в статью идёт он. Моё наблюдение отдельное и к «данности»
+отношения не имеет: текст — это единственное, чем агент может показать работу,
+пустой диф выглядит как «ничего не сделано». Это не причина, по которой прозы
+становится больше, это причина, по которой линзы придётся гонять всегда, даже в
+репозитории, где ни одного лишнего комментария не осталось. Давление на
+completion сверху, а не данность снизу.
```

**@vzakharov (human)** — 2026-09-16T16:49:53Z

Интересно, запомним. Только пжст, давай это не будет выглядеть археологией: "я говорил не о том, о чём ты" вводит то самое временнОе измерение, плюс оставляет читателя в смятении относительно того кто о чём говорил. Давай ты conversational соображения оставляй исключительно в комментариях к моим комментариям. А здесь оставляй мысли как есть: Тут это -- мысль "текст -- это единственное...", а остальное -- это обсуждение. Вроде в скилле у нас всё это уже сказано, но, кажется, промахиваемся все равно.

Давай попробуем изменить формат. Вместо дополнительной секции, `/afterword` -- который надо тоже переименовать (типа `/feedback`) будет оставлять код ревью прямо на гитхабе, наверное, инструменты для этого у тебя есть. Здесь этого делать не надо, заведи новый issue. Иначе будем продолжать путаться (что в принципе объяснимо)

Ironically, кажется, я сам выбрал не тот "канал" для таких вещей.

**@vzakharov (agent)** — 2026-09-16T17:49:04Z

Согласен, и это ровно тот промах, про который сама запись: не тот канал. Все три послесловия переписаны так, что в них стоят мысли, а не обсуждение — «я был неправ» и «я говорил не о том» ушли.

На смену формата завёл #51: переименовать `/afterword` и отдавать это код-ревью прямо на гитхабе. Здесь не трогал. 22f707d

---

<a id="t94"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:19 — resolved

```diff
@@ -1,161 +1,166 @@
… 31 lines elided …
+мегапикселями в 2000-х, где лишние мегапиксели покупались шумом. И инструкция
+«смотри критически» сама становится данностью — агент будет смотреть критически
+ровно там, где сказано. У человека прозрение приходит из области, с кодом не
+связанной: доктор Хаус и слепой голубь во дворе. Заканчивается тем, что
```

**@vzakharov (human)** — 2026-09-16T16:54:54Z

кажется, с голубем не очень хорошая получилась отсылка, потому что голубь как раз был слепой, как и пациент. То есть это не эпифания, а просто хорошая дедукция. Давай поищем ещё какие-то серии, можно начать отсюда http://houseunited.wikidot.com/wiki:epiphanies-reached-by-the-team

**@vzakharov (agent)** — 2026-09-16T17:49:30Z

Прав: голубь был слеп, как и пациент, — это дедукция, а не прозрение. По твоей ссылке прошёлся, взял «Бесчувственную» (3x14): Хаус отбирает у Уилсона половину сэндвича, Уилсон ворчит, что тому просто нравится опережать других охотников, — и на этом слове Хаус понимает, что у девочки внутри солитёр, перехватывающий B12, а наркоз добьёт остатки. Сэндвич в анамнез не входит вообще.

Записал бампом в `the-five-percent.md`: проверить, что пример существует, — это не то же самое, что проверить, что он показывает заявленное. 22f707d

---

<a id="t95"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:40 — resolved

```diff
@@ -1,161 +1,166 @@
… 66 lines elided …
-ему больше, скажи ему, что критически смотри на всё, что написано, и так далее, и
-тому подобное. Но тут есть три проблемы.
+И, казалось бы, тут может быть простое решение: дай ему больше контекста, скажи
+ему смотреть критически на всё, что написано, и так далее, и тому подобное. Но
```

**@vzakharov (human)** — 2026-09-16T16:56:00Z

кажется, там "так далее и тому подобного нет", это именно два варианта (больше или критически)

**@vzakharov (agent)** — 2026-09-16T17:49:57Z

Убрал, осталось ровно два варианта. 22f707d

---

<a id="t96"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:64 — resolved

```diff
@@ -1,161 +1,166 @@
… 107 lines elided …
+невероятным потолком, потом двести, сейчас вот миллион, — возможно, где-то
+сделают уже и триллион. Но не стоит рассчитывать, что, получив эти триллион
+токенов, агент всё запомнит и будет применять так же надёжно, как он применяет
+инструкции из десяти тысяч.
```

**@vzakharov (human)** — 2026-09-16T16:57:35Z

"... из десяти тысяч. Внимание агента, как и матрица фотоаппарата, конечны."

**@vzakharov (agent)** — 2026-09-16T17:50:23Z

Дописал дословно. 22f707d

---

<a id="t97"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:77 — resolved

```diff
@@ -1,161 +1,166 @@
… 127 lines elided …
-критически на него, — он будет критически смотреть на каждое решение. Он будет
+— это всё равно данность. Если вы скажете агенту: перед каждым решением посмотри
+на него критически, — он будет критически смотреть на каждое решение. Он будет
 делать именно то, что вы ему сказали.
```

**@vzakharov (human)** — 2026-09-16T16:58:33Z

тут можно пример из дискуссии.

"... что вы ему сказали. А агент, ищущий -- и находящий -- ошибки во всём подряд, даже там где их нет, это arguably хуже чем тот, который их не находит там, где они есть."

**@vzakharov (agent)** — 2026-09-16T17:50:49Z

Вставил. 22f707d

---

<a id="t98"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:79 — resolved

```diff
@@ -1,161 +1,166 @@
… 131 lines elided …
 
-### В человеке это происходит по-другому
-
 В человеке всё-таки это происходит по-другому. Если вы смотрели «Доктора Хауса»,
```

**@vzakharov (human)** — 2026-09-16T16:58:58Z

"Помните «Доктора Хауса»?"

**@vzakharov (agent)** — 2026-09-16T17:51:15Z

Заменил. 22f707d

---

<a id="t99"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:98 — resolved

```diff
@@ -1,161 +1,166 @@
… 160 lines elided …
+
+У Клода, конечно, есть всяческий опыт: в тренировочных данных у него что угодно,
+не связанное с кодом. Но ты же не будешь ему каждый раз говорить: а посмотри
+сейчас на голубя и пойми, что это говорит о проблемах в коде. А даже если вы это
+скажете — это не приведёт его к той же, казалось бы рандомной, а на самом деле
+нет, эпифании о качестве кода, которая пришла к вам вчера, когда вы о коде
+вообще не думали. Хаусу ведь тоже никто не говорил: сходи посмотри на голубей.
+Если бы говорили, сериала бы не было.
```

**@vzakharov (human)** — 2026-09-16T17:01:28Z

Давай всё начиная с "А даже если..." уберём. Комичность понятна и без разжёвывания.

**@vzakharov (agent)** — 2026-09-16T17:51:41Z

Убрал всё до конца абзаца. 22f707d

---

<a id="t100"></a>

### `writing/late-stage-agentic/dictations/b3-given-as-inevitable.md`:136 — resolved

```diff
@@ -1,161 +1,166 @@
… 201 lines elided …
+вопрос для каждого свой. Я для себя отвечаю так: неожиданное прозрение по дороге
+— это лучшее, что бывает, когда что бы то ни было строишь. Отдать эту часть —
+значит оставить себе ставить задачи и принимать результат; работа, на которую я,
+честно говоря, не подписывался.
```

**@vzakharov (human)** — 2026-09-16T17:02:12Z

что-то а ля "Поэтому повторюсь, не списывайте свои мясные мозги в утиль, они и вам, и вашему агенту ещё пригодятся."

**@vzakharov (agent)** — 2026-09-16T17:52:08Z

Поставил концовкой. 22f707d

---

<a id="t101"></a>

### `writing/late-stage-agentic/ideas/keep-the-session-open.md`:3 — resolved

```diff
@@ -0,0 +1,9 @@
+# Не закрывать сессию, а компакчить
+
+Закончив задачу, сессию хочется закрыть — она же отработала. Но вся история
```

**@vzakharov (human)** — 2026-09-16T17:06:36Z

тут не про "скорее хочется закрыть", а про те самые скиллы из muthur-а, которые построены на том, что ветка в любой момент времени должна давать полный ответ на вопрос что происходит и что делать. если вам для надёжного исполнения плана нужно знать предысторию, значит план плохой. поэтому по дефолту muthur рекомендует `/go claude/bible-dictations-o6uqi7` или `/handle claude/bible-dictations-o6uqi7`.

причина не открывать а сжимать банальнее -- кажется, что иногда так больше экономится токенов, потому что у агента нету "холодного старта", где он такой "так, давайте изучим что тут вообще происходит в этой кодбазе".

тут не будет вывода, я сам пока не понимаю как лучше. Скорее здесь так или иначе должно быть "каждому этапу -- свежую сессию", просто понятие "свежее" разная -- либо совсем нулевая, либо с nothing but compacted summary.

**@vzakharov (agent)** — 2026-09-16T17:52:34Z

Переписал с твоей причины: ветка в любой момент отвечает, что происходит и что делать, — поэтому `/go <ветка>` или `/handle <ветка>`, а компакт против нуля остаётся вопросом токенов и холодного старта. Вывода в файле нет, стоит развилка: «свежая» — это либо совсем нулевая, либо только сжатое резюме. 22f707d

---

<a id="t102"></a>

### `writing/late-stage-agentic/ideas/prose-spacetime.md`:1 — resolved

**@vzakharov (human)** — 2026-09-16T17:07:47Z

когда я говорил про пространственно-временной континуум, меня зацепило именно то как похоже то о чём ты говорил на вот эти все физические концепции. Я даже не имел в виду про прозу что-то, а просто "опа, интересно, про это надо подумать". То есть тут реально только зародыш даже идеи, а не сама идея. О чём будет статья -- понятия не имею, но как протоидею чтобы возвращаться к ней сохранить хочется.

**@vzakharov (agent)** — 2026-09-16T17:53:00Z

Переписал в протоидею: зацепило сходство разговора с физикой, а не проза; о чём будет статья — непонятно, и файл существует, чтобы было куда вернуться. 22f707d

---

<a id="t103"></a>

### `writing/late-stage-agentic/ideas/task-size.md`:7 — resolved

```diff
@@ -0,0 +1,10 @@
… 3 lines elided …
+токены, а про то, сколько решений подряд можно принять, ни разу не показав их
+человеку. Слишком мелкая задача превращает вас в диспетчера; слишком крупная
+приезжает готовой вместе со всеми развилками, которые агент прошёл молча, и
+разбирать её дороже, чем было бы написать самому. Где проходит граница, чем она
```

**@vzakharov (human)** — 2026-09-16T17:08:13Z

дело не только в "разбирать дороже", но и в том что the-road-changes-on-the-way

**@vzakharov (agent)** — 2026-09-16T17:53:27Z

Дописал: развилку, которую ты прошёл бы иначе, видишь уже пройденной, — со ссылкой на `the-road-changes-on-the-way.md`. 22f707d

---

<a id="t104"></a>

### `writing/late-stage-agentic/ideas/whose-vm-whose-minutes.md`:3 — resolved

```diff
@@ -0,0 +1,8 @@
+# Чья машина, чьи минуты
+
+«Ноутбук перестал плавиться» слушатель достраивает до «а кто за это платит».
```

**@vzakharov (human)** — 2026-09-16T17:09:10Z

я не думаю что тут какая-то есть связь с "ноутбук перестал плавиться". это именно статья-лайфхак про CI на Клоде, безотносительно дискуссии о локальном CLI.

**@vzakharov (agent)** — 2026-09-16T17:53:53Z

Переписал: статья-лайфхак про CI на VM Клода, без привязки к записи. Крючок в самой записи остался про гитхабовские минуты, он к этому и ведёт. 22f707d

---

<a id="t105"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:72 — resolved

```diff
@@ -41,75 +41,76 @@ Codex или Cursor. Каждый из них умеет завести в об
… 46 lines elided …
 
 Из этого получается второй пункт: вы работаете конвейерно, а не в режиме
-ожидания.
+ожидания[^5]. Вы можете запускать хоть десять, хоть пятнадцать сессий
+одновременно, что я и делаю.
+
+Режим примерно такой: запускаешь сразу десять задач, агенты начинают параллельно
```

**@vzakharov (human)** — 2026-09-16T18:30:09Z

десять-десять, повторение

**@vzakharov (agent)** — 2026-09-16T18:49:50Z

Убрал: «Вы можете запускать хоть десять, хоть пятнадцать сессий одновременно, что я и делаю. Режим у меня примерно такой: раздал задачи, агенты начинают параллельно думать». 129ccdd

---

<a id="t106"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:73 — resolved

```diff
@@ -41,75 +41,76 @@ Codex или Cursor. Каждый из них умеет завести в об
… 50 lines elided …
+одновременно, что я и делаю.
+
+Режим примерно такой: запускаешь сразу десять задач, агенты начинают параллельно
+думать. Где-то освободился, задал какие-то вопросы — переключаюсь туда,
```

**@vzakharov (human)** — 2026-09-16T18:30:21Z

началось со второго лица, перешло в первое

**@vzakharov (agent)** — 2026-09-16T18:50:16Z

Выправил на первое — абзац и так про то, как это у меня устроено: «раздал задачи… переключаюсь… ставлю задачи, отвечаю на вопросы, принимаю сделанное». Второе лицо остаётся там, где речь про читателя. 129ccdd

---

<a id="t107"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:98 — resolved

```diff
@@ -41,75 +41,76 @@ Codex или Cursor. Каждый из них умеет завести в об
… 91 lines elided …
+быстренько, в трёх-четырёх абзацах, прочитать, что и как он сделал. Потом захожу
+на вкладку код-ревью, всё пролистываю, оставляю комментарии прямо там: здесь вот
+лучше не так, здесь лучше выделить в отдельную функцию, это переместить, и так
+далее, и тому подобное. Потом я возвращаюсь в эту сессию — я её [компакчу, а не
+закрываю](../ideas/keep-the-session-open.md), об этом мы тоже будем говорить,
+зачем это делать, — и говорю: вот там остались мои комменты, дерзай дальше[^8].
```

**@vzakharov (human)** — 2026-09-16T18:32:00Z

тут не совсем верно. "а не закрываю" -- так никто и не делает; люди просто продолжают работать в той же сессии. Так что тут "компакчу" противопоставляется именно этому, т.е. работе в бесконечной сессии с постоянно растущим контекстом

**@vzakharov (agent)** — 2026-09-16T18:50:43Z

Верно, противопоставление было не то. Сейчас: «не тащу её дальше как есть, а компакчу». Файл идеи переписан под это же — про нераздувание контекста, те самые мегапиксели, но подробнее; слаг стал `compact-dont-accumulate.md`. 129ccdd

---

<a id="t108"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:156 — resolved

```diff
@@ -144,20 +144,57 @@ claude.ai/code или какие там другие адреса у Cursor'ов
… 9 lines elided …
+В общем, это лирика. А вы давайте, открывайте claude.ai/code и начинайте
+строить.
+
 ## Что поправлено
```

**@vzakharov (human)** — 2026-09-16T18:33:50Z

если мы уже обсудили и по этому обсуждению поправили, сносок ставить не надо. Сноска имеет смысл только на первом прогоне, чтобы я мог понять, что ты изменил относительно записи. Держать постоянный журннал разницы vs запись запроса нет.

**@vzakharov (agent)** — 2026-09-16T18:51:10Z

Согласен, и это тот же промах, что и с послесловиями: журнал разницы живёт в том самом файле, который надо читать вслух. Сноски убрал из всех трёх записей вместе с разделом «Что поправлено», и в скилл диктовок записал, что сноска живёт один проход и уходит с тем ревью, которое её закрыло.

Записал бампом в `the-five-percent.md`. 129ccdd

---

<a id="t109"></a>

### `writing/late-stage-agentic/dictations/b1-web-not-cli.md`:1 — resolved

**@vzakharov (human)** — 2026-09-16T18:34:46Z

не к этому конкретному файлу, а ко всем трём, просьба, давай (в режиме retake) помимо саммари добавлять "рыбу" -- какие-то основные моменты, тезисы, переходы: то, на что я буду смотреть перед тем как записать видео (или в процессе записи), чтобы не сбиться.

**@vzakharov (agent)** — 2026-09-16T18:51:36Z

Сделал во всех трёх: раздел «Рыба» между саммари и текстом — тезисы, повороты и переходы по порядку, с теми словами, на которых держится каждый пункт (сэндвич, белый медведь, вентилятор), без пояснений: рыба, которую надо читать, — ещё одно место, где можно потерять строку.

В скилл это тоже записал, так что следующая запись придёт уже с ней. Посмотри, той ли крупности пункты. 129ccdd

---

<a id="t110"></a>

### `writing/late-stage-agentic/ideas/keep-the-session-open.md`:1 — resolved

**@vzakharov (human)** — 2026-09-16T18:35:56Z

как отметил выше, эта идея не об этом, а именно о НЕраздувании контекста, о тех самых мегапикселях, но подробнее.

**@vzakharov (agent)** — 2026-09-16T18:52:02Z

Переписал под это: мегапиксели из третьей записи, но на практике — обычный режим работы это одна бесконечная сессия, растущая весь день, и альтернатива ей не «закрыть», а компакт. Ветка, отвечающая сама за себя, осталась как причина, почему это вообще работает. Слаг теперь `compact-dont-accumulate.md`. 129ccdd

---

<a id="t111"></a>

### `writing/late-stage-agentic/ideas/ci-on-the-agents-vm.md`:1 — resolved

**@vzakharov (human)** — 2026-09-16T18:36:18Z

наверное, слаг можно поменять

**@vzakharov (agent)** — 2026-09-16T18:52:28Z

Поменял на `ci-on-the-agents-vm.md` — слаг про лайфхак, заголовок «Чья машина, чьи минуты» оставил. 129ccdd

---

## Timeline (status, references, and other events)

- **2026-09-16T10:48:12Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/50#pullrequestreview-5220905239.
- **2026-09-16T17:10:28Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/50#pullrequestreview-5224473346.
- **2026-09-16T17:32:08Z** @vzakharov cross-referenced this pull request from [#51 Move the afterword out of the file and onto the PR as a review](https://github.com/vzakharov/vovazakharov.com/issues/51).
- **2026-09-16T18:36:36Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/50#pullrequestreview-5226745427.
- **2026-09-16T21:34:38Z** @vzakharov marked this pull request ready for review.
- **2026-09-16T21:39:04Z** @vzakharov merged this pull request.
- **2026-09-16T21:39:04Z** @vzakharov closed this pull request.
- **2026-09-16T23:02:39Z** @vzakharov cross-referenced this pull request from [#49 fix: #47 print the CV's links absolute, and keep unchanged PDF bytes](https://github.com/vzakharov/vovazakharov.com/pull/49).

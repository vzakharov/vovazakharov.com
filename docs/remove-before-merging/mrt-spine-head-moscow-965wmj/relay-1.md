# Relay 1 — MRI clinic search for Лейсан (parked)

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

**Operator (1):**

> Найди Лейсан хорошее МРТ позвоночника и головы на севере Москвы, _с хорошим
> описанием_ и теслами

**Agent:** Routed as rung 2 (an answer, no repo change). Researched 3 T clinics
in north Moscow; recommended РЦНН (former Научный центр неврологии, Волоколамское
ш. 80) for the neuroradiologists' reports, verified from its own price list:
Siemens Prisma and GE Signa Premier 3 T, 15 000 ₽ per zone (head; each spine
section), 24 000 ₽ with contrast, 6 000 ₽ for a report on scans done elsewhere.
Alternatives from aggregators only: Патеро Клиник (пр-т Мира 211к2, Siemens
Verio), Гута Клиник (Фадеева 4А, Philips Ingenia 3T), МЕДСИ на Белорусской
(Philips Ingenia Elition). Asked which spine section and what the complaints
are, since that sets the protocol and contrast. Made the muthur sync offer.

**Operator (2):**

> А когда нужен контраст?

**Agent:** Contrast is for what accumulates gadolinium — tumour, inflammation,
active MS lesions, post-operative spine, pituitary, unilateral hearing loss;
not for ordinary back/neck pain, hernias, headaches. At РЦНН it adds 9 000 ₽;
creatinine may be asked for. Repeated the open question: Лейсан's complaints and
whether she has a referral. (verbatim in Last agent turn)

## 3. Intent

Vova wants a clinic for Лейсан's head and spine MRI in the north of Moscow,
prioritising the radiologist's report quality and a 3 T scanner.

## 4. Decisions

- **РЦНН over the closer private clinics**: report quality depends on who reads
  the scan, and РЦНН's neuroradiologists read brain and spine all day; the
  private alternatives' 3 T claims came from aggregators, unverified.
- **Scan elsewhere, report at РЦНН** was offered as the cheaper route (6 000 ₽
  per outside-scan report vs 60 000 ₽ for head plus whole spine there).

## 5. Errors and dead ends

- Web search returned thin results for clinic-specific queries; aggregator
  pages and the clinic's own PDF were what worked.
- patero.ru answered 503; Патеро's scanner is unverified.
- Aggregators list РЦНН at 4 000 ₽ — stale; the clinic's PDF is authoritative.

## 6. State

- Branch `claude/mrt-spine-head-moscow-965wmj`, no PR, no code changes; this
  file is the only commit the session made.
- Nothing running. The keepalive watcher has exited; the muthur sync offer was
  made; do not make it again.
- Estimate: 2 h middle analyst — "comparing clinics by scanner field strength
  and radiologist report quality needs reading reviews and equipment pages with
  judgement". No remainder handed on.

## 7. Pointers

- РЦНН price list, 18.02.2026:
  `curl -sSL -o price.pdf "https://www.neurology.ru/upload/medialibrary/33b/wi05qznj9cwaddpwn7k70psiadxr2mty/Preyskurant-18.02.2026_s_-dop5.pdf"`
  — MRI rows around the "Magnetom Prisma" and "Signa Premier" headings.
- 3 T clinic list with scanner models: https://mrt-kt.info/mrt/moskva/3-tesla/
- Transcript: https://claude.ai/code/session_01DaohkE3zPdDPby3feDV5xH

## 8. Next step

Wait for the operator. Pending from the agent's side: Лейсан's complaints, which
spine section, and whether a doctor's referral exists (and says "с
контрастом") — it refines the protocol and contrast advice.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Контраст нужен, когда врач ищет то, что накапливает гадолиний: опухоль, воспаление, активный очаг. Позвоночник и голову при обычных жалобах смотрят без него, потому что грыжи, протрузии, остеохондроз и большинство причин головной боли видны и так.

**Когда контраст обычно нужен:**
- Подозрение на опухоль или метастазы, а также контроль уже известной опухоли.
- Рассеянный склероз и похожие болезни: контраст показывает, какие очаги активны прямо сейчас, а какие старые.
- Инфекция или воспаление: абсцесс, менингит, миелит, воспаление диска и позвонков.
- Позвоночник после операции: только с контрастом можно отличить рубец от новой грыжи.
- Гипофиз, например при сбоях гормонов. Тут нужен особый, динамический протокол.
- Снижение слуха на одно ухо: ищут невриному слухового нерва.
- Иногда при сосудистых вопросах. Сосуды мозга при этом обычно видно и без контраста.

**Когда не нужен:** боль в спине или шее, онемение рук или ног из-за грыжи, головные боли без тревожных признаков, головокружение, первичный поиск инсульта.

**Как это устроено на практике:** часто сначала делают без контраста. Если рентгенолог что-то увидит, контраст добавляют в тот же визит. В РЦНН контраст отдельной строкой стоит 9 000 ₽, отсюда и разница между 15 000 и 24 000. Перед контрастом могут попросить свежий креатинин, по нему проверяют почки. При беременности контраст не дают.

Поэтому ответ упирается в тот же вопрос, что я задал в прошлый раз: **на что жалуется Лейсан и есть ли направление от врача?** Если невролог написал «с контрастом», значит, он что-то подозревает, и делать стоит именно так. Если направления нет, при записи достаточно описать жалобы: рентгенолог сам решит, нужен ли контраст.
```

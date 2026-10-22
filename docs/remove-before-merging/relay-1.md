# Relay 1 — LLM-based text compression and AI-text detection (parked)

## Standing constraints

None stated.

## The conversation

Routed as rung 2 (asks for no change to the codebase): a pure Q&A session, nothing in the repo was meant to change.

1. **Operator:** «Какая у меня мысль возникла, не знаю, новая ли. Вот генерят у нас нейросети текст. Каждый следующий токен на ней выбирает с какой-то вероятностью, но при этом клонит, конечно, выбрать ближе к первому по порядку. […] если мы любой текст таким образом разложим по токенам, но не в виде порядковых номеров, а в виде, какой по счету был этот токен после всего предыдущего текста, то у нас получится такая строчка […] 5, 1, 1, 7, 1, 3, 2, 2, 1, 1, 3, 2, 2 […] и потом просто взять ее, даже просто обычным зипом сжать, то, кажется, у нас может быть плотность сжатия прямо вообще какая-то зашкаливающая. Применению этого […] во-первых, собственно, сжатие, а во-вторых, определение, насколько вероятно, что любой данный текст написан нейросетью. […] И вопрос у меня тут два. Первый, естественно, кто до меня это придумал […] И второе, […] если мы будем оценивать текст более слабый, возможно, даже локальной моделью, […] получится ли у нас надежный индикатор […]? Ну и третий вопрос, какие, возможно, еще у этого могут быть применения […]» (condensed only by the elisions marked; the full message is in the transcript.)
   **Agent:** Prior art: Shannon 1951 (guess-rank experiment, exactly this sequence); arithmetic coding beats ranks+zip; NNCP/ts_zip (Bellard), LLMZip (2023), DeepMind "Language Modeling Is Compression" (2023); detection: GLTR (2019, ranks), GPTZero, DetectGPT/Fast-DetectGPT, Binoculars (2024). Compression ratio = perplexity in other units. Weak open model as proxy: partly works (shared training data, RLHF mode-seeking) but fails on missing prompt, formulaic human text (Liang et al. 2023 non-native bias), paraphrase attacks (DIPPER), theoretical bound (Sadasivan et al. 2023); only watermarks (Kirchenbauer 2023, SynthID) are reliable. Other uses: steganography, memorization/contamination detection (Min-K%), authorship attribution, compression-based classification, surprise maps of text, log anomalies, low-bandwidth channels, model eval.
2. **Operator:** «ну не просто "почти", а твоё "семейство" названо в честь него. Но лет на 75 -- это не беда. 75 лет назад тебя не было. Вопрос, изучал ли это кто-то уже в современности, когда ллмки стали реальностью (а для кого-то -- и бичом)»
   **Agent:** Yes — the modern items were already in reply 1 but buried behind Shannon. Hedged the Shannon-naming claim (widely reported, not officially confirmed). Two web searches added 2024–2026 work: Nacrith (Feb 2026), Hybrid-LLM archival study (Mar 2026), "Haiku to Opus in Just 10 bits" (2026, Carlini et al., LoRA ~2x), LLM source-code compression (Jul 2026); detection: ZipPy (2023), AIDetx (late 2024), PAN 2026 NCD notebook. Open problems: cross-hardware determinism, model size inside the archive, bureaucrats read as robots.
3. **Operator:** «> Если кодировать полную вероятность выбранного токена, а не его номер, получается теоретический оптимум. да, но по вероятности мы обратно не восстановим сам токен?»
   **Agent:** Explained arithmetic coding: the archive stores a point inside an interval whose width is the probability, not the probability itself; worked example «Мама мыла» → раму/пол/посуду slices; decoder re-runs the same model and reads which slice the point falls in; why ranks+zip is the same slicing with static averaged widths, while arithmetic coding re-slices per step.

## Intent

Vova is exploring an idea (rank/probability-based LLM compression and its use as an AI-text detector) and wants to know prior art, whether a weaker open model works as a proxy for closed ones, and further applications. Curiosity, not a build request.

## Decisions

- Treated as rung 2: no code, no plan, no PR.

## Errors and dead ends

- Reply 1 opened with Shannon, which made the modern work read as absent; the operator re-asked about modern research. Lead with the answer the operator's question is about.

## State

- Branch `claude/llm-compression-talk-zx04m9` (renamed from `claude/exciting-planck-zx04m9`); no PR. Deleting the old remote ref was refused by the git proxy (HTTP 403), so `claude/exciting-planck-zx04m9` still exists on origin at a6e87d5 with no PR on it.
- Estimate: 1.5 h senior analyst — "a literature answer on LLM-based compression and AI-text detection needs someone who already knows the field to name prior art and its limits without a research sprint". Nothing handed on.
- Nothing running: keepalive watcher finished, no subscriptions, no check-ins.

## Pointers

- Transcript: https://claude.ai/code/session_0113DZpocMNhPa5SCRvw1vty
- Sources cited in reply 2: https://arxiv.org/pdf/2411.19869, https://github.com/thinkst/zippy, https://ceur-ws.org/Vol-4283/paper432.pdf, https://www.emergentmind.com/topics/nacrith, https://arxiv.org/html/2603.25526v1, https://www.alphaxiv.org/abs/2604.02343v2, https://www.alphaxiv.org/abs/2607.24192.md

## Next step

Wait for the operator.

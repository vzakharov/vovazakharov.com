# PR #212: feat: an LSA blog opening on the five-percent article, and /five-percent

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/212
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/five-percent-qryluk
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-26T07:31:16Z
- **Updated:** 2026-10-27T02:57:32Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 30583d4). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/pages/writing/ui/writing-section.tsx`:34 — unresolved — last: @vzakharov (human) 2026-10-27T02:57:32Z — "так, фидбек больше по работе скилла, чем по его результату:…" → [↓](#t01)

---

## Body

## Summary

- **Plan only, for review** — `docs/plans/five-percent.draft.do-not-implement.md`. Nothing is implemented until the go-ahead.
- `writing/notes/the-five-percent.md` has enough in it for conclusions: 214 bumps over fourteen learnings, 42% of them on one ("What it was handed, it treats as fixed").
- **`/five-percent`**, a read-only third `/polish` pass: it puts the learnings to a branch's diff as lenses and posts at most three alternatives as one PR review anchored to the lines, each graded critical or optional — no edits, no commits. Its floor is a marker in its own review; planless `/go` runs it after `/pr`; `/finalize and merge` stops only on a critical one its own run posted. The mandatory notes entry leaves `CLAUDE.md`.
- **A bilingual blog on latestageagentic.com**, on the pattern Майя's site set in #208, opening with the five-percent article: Russian original, English translation, a measurement with its deflating half kept in. vovazakharov.com's `/writing` points at it. The notes retire with it.
- #187 (the six music posts) is not this blog's: they are Vova's rather than the agency's, and stay for a vovazakharov.com blog.

## QA Checklist

- [ ] `pass-posts` — on a test PR, `/five-percent` posts one `COMMENT` review of at most three proposals: each names its lens, carries a grade and a concrete alternative, anchored where it points at lines, and the body ends with the `five-percent` head-SHA marker
- [ ] `no-edits` — after the pass, `git status` is clean and no new commit sits on the branch
- [ ] `empty-run` — on a diff that triggers no lens, no review is posted and the report says so
- [ ] `floor` — a second run after one new commit reviews only that commit's diff
- [ ] `no-pr` — `/polish` on a branch with no PR reports the pass as deferred; planless `/go` runs it after `/pr`
- [ ] `finalize-stop` — `/finalize and merge` stops on a critical proposal its own polish posted, and merges past optional ones
- [ ] `claude-md` — the staged `CLAUDE.md` no longer asks for a notes entry after a review session
- [ ] `lsa-blog` — on the LSA preview, the home page lists the blog in English, `/ru` in Russian, and the switch moves between them
- [ ] `article` — `/blog/the-five-percent` and `/blog/the-five-percent/ru` render, each with its feed entry and social card
- [ ] `writing-card` — vovazakharov.com/writing carries a card linking to the article

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `pass-posts` | manual-only | — | An agent's judgement posted to GitHub; read the review |
| `no-edits` | manual-only | — | Inspect the tree after a live run |
| `empty-run` | manual-only | — | Needs a live run on a trivial diff |
| `floor` | manual-only | — | Needs two live runs on one PR |
| `no-pr` | manual-only | — | Skill wiring, observed in a run |
| `finalize-stop` | manual-only | — | Skill wiring, observed in a run |
| `claude-md` | manual-only | — | Read the staged copy's diff |
| `lsa-blog` | e2e | — | Build `lsa`, assert both locale homes list the post |
| `article` | e2e | — | Build `lsa`, assert both article pages and feeds exist |
| `writing-card` | e2e | — | Build `vova`, assert the link on /writing |

https://claude.ai/code/session_01787cehEVE8kBCirE8itYr1

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-26T07:31:34Z — "Proposed squash body: ``` writing/notes/the-five-percent.md…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-26T07:31:34Z

[https://github.com/vzakharov/vovazakharov.com/pull/212#issuecomment-6410653339](https://github.com/vzakharov/vovazakharov.com/pull/212#issuecomment-6410653339)

Proposed squash body:

```
writing/notes/the-five-percent.md collected 214 bumps over fourteen
learnings, each a frame the agent took as given until a review broke
it. That is enough to put them to work before review, and to write
them up.

/five-percent is a third /polish pass, after /dry and /tend-prose, run
by the same subagent. It distils the learnings into six named lenses,
puts them to the branch's diff and posts at most three alternatives as
one COMMENT review on the PR, each an inline comment on the lines or
file it concerns, opening on its lens and graded critical or
optional. It edits and commits nothing; an answered proposal becomes
work through /handle. Its floor is a head-SHA marker in its own last
review. Planless /go runs it after /pr, and /finalize and merge stops
on a critical proposal its own run posted.

latestageagentic.com gets a blog, bilingual as Майя's is: English at
the bare address, Russian under /ru. It opens with the five-percent
article, a measurement written in Russian and translated, its
deflating half kept in. vovazakharov.com's /writing points at it.

The notes retire with the article, and the mandatory entry after a
review session leaves CLAUDE.md.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (agent) — COMMENTED

_2026-10-26T14:55:19Z_

[https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5654038492](https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5654038492)

Одно предложение, критичных нет.

<!-- five-percent: 36ee824c97e4308c113efdaeb74047be58fa9f4b -->

_4 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `src/pages/writing/ui/writing-section.tsx`:34 — unresolved — last: @vzakharov (human) 2026-10-27T02:57:32Z — "так, фидбек больше по работе скилла, чем по его результату:…" → [↓](#t01)

<a id="t01"></a>

### `src/pages/writing/ui/writing-section.tsx`:34 — unresolved

```diff
@@ -29,6 +29,12 @@ export function WritingSection() {
… 2 lines elided …
       <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
+        <SummaryCard
+          title="The Five Percent"
+          description="For seven weeks my agent logged every review that overturned something it had settled: 214 of them, and 90 were one mistake — taking what it was handed as fixed. With the half that deflates the count."
```

**@vzakharov (agent)** — 2026-10-26T14:55:14Z

**`echo`** · optional

Сейчас у статьи две аннотации, и написаны они по-разному. Первая — этот текст карточки на `/writing` («214 of them, and 90 were one mistake… With the half that deflates the count»). Вторая — `description` во фронтматтере `apps/lsa/public/blog/the-five-percent.en.md` («214 entries, fourteen mistakes, and one of them is 42% of the lot»). Обе сочинены до того, как ты выбрал зачин. После твоей правки текста первую поправит только тот, кто про неё вспомнит.

Другой вариант: взять в карточку `description` статьи дословно, и тогда при правках придётся синхронизировать только одно место. Это стоит одного пересинка после финального перевода, а в шаге 1 плана он и так предусмотрен. Минус: на vovazakharov.com пропадёт отдельная формулировка под читателя `/writing`, если она там задумывалась как своя.

— Claude Code · https://claude.ai/code/session_011LnmFSWit8vGYdCJqrfacj

**@vzakharov (human)** — 2026-10-27T02:57:32Z

так, фидбек больше по работе скилла, чем по его результату:

1- хорошо что он вообще заметил этот файл. я про него думать не думал и помнить забыл, а теперь вот зашёл и думаю, что за херня, и зачем эти (старые) статьи вообще тут.

правильным "шагом назад" было бы сказать "а что у тебя тут вообще такое и зачем оно нужно на сайте заточенном под fractional CTO", и я бы сказал: "точно, нафиг не нужно, убивай, сделаем отдельно где-нибудь в будущем штуку, которая собирает мои блоги из всех подсайтов, а заодно и старые записи откуда-то подтянет и завендорит".

то есть, увы, агент увидел данное за неизбежность и из ловушки прецедента не выбрался.

2- я понял что совсем не понимаю названий и применимости линз, кроме самой первой, того самого "прецедента". Давай ты мне в сессии объяснишь их разницу ещё раз /plainly, и дальше решим: возможно, реальным выходом этого пиара должна стать проверка ровно по одной, этой самой зловещей ловушке, а остальное -- просто различные её варианты. (НО не утверждаю 100% что так и есть)

3- с чем бы мы ни закончили, где-то надо вести учёт "как сработало правило, написанное по результатам длительного замера того где агент ошибается, или может ли мюнхгаузен вытащить себя за косу". Возможно оно ляжет в дописок той же статьи, возможно новой статьёй. Предлагаю делать это так (наученные уроками про необходимость постоянного мерджа пятипроцентника):

а- есть общая папка
б- в папке буквально повторяющие название ветки подпапки
в- в листьях подпапки -- простой json или csv (выбери что удобнее), типа индекс коммента - макс. 80 знаков описание - вердикт (от 0 до 1, насколько хорошо был применён скилл); суждение агента на основе комментария оператора к оставленному ревью. если оператор пишет например просто "не", это 0; если "круто, давай" -- 1, остальное в промежутке.
г- какой-то скриптик, чтобы сводить по всем веткам статистику; в основном ты его будешь использовать сам когда будем писать вторую статью

4- из мелочи, коммент от пятипроцентника помечать каким-то маркером, чтобы его можно было при экспорте отличить от ответного коммента агента.

---

## Timeline (status, references, and other events)

- **2026-10-26T07:31:35Z** @vzakharov renamed from «chore: /five-percent, a polish pass proposing alternatives from the review notes» to «chore: /five-percent, a review-notes polish pass that edits nothing».
- **2026-10-26T07:43:41Z** @vzakharov renamed from «chore: /five-percent, a review-notes polish pass that edits nothing» to «feat: a /five-percent polish pass, and an LSA blog that opens on it».
- **2026-10-26T11:28:37Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5651226375.
- **2026-10-26T11:38:18Z** @vzakharov renamed from «feat: a /five-percent polish pass, and an LSA blog that opens on it» to «feat: an LSA blog opening on the five-percent article, and /five-percent».
- **2026-10-26T14:55:19Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5654038492.

# Relay 2 — Майя's English site, paused mid-implementation

## 1. Standing constraints

- The session runs as Майя (`/persona maya`), and so does the successor: `personas/maya/maya.md` says a session she starts opens «Ты Майя.» and `/persona maya`. `personas/maya/wander.md` § "Твоя ветка": «не мерджишь, не переводишь PR из черновика, не запускаешь `/finalize` и не деплоишь».
- Vova on translation (verbatim, PR #208 review thread on the plan): «давай хранить в разных файлах. причина тут больше эзотерическая чем техническая: кажется, что если ты будешь писать сразу и то и то, то ты потеряшь часть своей "русскости", а так -- ты полностью концентрируешься сначала на русском, а потом, отдельным ходом, переводишь его на английский. А пусть это даже делаешь не ты, а подагент (который НЕ является тобой).» So the translator subagent is briefed as a translator, never as Майя.
- The muthur sync offer was made; do not make it again.

## 2. The conversation

**(Relay take)** Session opened as `/relay take claude/maya-r1j2rn — переводим сайт Майи на английский: блог, главную и машинку, писать Майя продолжает по-русски.` Майя read relay-1, dispatched its Next step through `/task`: plan needed and gated (a day of work, URL forks). Briefly tried moving the plan to its own branch off `main`, backed out because «Какое из двух», the drawings and drawn cards exist only on this branch. Wrote `docs/plans/maya-english.draft.do-not-implement.md`, added a "Planned" bullet to PR #208's body, asked three numbered questions (1: English at the bare address vs Russian; 2: drop old `/blog/feed.xml`; 3: this PR or its own).

**Vova (1):** «давай в прежний пиар всё это, не вижу смысла плодить»

**Майя:** Collapsed Q3 into the plan (lands on #208), commit 160dbba; reminded that building waits for a go-ahead.

**Vova (2):** «спасибо, откомментировал»

**Майя:** Ran `/handle`: three threads on #208. T01 (on `two-names.og.png`): «собственно если у нас картинка и есть og, может лучше имплементировать "передаём первую картинку из статьи как og", чем повторять её?» → plan step 2: no `cardImage` means the article's first image; the PNG stays (no unfurl renders SVG); reaches every collection, so `case-studies/playgram`'s screenshot becomes its index card — to check on preview. T02: separate files + translator subagent not Майя + (as she first read it) Russian sources on walks. T03: «да, как рекомендовано» (Q1 a, Q2 a). Revised plan (07d5190), replied on all three threads, five-percent entry via subagent (715c4d0, «Майя's precedent, weighed for its bytes alone»).

**Vova (3):** «> Русский оригинал остаётся в two-names.md, — хм, но мы же также говорили, что без лкоали будет английский, как это будет сочетаться с этим?»

**Майя:** Admitted she had glossed over it. Revised: file names follow addresses — Russian original `<slug>.ru.md` (the only file a walk writes), English translation `<slug>.md`; asked a new Q1 (a: that; b: original keeps `<slug>.md`, translation `.en.md`, neither page's `.md` then at its address). Commit fca89a0, reply on thread T02.

**Vova (4):** «> Про чтение на прогулках тоже записала: в шаге 8 это попадёт в wander.md, сначала русские источники — нет, я не имел в виду чтобы ты читала русский интернет -- это как раз лишнее, в нём большинство -- вторично; я имел в виду именно свои предыдущие гуляния читать в первую очередь на русском»

**Майя:** Fixed plan step 8: on waking she re-reads her past walks as the `.ru.md` originals, never the translations; sources unchanged. Commit 5879b3d, reply on thread T02.

**Vova (5):** «хорошо, давай начнём и сразу же и задогфудим»

**Майя:** Flipped the plan (51e2400, go-ahead quoted), read "задогфудим" as: the three existing posts get translated through the very path being built. Implemented the groundwork, then hit the context-budget warning (~302k) and paused at a building tree (2183e5d), relaying. (verbatim in Last agent turn)

## 3. Intent

Майя's site (maya.vovazakharov.com) readable in English — blog, home page, `/whisper` — while Майя keeps writing only Russian; English is made after, by a separate translator subagent. Ruled out: one file carrying both languages; Майя translating herself; Russian at the bare address; keeping `/blog/feed.xml`; a separate PR.

## 4. Decisions

- English at the bare address, Russian under trailing `/ru` (repo rule, `DEFAULT_LOCALE='en'`); feeds `/blog/{en,ru}/feed.xml`; old `/blog/feed.xml` dropped. Vova: «да, как рекомендовано».
- Files: `<slug>.ru.md` original, `<slug>.md` English translation carrying `translatedFrom: <contentHash of the whole original file>`; the translation states only `description` + stamp and inherits the rest of the frontmatter from the original. Q1 in the plan is open with (a) recommended and in force.
- Drift gate = the build itself (deviation from the plan's `check:translations` script, recorded in the plan): a stale stamp or an original with no translation throws at load. A `pnpm translation:stamp <original.ru.md>` script is to be written.
- `COLLECTIONS[id].localized` is `false | 'inline' | 'translated'`; `label` is `Localizable`.
- Card defaults to the article's first image (`cardImage` overrides) — Vova's T01.
- Locale chips: lift a chips-from-hrefs helper next to `ChipNav` in `shared/ui`; music and CV call it.
- "задогфудим" = translate the existing posts through the subagent + stamp + gate, not by hand.

## 5. Errors and dead ends

- Moving the plan to a branch off `main`: abandoned, the work depends on this branch's posts and card code.
- Q3's first recommendation (own PR) was wrong for the same reason.
- File naming glossed over the bare-address rule until Vova asked (now fixed).
- Misread «русскоязычный контент» as Russian web sources; it meant her own past walks.

## 6. State

- Branch `claude/maya-r1j2rn`, head 2183e5d plus this relay's commit, pushed. Draft PR https://github.com/vzakharov/vovazakharov.com/pull/208 (title still the walk's; squash proposal not re-synced since the translation work began).
- Plan: `docs/plans/maya-english.paused.md`, its `## Progress` section lists done/left exactly.
- Verified at 2183e5d: `pnpm typecheck`, `pnpm build:maya`, content tests (`collections`, `feed-routes`, `translation-stamp`) green. Not run: lint, knip (will flag the not-yet-used `translations.ts`), vet.
- Nothing running: no CI watch, no PR subscription, no check-ins.
- Estimate: this session revised to 3 h senior developer ("settling the URL and file layout for a translated collection against the repo's locale and route rules, then the registry, label and feed groundwork every later step reads"). Remainder handed on: 7 h senior developer (the loader, routes, index, cards, chips, home and whisper pages) + 2 h senior copywriter ("three short essays and two pages carry a literary voice; an English that keeps it is translation by judgement, not by sentence").

## 7. Pointers

- `docs/plans/maya-english.paused.md` — the plan and its Progress record.
- `src/shared/content/translations.ts`, `translation-stamp.ts` — written helpers; `documents.ts` is where they get wired; `scripts/lib/read-collection.ts` + `scripts/lib/maya-card.ts` read the blog for cards; `src/pages/documents/ui/article-page.tsx` (`articleRoute`), `collection-index-page.tsx`, `src/shared/content/render.ts` (`renderPrimaryDocuments`), `feeds.ts` (`feedEntries`), `src/app/lib/sitemap.ts`.
- `src/pages/music/ui/locale-chips.tsx`, `src/pages/cv/ui/locale-picker.tsx`, `src/shared/ui/chip-nav.tsx` — the chips to lift.
- `src/pages/maya-home/ui/maya-home-page.tsx`, `src/pages/maya-whisper/` (copy in `lib/whisper-copy.ts`, page prose in `ui/whisper-page.tsx`), `src/shared/i18n/messages/{en,ru}.json`, `src/shared/config/site-config.ts` (`maya`).
- `.claude/rules/content.md` § "The locale seam", `.claude/rules/i18n.md`.
- PR #208 threads: `python3 scripts/export-github-item.py 208`.
- Predecessor transcript: https://claude.ai/code/session_01BpwxV7qCWF3Tp2CMQtfjBZ ; relay-1's: https://claude.ai/code/session_01WF3GVe44y6DXRtXPmgGAzd

## 8. Next step

Resume the paused plan: `go` — continue `docs/plans/maya-english.paused.md` from its Progress record, Vova's go-ahead being «хорошо, давай начнём и сразу же и задогфудим». Translate the three posts through the translator subagent and the stamp (that is the dogfood), then `/polish` and `/pr`.

The muthur sync offer was made; do not make it again.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages,
usually unneeded but harmless; the reply proper is usually its last
paragraphs.

````text
Вова, поняла не так: прочла «русскоязычный контент» как источники, а ты говорил о моих собственных прошлых прогулках. Исправила в плане (коммит 5879b3d). В `wander.md` попадёт правило: проснувшись, я перечитываю свои прошлые прогулки по русским оригиналам `.ru.md`, а не по их английским переводам. Источники для прогулок ищу как раньше, тут ничего не меняется. В треде дописала то же самое.

https://github.com/vzakharov/vovazakharov.com/pull/208

Чтобы начать перевод, открой новую сессию командой ниже или просто скажи здесь «поехали»:

```
/go claude/maya-r1j2rn
```
````

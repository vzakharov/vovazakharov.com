# PR #244: feat(unsquatted): 210 names in one catalogue, premiums out, UI fixes

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/244
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/unsquatted-catalogue-and-fixes-4mocr0
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-11-04T02:18:19Z
- **Updated:** 2026-11-04T04:21:35Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 3

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/unsquatted/pages/home/field-tools/ui/field-tools.tsx`:91 — unresolved — last: @vzakharov (human) 2026-11-04T04:19:37Z — "да, давай" → [↓](#t01)
- **T03** `sites/unsquatted/public/card.og.png`:1 — unresolved — last: @vzakharov (human) 2026-11-04T04:14:22Z — "те 4 что сейчас автоматически выбраны как "самые крутые"? ес…" → [↓](#t03)
- **T04** `src/unsquatted/pages/home/deck/model/picks.yaml`:1 — unresolved — last: @vzakharov (human) 2026-11-04T04:17:50Z — "не хочется чтобы будущий агент случайно прочёл это разом, да…" → [↓](#t04)

---

## Body

## Summary

- **One catalogue file.** The hundred `public/picks/<domain>.md` files become one YAML map keyed by domain (`deck/model/picks.yaml`), beside the loader that parses it. Prose blurbs read cleanly in YAML, and a duplicate domain is a parse error.
- **Blurbs in one template, composed.** Recasting the blurbs read as ad copy, so they went back to one template, and each entry now holds a `tagline` and one to three bare `uses`. The page composes "Tagline. A x, a y or an z.", choosing a/an by sound.
- **210 names, in more forms than compounds.** Every entry states its `form`: 99 compounds, 30 coinages, 27 phrases, 22 domain hacks, 18 rare words, 14 respellings. The runbook spreads a run across forms the way it already spreads across axes.
- **Premiums are filtered out.** `pnpm names check` and `recheck` now ask Porkbun's keyed `checkDomain` about every name RDAP calls free. 40 of the 62 hacks first picked turned out premium or reserved; they went to the ledger under those verdicts. Each hack states a `pattern`, a mask over the tail its zone spells (`*st.one`, `*.red`), and the social card shows one name per pattern. The page's own checker still cannot see premiums, since a browser cannot make the keyed call.
- **Three UI fixes.** The copied-image toast is bigger (300 px) and stays longer. Shortlist → Edit focuses the textarea. Copy as image lists free domains under the fold too, because reaching for the share button looks them up the way pointing at "more tlds" does.
- **A listed name goes into the checker as it reads.** Clicking a pick fills the field with the word without its dot (`firk.in` → `firkin`), so the checker shows the hack beside the word's own `.com`; a `.com` pick goes in as its bare label.
- **The list's heading sticks.** "Up for grabs" and its redraw stay on screen while the list scrolls, so drawing ten more needs no scroll back up; a redraw from the stuck heading leaves the page where it is.
- **The privacy line is true now.** "Your queries never leave your browser" raised the question of where results come from. It now reads "Your browser checks names directly, so we never see them and can't steal them."

## QA Checklist

- [ ] `toast` — type a name, Share → Copy as image: the receipt card is visibly larger and stays readable for about a second and a half before sweeping off.
- [ ] `edit-focus` — press Edit on the shortlist: the caret is in the textarea, at the end of the text.
- [ ] `card-rows` — type `reconquista`, open Share without expanding the zones, then Copy as image: the card lists `.dev`, `.xyz` and `.sh`, not only `.dev`.
- [ ] `pick-click` — click `firk.in` in the list: the field reads `firkin`, and the results show `firk.in` and `firkin.com`. Click a `.com` pick: the field holds its bare label.
- [ ] `sticky-heading` — scroll down the list: "Up for grabs" stays at the top; press the redraw there and the page does not scroll.
- [ ] `privacy-line` — open "private" in the byline: it reads "Your browser checks names directly, so we never see them and can't steal them."
- [ ] `catalogue` — the home page lists the picks as before, and the build fails if a key is not a domain, a field is missing, or a hack's domain does not end with its `pattern`.
- [ ] `blurbs` — skim the list: every blurb reads "Tagline. A x or a y." with the right articles.
- [ ] `og-card` — `card.og.png` shows four names, no two sharing a pattern, and "+ 206 more".
- [ ] `premiums` — `pnpm names recheck` (with the Porkbun keys set) prints nothing for the listed names.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `toast` | manual-only | — | Size and timing are visual feel; checked by screenshot at 0.3, 0.9 and 1.5 s |
| `edit-focus` | e2e | — | Click Edit, assert `document.activeElement` is the textarea; checked by a Playwright run |
| `card-rows` | e2e | — | Read the clipboard image after Copy as image; checked by a Playwright run |
| `pick-click` | e2e | — | Click a pick, assert the field value; checked by a Playwright run |
| `sticky-heading` | e2e | — | Scroll into the list, redraw, assert `scrollY` unchanged; checked by a Playwright run |
| `privacy-line` | manual-only | — | Copy; read it |
| `catalogue` | unit | — | The loader throws on a malformed entry |
| `blurbs` | unit | — | `deck/lib/uses.ts` composes the sentence |
| `og-card` | manual-only | — | `variedPicks` picks the names; the look is visual |
| `premiums` | integration | — | Needs the registrar's keys and network |

https://claude.ai/code/session_01DaohkC3gUYw8Lg6Yop1AKH
https://claude.ai/code/session_01DaohkF5yiTVEPDEzVT7g7Y

---

## Comments

- **C01** @vzakharov (agent) — 2026-11-04T02:18:37Z — "Proposed squash body: ``` unsquatted.com's list of free name…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-11-04T02:18:37Z

[https://github.com/vzakharov/vovazakharov.com/pull/244#issuecomment-6620759124](https://github.com/vzakharov/vovazakharov.com/pull/244#issuecomment-6620759124)

Proposed squash body:

```
unsquatted.com's list of free names had grown to a hundred files of
frontmatter, nearly every name a two-word compound, and some names it
called free were registry premiums at hundreds of dollars a year.

The list is now one YAML catalogue keyed by domain, 210 names strong.
Each entry states its form (compound, phrase, word, respelling,
coinage or domain hack), and its blurb is composed from a tagline and
a short list of uses, so every one reads "Tagline. A x or a y." The
runbook spreads a run across forms as it already does across axes.

The naming script checks a hack in any zone the page can verify, and
asks the registrar's keyed price check about every name RDAP calls
free, sending premium and reserved ones to the ledger. Each hack names
its pattern (`*st.one`), and the social card shows one per pattern.

On the page, Copy as image lists free domains under the fold too,
since reaching for the share button looks them up; its receipt is
larger and stays longer; and Shortlist → Edit puts the caret in the
textarea.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (agent) — COMMENTED

_2026-11-04T03:26:29Z_

[https://github.com/vzakharov/vovazakharov.com/pull/244#pullrequestreview-5762802962](https://github.com/vzakharov/vovazakharov.com/pull/244#pullrequestreview-5762802962)

**/five-percent**: 1 proposal, 0 critical

<!-- five-percent: 4abd8c4ade8c68e7bc0711b605b1f6e6a20c4b0c -->

<a id="r02"></a>

### R02 — Review by @vzakharov (agent) — COMMENTED

_2026-11-04T03:58:05Z_

[https://github.com/vzakharov/vovazakharov.com/pull/244#pullrequestreview-5763012961](https://github.com/vzakharov/vovazakharov.com/pull/244#pullrequestreview-5763012961)

**/five-percent**: одно предложение, критическое.

<!-- five-percent: 18a5c27e8a542748f208537d209213fa3f7c1821 -->

- **T01** `src/unsquatted/pages/home/field-tools/ui/field-tools.tsx`:91 — unresolved — last: @vzakharov (human) 2026-11-04T04:19:37Z — "да, давай" → [↓](#t01)
- **T02** `src/unsquatted/pages/home/checker/config/messages/en.json`:6 — unresolved — last: @vzakharov (agent) 2026-11-04T03:58:54Z — "Верно: для `.io`, `.co` и `.me` браузер спрашивает dns.googl…" → [↓](#t02)
- **T03** `sites/unsquatted/public/card.og.png`:1 — unresolved — last: @vzakharov (human) 2026-11-04T04:14:22Z — "те 4 что сейчас автоматически выбраны как "самые крутые"? ес…" → [↓](#t03)
- **T04** `src/unsquatted/pages/home/deck/model/picks.yaml`:1 — unresolved — last: @vzakharov (human) 2026-11-04T04:17:50Z — "не хочется чтобы будущий агент случайно прочёл это разом, да…" → [↓](#t04)

<a id="t01"></a>

### `src/unsquatted/pages/home/field-tools/ui/field-tools.tsx`:91 — unresolved

```diff
@@ -84,6 +88,8 @@ function ShareMenu({ typed, drawCard, copy }: ShareMenuProps) {
             className={classes['tool']}
             aria-label={copy.share}
             title={copy.share}
+            onPointerEnter={onReached}
```

**@vzakharov (agent)** — 2026-11-04T03:26:29Z

**Optional.** Поиск по скрытым зонам начинается, когда наводят курсор на кнопку «поделиться» или ставят на неё фокус. А «Copy as image» рисует карточку сразу, из тех ответов, что уже пришли. Если нажать быстро, особенно на телефоне, где наведение и тап случаются одновременно, на карточке всё равно не будет зон из-под «more tlds».

Другой путь: отдать в буфер обмена не готовую карточку, а промис на неё. `ClipboardItem` принимает `Promise<Blob>`, это уже используется в `src/shell/shared/ui/use-copied.ts:23`. Тогда карточка рисуется, когда завершатся висящие запросы, а браузер всё равно засчитывает это как действие пользователя.

Цена: в `useCopied` появляется ветка для промиса, и нужно ждать ещё не завершённые запросы.

**@vzakharov (human)** — 2026-11-04T04:19:37Z

да, давай

---

<a id="t02"></a>

### `src/unsquatted/pages/home/checker/config/messages/en.json`:6 — unresolved

```diff
@@ -3,7 +3,7 @@
… 1 line elided …
   "byline": "Curated, {private}, {blazing}.",
   "private": "private",
-  "privateWhy": "Your queries never leave your browser, so we can’t steal them. Oh, and we’re {openSource}.",
+  "privateWhy": "Your browser asks the registries itself, so your queries never reach us and we can’t steal them. Oh, and we’re {openSource}.",
```

**@vzakharov (agent)** — 2026-11-04T03:58:03Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · critical

Новая строка говорит, что браузер спрашивает реестры сам. Но не у всех зон реестр отвечает браузеру, и тогда чекер спрашивает Google Public DNS (`dns.google`). Это происходит на каждой проверке: `.io`, `.co` и `.me` из основного списка зон не имеют RDAP в справочнике IANA. Получается, что обещание о приватности на странице неточное: запросы не доходят до нас, но часть из них доходит до Google.

**Предложение: назвать в строке и Google**, например: «Your browser checks each name itself — with the registry, or with Google’s public DNS where a registry won’t answer a browser — so your queries never reach us and we can’t steal them. Oh, and we’re {openSource}.»

**Цена:** строка становится длиннее, а «Google» рядом со словом «private» может читаться как минус. Есть и другой путь: убрать из строки, кого именно спрашивает браузер, и оставить только «never reach us».

<details><summary>Подробнее</summary>

- `src/unsquatted/pages/home/verdict/lib/check-domain.ts`: `checkDomain` идёт в RDAP, если зона есть в `https://data.iana.org/rdap/dns.json` и реестр отвечает на CORS-запрос. Иначе он идёт в `https://dns.google/resolve`.
- Справочник IANA на сегодня: `com`, `net`, `org`, `ai`, `si`, `app`, `dev` там есть, а `io`, `co`, `me` и `de` нет. Все три первые входят в `ZONES` (`checker/lib/rows.ts`), поэтому любое набранное имя уходит в Google как минимум трижды.
- В черновике в `relay-3.md` § 8 было «we never see what you check», и этот вариант был верен. В коммите b4db7d7 появилось «asks the registries itself».

</details>

**@vzakharov (agent)** — 2026-11-04T03:58:54Z

Верно: для `.io`, `.co` и `.me` браузер спрашивает dns.google. Фраза теперь называет и реестры, и публичный DNS Google — 7e8dda2

---

<a id="t03"></a>

### `sites/unsquatted/public/card.og.png`:1 — unresolved

**@vzakharov (human)** — 2026-11-04T04:14:22Z

те 4 что сейчас автоматически выбраны как "самые крутые"? если да,давай снизим чуть у firk.in, чтобы не было и .ing, и .in в одном списке, да и по мне не так круто это звучит

---

<a id="t04"></a>

### `src/unsquatted/pages/home/deck/model/picks.yaml`:1 — unresolved

**@vzakharov (human)** — 2026-11-04T04:17:50Z

не хочется чтобы будущий агент случайно прочёл это разом, давай пропишем (если ещё нет) в ранбуке читать это программно или выборочно строками

---

## Timeline (status, references, and other events)

- **2026-11-04T02:18:38Z** @vzakharov renamed from «feat(unsquatted): one catalogue file, names in other forms, three UI fixes» to «feat(unsquatted): one catalogue, names in other forms, three UI fixes».
- **2026-11-04T03:26:29Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/244#pullrequestreview-5762802962.
- **2026-11-04T03:27:24Z** @vzakharov renamed from «feat(unsquatted): one catalogue, names in other forms, three UI fixes» to «feat(unsquatted): 210 names in one catalogue, premiums out, UI fixes».
- **2026-11-04T03:58:05Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/244#pullrequestreview-5763012961.
- **2026-11-04T04:21:35Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/244#pullrequestreview-5763118076.

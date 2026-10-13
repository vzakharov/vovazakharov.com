# Relay 1 — Latin-first spelling for songs

## 1. Standing constraints

None stated beyond the repo's own rules. One operator principle governs the build-out: the Mithqal behaviour must be driven by a prop/parameter, "а не "в mithqal вот так"".

## 2. The conversation

**Operator (opening, verbatim):**

> давай изменим механику транслитерации:
>
> Первый раз при показе песни на другом (по сравнению с локалью) языке сперва всегда показываетс транслитерация на латинице (именно на ней, даже если локаль русская -- при этом разумеется это относится только к песням на НЕрусском, сам русский в русской локали транслитерировать не надо).
>
> При этом вылезает tip: "Нажми сюда, чтобы видеть текст на оригинальном языке"
>
> Соответственно, нажатие на названии песни (именно на странице песни, где это нажатие больше никуда вести не может) меняет латиницу на оригинальное написание.
>
> Как это сделать, вопрос. Либо программно по детерминистическим правилам (учитывая количество русских песен, которые иначе бы пришлось вручную все прописывать транслитом), либо вручную (как например сейчас в Mithqal)
>
> Отображать при этом именно в случае Mithqal в обоих режимах нужно все равно с оригинальным текстом (из религиозных соображений), в остальных только транслитерацию (в режиме транслитерации). Но определять надо это каким-то пропом/параметром, конечно, а не "в mithqal вот так"
>
> если что упустил, скажи/спроси прежде чем делать

**Operator (mid-turn):** «соответстенно все OG-шки русскоязычных песен на английском должны стать транслитреированными»

**Agent:** Routed through `/task` toward a plan. It found that a BGN-style rule reproduces 65 of the 67 hand-written title transliterations and asked eight questions: script vs language, persistence, scope, toggle direction, the gloss line, Mithqal's title, the source of the Latin, and the tip wording.

**Operator (verbatim):**

> 1 оставить кириллицей, да, конечно
> 2 ага, но мелькания будут при загрузке да? (а, ты ответил в конце -- но поясни благодаря чему это реализуется пжст)
> 3 да, именно так: меняем на странице песни (кстати по клику должен тоже появляться тип -- нажмите чтобы переключиться обратно на транслитерацию), после этого _все_ упоминания соответствующих артистов/альбомов/песен и тп с этим решением
> 4 да, но про подсказку см. выше
> 5 нет, в суть была как раз убрать ещё одну лишнюю отображаемую строчку, т.е. в режимах меняется только написание Nochnoy sad / Ночной сад, а подпись остаётся та же
> 6 - с ним в режиме латиницы _текст на любом другом скрипте_ остаётся.
> 7 а в арабском автоматики не получится? про "е" в русском -- разве не детерминистический подход, когда мы перечисляем всё после согласных (типа не-ne, пе-pe, ре-re; а всё остальное становится ye)? Для мягкого знака должно быть как в Schadina специальным апострофом
> 8 "Tap to see..." думаешь here нужно?

**Operator (mid-turn, verbatim):** «обрати внимание ещё: эта механика непонятно как относится к песням, где названия латиницей или кириллицей, но в них есть текст на других скриптах (`in-the-end`, `farewell`) -- предлагаю с ними ничего не делать, оставить как сейчас, genius-подсказками. но осадочек остаётся. если есть идеи как это лучше имплементировать, советуй»

**Agent:** Wrote the plan and published it as draft PR #148, with a squash proposal comment. It explained the no-flash mechanism (both spellings in the HTML, a head script setting `data-script` on `<html>` before paint, as Mantine's `ColorSchemeScript` does). It agreed on the е rule and said Arabic and Tatar can't be romanized by rule. On mixed-script songs: farewell's Chinese stays with its footnote, and `<ruby>` is proposed as a follow-up; In the End is a whole-Arabic song, so it gets an `ar-latn` section. It asked five follow-ups: ё after hushers, artist overrides, italics, the tip lifecycle, and In the End.

**Operator (verbatim):**

> 1 -o, да
> 2 - добавить в таблицу замен, ые = ye, ый = y, второе Gryobany bal получится, и так ок
> 3 да
> 4 ок
> 5 не очень понял но доверяю)
>
> давай начинать

**Agent:** Flipped the plan to in-progress with that go-ahead and folded in the answers. It implemented step 1 (the romanizer and its tests), then paused at its context budget and relayed.

## 3. Intent

Latin by default wherever the locale doesn't read the script natively. The song title on its page is the single switch to the original spelling; the choice is remembered site-wide and applies to every song, artist and album name. Metadata (OG, `<title>`, feeds) under `en` is Latin. There is less on screen, not more: the gloss line keeps only the translation. Ruled out: transliterating Cyrillic under `ru`, including Tatar; hard-coding Mithqal; and touching third-script lines inside other songs (farewell's Chinese).

## 4. Decisions

- **Script, not language**: under `en`, anything non-Latin; under `ru`, anything neither Latin nor Cyrillic.
- **The Russian rule**, in `src/pages/music/lib/romanize.ts`:
  - е → `e` after a consonant, `ye` otherwise (the operator's own rule);
  - ё → `o` after ж ч ш щ, `yo` otherwise;
  - ые → `ye`, ый → `y` (the operator: "добавить в таблицу замен");
  - ь/ъ → `ʼ` U+02BC, as in Schadina;
  - artists and albums go by rule with no overrides, so _Gryobany bal_ and _Poluzhivye_ — the operator: "и так ок".
- **Arabic, Greek and Tatar are hand-written.** The operator asked whether Arabic could be automatic. Answer: unvowelled text, plus article assimilation, wasla and pausal endings, make it unreliable; Tatar has vowel-harmony к/г.
- **`keepsScript`** (frontmatter flag, name from the plan): in Latin mode, text in any non-Latin script stays and the romanization sits under it; original mode shows the script alone.
- **The tip**:
  - on a first visit it stays until a click or ×, and the × is remembered;
  - after any click it shows the way back and fades after ~4 s;
  - it says "Tap" or "Click" by `(hover: hover)`, without "here".
- **Italics** for every Latin spelling: yes.
- **In the End** gets an `ar-latn` section from its footnote. The operator: "не очень понял но доверяю".
- **farewell's Chinese** stays as is, with its footnote. `<ruby>` with inline `{汉字|pinyin}` markup is a follow-up issue, not in this PR.

## 5. Errors and dead ends

- Deleting the old remote branch `claude/sweet-newton-ymni59` failed ("remote end hung up"). It had no PR, so it just lingers.
- Lint conflict on code-point splitting: `@typescript-eslint/no-misused-spread` forbids `[...text]` and `unicorn/prefer-spread` forbids `Array.from`. `text.match(/./gsu) ?? []` satisfies both.

## 6. State

- Branch `claude/latin-first-transliteration-ymni59`, with head 7147e5c pushed before this summary.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/148, with the squash proposal in `docs/remove-before-merging/squash-message.md` and as a PR comment.
- Plan: `docs/plans/latin-first-transliteration.paused.md`. Its `## Progress` section says step 1 is done (dfa1927).
- Nothing is running: no CI on PRs in this repo, no subscriptions, no check-ins.
- Estimate:
  - this session: 2 h senior architect ("the plan settles a script-not-language rule, a no-flash preference and a manual-versus-rule split that each shape several layers, and needed an operator round to close") and 1 h senior developer ("the romanizer's е/ё/pair and casing rules want care to be exactly deterministic");
  - remainder handed on: 9 h senior developer (the static-export switch, the remembered preference, the schema change across ~70 songs and every name surface), 1 h middle qa (both locales, both modes, fresh and stored preference), 1 h middle copywriter (the tip in two languages, the Tatar and Arabic romanizations).

## 7. Pointers

- `docs/plans/latin-first-transliteration.paused.md` — the plan: steps 2–12, DRY notes, settled decisions.
- `src/pages/music/lib/romanize.ts` and its test — done.
- Surfaces the plan touches (step 7 lists them):
  - `src/pages/music/lib/{song-text,title-gloss,transliteration,player-state,songs,projects,albums,music-metadata}.ts`;
  - `src/pages/music/ui/{song-page,song-name,lyrics,transliteration-toggle,title-gloss-line,catalogue-grid,song-list,player-bar,artist-page,album-page,catalogue-header}.tsx`;
  - `src/pages/music/lib/use-audio-player.ts` (Media Session);
  - `src/shared/content/feeds.ts`, `src/pages/home/ui/work-section.tsx`;
  - `src/shared/music-catalogue/frontmatter.ts`;
  - `src/app/ui/root-layout.tsx` (head script beside `ColorSchemeScript`);
  - `.claude/rules/songs.md` (its title and romanization paragraphs need rewriting).
- Content: `apps/vova/public/music/{mithqal,agios-o-skopos,in-the-end,minem-babay}.md`, plus the 67 songs with a `transliteration:` line in frontmatter.
- Predecessor transcript: https://claude.ai/code/session_01DGp7py5xxyXaFxhwa5kzy8

## 8. Next step

Resume the paused plan via `/go` from its Step 1, starting at plan step 2 (the spelling model). The go-ahead was given in this session: «давай начинать».

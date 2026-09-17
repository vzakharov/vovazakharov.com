# PR #56: perf: trim the client payload, and hold both cuts by the build

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/56
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/trim-client-js-npdqn6
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-17T01:44:43Z
- **Updated:** 2026-09-17T16:52:14Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **Mantine's stylesheets are named one at a time instead of the aggregate.** `@mantine/core/styles.layer.css` concatenates ~200 component stylesheets; this site renders 14 of them. `theme-provider.tsx` now imports those plus Mantine's three core files, taking each site's CSS from 250 kB to 67 kB raw and **37.4 kB to 12.0 kB gzipped**, with all 353 `--mantine-*` variables still declared.
- **Nothing on this site translates in the browser, so next-intl's client runtime (48 kB raw, **14 kB gzipped**) leaves every page.** Each locale is already a page of its own in the export — `/cv/cto/en` and `/cv/cto/ru` are separate files, each carrying its own language's text, and the language chips are plain `<a href>`. The runtime was there because `cv-sheet.tsx` carried `'use client'`, and once a component is client-side a hook is the only way copy reaches it; it was paying to hydrate text that never changes. Nothing in the CV subtree needs the client — no state, no handlers, no colour scheme — so the sheet and its leaves render on the server and read `cvMessages(locale, variant)` as the typed object it already was, every key checked by `tsc` rather than by a message-key string. `richText` renders the one markup a catalogue string carries, `<strong>`, and throws on any other tag. **The rendered markup is byte for byte what it was**, on all four pages diffed.
- **Which makes the constraint "no page ships the runtime" — and that a lint rule can hold with no exemptions.** `@typescript-eslint/no-restricted-imports` rejects the bare `next-intl` specifier repo-wide, type imports aside, and its message names `.claude/rules/i18n.md` as where lifting the ban is decided. That is the thing a path glob could never be: the earlier round of this PR exempted `src/pages/cv/ui/**` by name, which reads today's set of localized pages as the permanent one.
- **Both savings still go wrong silently, so a check reads the build for each.** Omitting a Mantine sheet leaves the component compiling, type-checking, building and rendering unstyled, so `check-mantine-styles.ts` compares the `m_*` classes in each site's built HTML against the rules in that site's built CSS — which is what makes it cover sheets Mantine composes in internally (`Button` renders `UnstyledButton`'s class, which no import names). `check-i18n-payload.ts` is the second guard on the runtime, for the transitive path a lint rule cannot see, and it keeps its own honesty differently now that no page is expected to carry it: the run asserts each marker still appears in the installed next-intl before trusting them against the build.
- **`deploy.yml` now publishes on `perf:` too.** On a static export a change that makes a page cheaper to load is a change to the files the CDN serves, so the gate skipping `perf:` meant a merge like this one landed on `main` unserved until someone ran `workflow_dispatch` by hand.
- **Net, per page, gzipped over everything the page references: 255.3 kB → 213.1 kB** on the homepage (−16.5%), and **266.2 kB → 212.3 kB** on the CV (−20.2%), measured off `main` and this branch with the same script. Behaviour is unchanged throughout.

**The committed CV PDFs move with this, and the reason is worth knowing.** They are printed from a dev server, where the client-rendered sheet drew eight link underlines the export does not — so they said something the served page never did. All four were re-rendered and each now matches, byte for byte under `sameRender`, what the built site prints over a static host. `render-pdf.ts`'s docstring carried the claim that dev and export print the same page; it now carries the condition under which that is true.

Three comments that had been guarding the i18n invariant are gone — the machinery carries it, and `.claude/rules/i18n.md` carries the reasoning. One of the three was a polar bear: it denied the provider the same commit had just removed. That rule is scoped to the translation machinery — `src/shared/i18n/**` and the payload check — rather than to `src/pages/cv/**`, which would have read today's one localized page as the permanent set, the same defect as the path glob this PR replaced.

**The prose the machinery replaced is cut rather than kept alongside it.** `check:i18n-payload`'s entry in CLAUDE.md § "Vetting" is one sentence: everything else it said sits in the script's own header, and the always-resident file earns only what holds of the vet list — here, that reading the finished build is what lets the check overlap the others. #59 owes the same pass to the other checks whose scripts explain themselves.

Also here, found by running the checks rather than by design: Prettier ignores `docs/issue` and `docs/pr`. `/finalize` vets at step 1 and sweeps the exports at step 3, so a committed PR export failed `format:check` on any branch carrying one — and since `/handle` commits one every turn, this was the first branch to reach it.

## QA Checklist

- [ ] `render-light` — open `/`, `/cv`, `/writing` and a case study in the light theme; every card border, chip, heading, list and code span is styled as before.
- [ ] `render-dark` — the same four pages with the OS set to dark; nothing is invisible against its surface.
- [ ] `toggle-label` — inspect the top-right theme control; its `aria-label` reads "Toggle theme", and clicking it still cycles light → dark → system.
- [ ] `cv-locales` — open `/cv/cto/ru` and `/cv/cto/en`; the Russian CV is in Russian, the English one has no Cyrillic, and the language chips still switch between them.
- [ ] `cv-print` — print-preview `/cv/cto/ru`; the printed-only addresses appear, the screen-only chrome does not, and the links carry no underline — which is what the committed PDF now shows.
- [ ] `sheet-guard` — delete one `@mantine/core/styles/*.layer.css` import from `theme-provider.tsx`, run `pnpm build && pnpm check:mantine-styles`, and confirm it fails naming that import; restore it.
- [ ] `import-guard` — add `import { useTranslations } from 'next-intl'` to any component and confirm `pnpm exec eslint` rejects it, while `import type` from the same specifier passes.
- [ ] `payload-guard` — give a page its own `NextIntlClientProvider` with a client child calling `useTranslations`, run `pnpm build && pnpm check:i18n-payload`, and confirm it names that page and its chunk; restore it.
- [ ] `marker-guard` — replace one entry of `RUNTIME_MARKERS` with a string next-intl does not contain and confirm `pnpm check:i18n-payload` fails before it reads the build at all.
- [ ] `deploy-gate` — after merge, confirm the Actions run triggered on `main` reports "Deploying" rather than "Skipping the deploy" for a `perf:` subject.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `render-light` | manual-only | — | Whether a page *looks* right against its design is human judgment; the guards prove every rendered class has rules, not that the result is handsome. |
| `render-dark` | manual-only | — | Same, plus contrast, which is exactly what an assertion cannot settle. |
| `toggle-label` | e2e | ❌ | Drive a built page, assert the control's `aria-label` and that clicking it advances `data-mantine-color-scheme`. |
| `cv-locales` | integration | ❌ | Render both CV routes from the export and assert the expected script in each. Run by hand here, and the markup diff against the previous build is the stronger version of it. |
| `cv-print` | covered | ✅ | `pnpm content:pdf --check` hashes the sources, and the four PDFs were each compared against a print of the built site over a static host — the comparison the docstring now asks for. |
| `sheet-guard` | unit | ❌ | The pattern is `scripts/type-overlap-check.test.ts`: write a throwaway HTML/CSS pair to a temp dir, run the script against it, assert exit code and report text. |
| `import-guard` | unit | ❌ | `RuleTester` over the config would assert it; run by hand here, both directions. |
| `payload-guard` | unit | ❌ | Same temp-dir pattern, but it needs the script to take a scan root rather than deriving it — a change to production code for the test's benefit. Run by hand here against a real build. |
| `marker-guard` | unit | ❌ | The cheapest of the four to automate, and the one whose failure is silent: point the resolver at a fixture directory and assert the run refuses. |
| `deploy-gate` | unit | ❌ | The gate is shell inside a workflow step. Testable by extracting the matcher to a script the suite can run, which is more structure than one regex has earned. |

https://claude.ai/code/session_01KPvLWh7spBMbSvLnCV7hgG

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-17T01:45:12Z — "Proposed squash title/body: ``` perf: ship only the CSS and…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-17T01:45:12Z

[https://github.com/vzakharov/vovazakharov.com/pull/56#issuecomment-5707162574](https://github.com/vzakharov/vovazakharov.com/pull/56#issuecomment-5707162574)

Proposed squash title/body:

```
perf: ship only the CSS and i18n runtime each page uses (pr #56)
```

```
Every page carried Mantine's entire stylesheet and next-intl's client
runtime for a fraction of either: 14 of ~200 component stylesheets are
rendered anywhere on the site, and the only client component outside the
CV read a single aria-label. Per page, gzipped, that was 210.9 kB on the
homepage against 169.8 kB now, and 221.5 kB against 195.2 kB on the CV.

`theme-provider.tsx` names Mantine's three core stylesheets and one per
component in use rather than the aggregate `styles.layer.css`, and
`ThemeCorner` translates the toggle's label with `getTranslations` and
passes it down, which takes `NextIntlClientProvider` out of the root
layout. The CV keeps its own provider and its own messages, that subtree
being where translation at runtime is earned; the shell's provider
carried no locale of its own, so the label resolves exactly as before.

Both savings go wrong silently, so a check holds each, and both read the
built output rather than the import graph: what a page costs is not a
property of the file an import sits in. A missing stylesheet compiles,
type-checks, builds and renders unstyled, so `check-mantine-styles.ts`
answers each site's rendered classes from that site's own CSS.
`useTranslations` in a client component is worse than broken — it works,
and bills that page 14 kB — so `check-i18n-payload.ts` reads the chunks
each page references and permits the runtime only where a locale from
`routing.locales` addresses the page. That set is derived, so localizing
a page permits it by existing at its locales, with no allowlist to
extend. `.claude/rules/i18n.md` is the reasoning's one home.

`deploy.yml` publishes on `perf:` as well as `feat:` and `fix:`: on a
static export a change that makes a page cheaper to load changes the
files the CDN serves, so the gate skipping it left an improvement merged
and unserved.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `docs/remove-before-merging/squash-message.md`:32 — resolved — last: @vzakharov (agent) 2026-09-17T10:06:26Z — "Сделано: гейт публикует на `feat|fix|perf`, набор префиксов…" → [↓](#t01)
- **T02** `src/app/ui/root-layout.tsx`:59 — resolved — last: @vzakharov (agent) 2026-09-17T10:06:27Z — "Медведь, согласен — комментарий отрицал провайдер, который э…" → [↓](#t02)
- **T03** `src/app/ui/theme-corner.tsx`:13 — resolved — last: @vzakharov (agent) 2026-09-17T11:26:08Z — "Поправка к моему предыдущему ответу в этом треде: он был нев…" → [↓](#t03)
- **T04** `src/app/ui/theme-provider.tsx`:22 — resolved — last: @vzakharov (agent) 2026-09-17T10:06:29Z — "Да, обе стороны — `pnpm check:mantine-styles` в развёртке ve…" → [↓](#t04)
- **T05** `.claude/rules/i18n.md`:5 — resolved — last: @vzakharov (agent) 2026-09-17T12:07:17Z — "Прав по обоим пунктам, но по-разному. `.json`-ы уже привязан…" → [↓](#t05)
- **T06** `eslint/rule-groups/typescript.ts`:134 — unresolved — last: @vzakharov (human) 2026-09-17T16:17:34Z — "посмотри через gh (НЕ add_repo) playgramai/playgramapp и его…" → [↓](#t06)
- **T07** `src/shared/i18n/rich-text.tsx`:1 — unresolved — last: @vzakharov (human) 2026-09-17T16:51:32Z — "бррр, я тотально запутался. Что у нас за пляски с бубнами, ч…" → [↓](#t07)
- **T08** `CLAUDE.md`:78 — resolved — last: @vzakharov (agent) 2026-09-17T12:08:11Z — "Сокращено до предложения, тикет заведён: #59. Абзац был вдво…" → [↓](#t08)

<a id="t01"></a>

### `docs/remove-before-merging/squash-message.md`:32 — resolved

```diff
@@ -0,0 +1,39 @@
… 26 lines elided …
+at runtime is earned. The shell's provider carried no locale of its own,
+so the label resolves exactly as before.
+
+Per page, gzipped: 210.9 kB to 169.8 kB on the homepage, and 221.5 kB to
+195.2 kB on the CV. `deploy.yml` publishes on `feat:` and `fix:` alone,
+so this one needs a `workflow_dispatch` run after merge.
```

**@vzakharov (human)** — 2026-09-17T09:44:09Z

разумеется, измени правило чтобы на perf: тоже шипилось

**@vzakharov (agent)** — 2026-09-17T10:06:26Z

Сделано: гейт публикует на `feat|fix|perf`, набор префиксов теперь одна переменная — его читают и матч, и извлечение скоупа. 6a0c783

Заодно поправил и обратную сторону: в CLAUDE.md § Deployment и в строке `perf:` из § Git conventions, чтобы правило не осталось верным в одном месте и тихо неверным в трёх. Из предложения на squash фраза про ручной `workflow_dispatch` убрана — она стала неправдой.

---

<a id="t02"></a>

### `src/app/ui/root-layout.tsx`:59 — resolved

```diff
@@ -53,13 +52,16 @@ export function RootLayout({
       <head>
         <ColorSchemeScript defaultColorScheme="auto" />
       </head>
+      {/*
+        A subtree that translates at runtime provides for itself — `CvPage` does,
+        with the messages it needs. A provider here would instead put next-intl's
+        client runtime in every page's bundle, to serve the CV alone.
+      */}
```

**@vzakharov (human)** — 2026-09-17T09:44:31Z

медведь. если ты про то чтобы это сюда обратно не вернулось, засунь лучше в правило привязанное к i18n-шным джсонам: если кто-то захочет когда-то это сюда вставить, он будет править и их, и правило всплывёт

**@vzakharov (agent)** — 2026-09-17T10:06:27Z

Медведь, согласен — комментарий отрицал провайдер, который этот же коммит и убрал. Удалён. be4893e

Правило переехало в `.claude/rules/i18n.md` с `paths: src/shared/i18n/**` (это и каталоги `messages/*.json`) и `src/pages/cv/ui/**` — ровно по твоей логике: кто захочет переводить на новой странице, пойдёт добавлять ключ в json, и правило всплывёт. Плюс то, чего прозой не добиться: линтер теперь запрещает сам импорт (см. соседний трэд).

---

<a id="t03"></a>

### `src/app/ui/theme-corner.tsx`:13 — resolved

```diff
@@ -6,11 +8,16 @@ import classes from './theme-corner.module.scss';
… 2 lines elided …
  * corner, which a page's own first line has to clear.
+ *
+ * Async because it translates the toggle's label, which the toggle itself must
+ * not do — `ThemeToggle`'s own docstring says why.
… 4 lines elided …
```

**@vzakharov (human)** — 2026-09-17T09:47:31Z

вместо докстринга (этого и других где это подойдёт) давай сделаем линтерное правило чтобы в клиентских компонентах нельзя было делать getTranslations. Я ведь правильно понимаю проблему?

**@vzakharov (agent)** — 2026-09-17T10:06:28Z

Правило сделал, докстринги убрал — но проблему ты понимаешь не совсем так, и правило поэтому смотрит в другую сторону. be4893e

`getTranslations` в клиентском компоненте и так падает: next-intl резолвит `next-intl/server` через export condition `react-server`, так что в клиентский бандл попадает заглушка, каждый экспорт которой кидает `` `getTranslations` is not supported in Client Components ``. Плюс клиентский компонент не может быть async, так что дотуда в норме и не доходит. Громко, само, без нас.

Тихий случай — обратный. `useTranslations` в клиентском компоненте **работает**: собирается, рендерится, переводит правильно — и молча вешает на эту страницу клиентский рантайм next-intl, 14 кБ gzip. Именно это и охраняли три комментария, которые ты просишь убрать.

Так что запрещён голый спецификатор `next-intl` (это и есть клиентский вход) вне `src/pages/cv/ui/**`, через `@typescript-eslint/no-restricted-imports`. `next-intl/server`, `/routing`, `/plugin` — отдельные пути, их не трогает; type-only импорты разрешены, претензия к байтам, а не к связности. В сообщении правила сразу написан выход — перевести на сервере и передать пропом, — чтобы оно учило, а не только запрещало. Проверил в обе стороны: на `theme-toggle.tsx` срабатывает, внутри CV проходит.

Правило для `getTranslations` в клиенте добавлять не стал: это был бы третий страж над тем, что уже падает дважды. Скажи, если всё равно хочешь его в редакторе — сделаю, но это уже не про байты.

**@vzakharov (agent)** — 2026-09-17T10:22:01Z

Прав, глоб выкинул. 5b23b9e

А твой вариант не работает по другой причине, и она же объясняет, почему линтерное правило тут в принципе не годится: **локализованная страница переводит именно на клиенте** — чтобы читатель переключал язык без навигации. Поэтому все легитимные вызовы `useTranslations` сидят в клиентских компонентах: `cv-sheet.tsx`, `locale-picker.tsx`, `other-variant-link.tsx`. «Клиентский компонент» — не тот признак, по которому можно отличить законный вызов от лишнего. Единственное, что остаётся линтеру, — путь. То есть список, который ты и не хочешь.

Цена — свойство **страницы**, значит мерить надо страницу. `pnpm check:i18n-payload` читает `apps/*/out`: для каждой страницы берёт чанки, на которые она ссылается, и ищет в них рантайм next-intl. Разрешены только те страницы, к которым ведёт локаль — локаль из `routing.locales`, в своём маршруте или под ним (второе покрывает `/cv` и `/cv/cto`, у которых своего сегмента локали нет). **Новая локализованная страница разрешается тем, что существует по своим локалям.** Ни здесь, ни в `eslint.config.ts` списка больше нет.

Проверил на настоящих сборках, все три направления:

| | результат |
|---|---|
| `music` со своим `NextIntlClientProvider` | собирается, рендерится, переводит — и ловится: `vova:/music (a494852058aea87e.js)` |
| та же страница, отрендеренная по `/music/en` и `/music/ru` | проходит, без правки списков |
| маркеры заменены на несуществующий | падает на всех 7 страницах CV |

Последнее — не просто тест. Локализованная страница, которая рантайм **не** несёт, тоже роняет проверку: иначе новая версия next-intl тихо превратила бы её в проверку, которая всё пропускает.

Побочная находка из первого теста: `useTranslations` в шелле теперь ломает саму сборку — провайдера в корневом лейауте больше нет, так что префендер падает. Так что тихий случай, ради которого всё это, — именно новая страница со своим провайдером, ровно то, что ты и описал как «мы будем добавлять».

**@vzakharov (agent)** — 2026-09-17T11:26:08Z

Поправка к моему предыдущему ответу в этом треде: он был неверен, и правило всё-таки твоё.

Я написал, что локализованная страница переводит на клиенте, «чтобы читатель переключал язык без навигации». Это не так — я это утвердил, не открыв `locale-picker.tsx`. Он рендерит обычные `<a href>`, а `/cv/cto/en` и `/cv/cto/ru` — отдельные файлы в экспорте, каждый со своим текстом. Переключения на месте здесь нет вообще, и рантайм платил за гидратацию текста, который не меняется.

Так что клиентский рантайм i18n не нужен ни одной странице, и это ровно тот инвариант, который линтер держит без исключений. `@typescript-eslint/no-restricted-imports` отклоняет голый `next-intl` по всему репозиторию (type-only импорт разрешён — он ничего не весит); `check-i18n-payload` остался вторым эшелоном, для транзитивного пути, которого линтер не видит, и перед тем как верить своим маркерам проверяет, что они всё ещё есть в установленном next-intl.

CV рендерится на сервере целиком, разметка байт в байт прежняя, страница полегчала на 26.9 кБ gzipped.

Побочно: закоммиченные PDF-ы CV печатались с восемью подчёркиваниями ссылок, которых у собранного сайта нет. PDF снимается с dev-сервера, где лист гидратировался; теперь все четыре совпадают с печатью экспорта. a3f7c9f 3344c3e c98fc90

---

<a id="t04"></a>

### `src/app/ui/theme-provider.tsx`:22 — resolved

```diff
@@ -1,6 +1,25 @@
 'use client';
 
-import '@mantine/core/styles.layer.css';
+// Core sheets first, then one per component in use — a component rendered
+// without its sheet is invisible breakage, and `pnpm check:mantine-styles` is
+// what catches it. `.claude/rules/styling.md` § Styling carries the rest.
+import '@mantine/core/styles/baseline.layer.css';
+import '@mantine/core/styles/default-css-variables.layer.css';
+import '@mantine/core/styles/global.layer.css';
+import '@mantine/core/styles/ActionIcon.layer.css';
+import '@mantine/core/styles/Anchor.layer.css';
+import '@mantine/core/styles/Button.layer.css';
+import '@mantine/core/styles/Center.layer.css';
+import '@mantine/core/styles/Container.layer.css';
+import '@mantine/core/styles/Divider.layer.css';
+import '@mantine/core/styles/Group.layer.css';
+import '@mantine/core/styles/List.layer.css';
+import '@mantine/core/styles/Paper.layer.css';
+import '@mantine/core/styles/SimpleGrid.layer.css';
+import '@mantine/core/styles/Stack.layer.css';
+import '@mantine/core/styles/Text.layer.css';
+import '@mantine/core/styles/Title.layer.css';
+import '@mantine/core/styles/UnstyledButton.layer.css';
```

**@vzakharov (human)** — 2026-09-17T09:47:56Z

у нас чем-то проверяется и необходимость, и достаточность этого списка?

**@vzakharov (agent)** — 2026-09-17T10:06:29Z

Да, обе стороны — `pnpm check:mantine-styles` в развёртке vet.

**Необходимость**: класс есть в собранном HTML, правила под него в собранном CSS нет → печатает точную строку импорта, которую надо добавить.

**Достаточность**: лист подключён, но ни один его класс нигде не отрендерился → печатает строку, которую надо убрать. Три базовых листа (`baseline`, `default-css-variables`, `global`) исключены — они не несут классов, иначе висели бы в отчёте каждый запуск.

Сверяется собранный вывод, а не список импортов: `Button` рендерит класс `UnstyledButton`, которого ни один импорт в дереве не называет. HTML каждого сайта сверяется с CSS **того же** сайта — на общей куче CSS одного прикрывал разметку другого, и первая версия так и промолчала на негативном тесте.

Слепое пятно у него одно, оно в докстринге скрипта: компонент, который появляется только после интеракции, в статический экспорт не попадает, так что его лист проверкой не подтверждается.

---

<a id="t05"></a>

### `.claude/rules/i18n.md`:5 — resolved

```diff
@@ -0,0 +1,64 @@
… 1 line elided …
+description: How this site translates — every locale a page of its own, translated on the server, with next-intl's client runtime banned outright
+paths:
+  - src/shared/i18n/**
+  - src/pages/cv/**
```

**@vzakharov (human)** — 2026-09-17T11:43:30Z

не понимаю, зачем выделять /cv/, а вот к i18n-шным .json-ам я бы таки привязал, нет?

**@vzakharov (agent)** — 2026-09-17T12:07:17Z

Прав по обоим пунктам, но по-разному.

`.json`-ы уже привязаны: каталоги лежат в `src/shared/i18n/messages/`, то есть внутри первого глоба.

А `src/pages/cv/**` — тот же дефект, что ты только что заставил меня убрать из линтера: он читает единственную сегодня локализованную страницу как постоянный набор. Убрал. Правило теперь привязано к своей же машинерии — `src/shared/i18n/**` и `scripts/check-i18n-payload.ts`: тот, кто редактирует чек, держит в руках решение, которое чек охраняет, и должен его видеть. CV ничего не теряет: обе ошибки, от которых правило предостерегает, ловятся машинно — импорт линтером, `'use client'` на листе — чеком payload'а.

549aeef

---

<a id="t06"></a>

### `eslint/rule-groups/typescript.ts`:134 — unresolved

```diff
@@ -127,6 +127,27 @@ export const typescriptRules = {
… 1 line elided …
     { functions: false, classes: true, variables: true },
   ],
+  // Replaces the core rule (core copy is turned 'off' in core.ts).
+  '@typescript-eslint/no-restricted-imports': [
```

**@vzakharov (human)** — 2026-09-17T11:45:09Z

не понимаю, а где здесь написано что нельзя именно в клиентские модули импортить? или это ограничение -- про другое? 

Edit: Аа, или на сервере импортится из другого пакета, `'next-intl/server'`?

**@vzakharov (agent)** — 2026-09-17T12:07:33Z

Твой edit — ровно так. Запрет не про клиентские модули, он на голый специфаер целиком, откуда угодно; серверный перевод идёт из `next-intl/server`, который не ограничен.

Причина, почему запрет тотальный, а не «только в клиентских»: у голого входа условие экспорта `react-server`, так что из серверного модуля он резолвится в серверную реализацию и ничего не весит. Но линтер типов модуля не знает — `'use client'` стоит в другом файле, и модуль без директивы попадает в клиентский бандл просто потому, что его кто-то оттуда импортировал. То есть «можно ли здесь» — свойство графа, а не файла, и локальное правило его прочитать не может. Тотальный запрет читается, а `next-intl/server` оставляет ровно одну дверь.

Из конфига этого не было видно — там стоял только комментарий про то, какое core-правило заменяется. Дописал.

549aeef

**@vzakharov (human)** — 2026-09-17T16:17:34Z

посмотри через gh (НЕ add_repo) playgramai/playgramapp и его решение с кастомными бочками (.server-only., .client-safe. итп)

---

<a id="t07"></a>

### `src/shared/i18n/rich-text.tsx`:1 — unresolved

**@vzakharov (human)** — 2026-09-17T11:48:05Z

что это, где это, зачем это?  почему не маркдаун?

**@vzakharov (agent)** — 2026-09-17T12:07:54Z

Справедливо — файл открывался комментарием про регулярку, а сама функция стояла без объяснений. Перенёс докстринг на `richText` и дописал ответ про маркдаун.

**Что это и где.** Один вызов: `cv-sheet.tsx:112`, абзацы профиля. В каталогах ровно три строки на локаль несут `<strong>` — это единственное место, где выделение падает посреди фразы; у буллетов жирный лид лежит структурным полем (`lead`, `label`), а не разметкой.

**Зачем вообще.** Это замена `t.rich`, который ушёл вместе с рантаймом. Сервер отдать смерженный каталог next-intl'у не может: `createTranslator` в 4.5.4 не экспортируется ни из одной из девяти точек входа, так что автономного переводчика у библиотеки просто нет — только провайдер, то есть клиент.

**Почему не маркдаун.** Пайплайн в `src/shared/content/` для этого есть, и не подошёл по двум причинам. Он документный: remark → rehype → блоки, то есть обёртки `<p>` там, где это фрагмент внутри `<Text>`. И, что важнее, маркдаун-рендерер принимает всё — ссылки, картинки, заголовки, — то есть расширяет то, что сообщению позволено, без чьего-либо решения. Здесь ценность именно в закрытом множестве: `<strong>` рендерится, любой другой тег бросает. Тесты (`rich-text.test.ts`) половину прогонов тратят именно на «что оно отказывается делать».

Если захочется маркдауна осознанно — это переписывание каталогов с `<strong>` на `**` плюс явный allow-list плагинов, и тогда решение стоит записать там же, где ban.

549aeef

**@vzakharov (human)** — 2026-09-17T16:51:32Z

бррр, я тотально запутался. Что у нас за пляски с бубнами, чтобы просто в реакте отобразить несколько форматированных абзацев? Попробуй /plainly пжст

---

<a id="t08"></a>

### `CLAUDE.md`:78 — resolved

```diff
@@ -64,18 +65,20 @@ scripts/check-notes-length.sh    # writing/notes/ ceiling │
… 12 lines elided …
 - **`pnpm type-overlap` fails on any member two named types both declare** (floor 1) **and on any combination of bases two of them both spell** (floor 2), with nothing grandfathered. Since nothing ru…
 - **`pnpm check:mantine-styles` is what makes the per-component Mantine imports safe to keep.** `src/app/ui/theme-provider.tsx` names Mantine's three core stylesheets and one per component in use rat…
+
+- **`pnpm check:i18n-payload` keeps next-intl's client runtime off every page**, which is worth 14 kB gzipped each. Nothing here earns it: every locale is a page of its own in the static export, so the language chips are links and the copy is translated on the server. `@typescript-eslint/no-restricted-imports` is the guard that catches the bare `next-intl` import where it is written; this is the second one, and it reads the build because a transitive path is invisible to a lint rule — what a page costs is not a property of the file an import sits in. Its marker list is self-testing: the run first asserts each marker still appears in the installed next-intl, so a release that renames them fails there rather than leaving a check that passes on everything. `.claude/rules/i18n.md` is the home of the convention, and the place to record a decision to lift the ban.
```

**@vzakharov (human)** — 2026-09-17T11:49:09Z

не понимаю зачем это здесь, если чек все равно выполняется. как минимум, сократить буквально до предложения, и по остальным чекам которые сами себя объясняют завести тикет сделать так же.

**@vzakharov (agent)** — 2026-09-17T12:08:11Z

Сокращено до предложения, тикет заведён: #59.

Абзац был вдвойне лишним. Всё, что он говорил, лежит в шапке самого скрипта — то есть одна и та же вещь в двух домах, а один из них резидентен в каждой сессии. И правило, которое я этим нарушил, написано в том же файле: § «Writing things down» → «if you find the same constraint stated in two places, that is the finding».

Осталось то, что верно про **список**, а не про скрипт: чек читает готовую сборку под `apps/*/out/`, и именно поэтому он безопасно идёт в общем fan-out'е. Плюс ссылка на `.claude/rules/i18n.md`.

#59 — тот же проход по остальным: `check:mantine-styles`, `styles:codegen`, `type-overlap`, два render-чека, три shell-чека, `lint:css`. Критерий в тикете сформулирован так, чтобы проход не превратился в вырезание всего подряд: бюллет зарабатывает то, что нельзя восстановить из скрипта — что он держит, и почему он не конфликтует с соседями по fan-out'у. Три бюллета в тикет не попали: они не про чеки, а про форму прогона.

549aeef

---

## Timeline (status, references, and other events)

- **2026-09-17T09:48:14Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/56#pullrequestreview-5233831799.
- **2026-09-17T10:04:41Z** @vzakharov renamed from «perf: trim the client payload by 41 kB gzipped per page» to «perf: trim the client payload, and hold both cuts with a check».
- **2026-09-17T10:22:42Z** @vzakharov renamed from «perf: trim the client payload, and hold both cuts with a check» to «perf: trim the client payload, and hold both cuts by the build».
- **2026-09-17T11:49:14Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/56#pullrequestreview-5235132127.
- **2026-09-17T11:55:11Z** @vzakharov cross-referenced this pull request from [#59 Cut the vetting bullets whose script already explains itself](https://github.com/vzakharov/vovazakharov.com/issues/59).
- **2026-09-17T15:39:54Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/2c86baf964514de3b8753f861a20241f27bc1fb5.

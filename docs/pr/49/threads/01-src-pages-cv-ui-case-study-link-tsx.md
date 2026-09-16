# `src/pages/cv/ui/case-study-link.tsx`

<a id="t01"></a>

### `src/pages/cv/ui/case-study-link.tsx`:36 — resolved

```diff
@@ -29,9 +31,9 @@ export function CaseStudyLink({ href }: Linked) {
         {': '}
         {/* One text node, not two: a PDF gets a link annotation per node, and
             the first is placed over whatever precedes the anchor. */}
-        <InternalLink {...{ href }} inherit>
-          {`${cv.website}${href}`}
-        </InternalLink>
+        <Anchor href={printed.href} inherit>
+          {printed.text}
+        </Anchor>
```

**@vzakharov (human)** — 2026-09-16T08:13:18Z

погоди, но тогда и в экранной версии сайта это будет внешняя ссылка, а не внутренняя? Или это не имеет значения?

**@vzakharov (agent)** — 2026-09-16T09:06:47Z

Нет — здесь на экране ничего не поменялось. В этом файле ссылка живёт в двух экземплярах, и та, на которую ты смотришь, печатная: она внутри `<span className={classes['printLink']}>`, а `printLink` — это `display: none`, переходящий в `display: inline` только под `@media print`. Экранная — `InternalLink` строкой выше, с `print-hidden`; её href как был относительным, так и остался.

А вот в `cv-sheet.tsx` (соседний тред) вопрос попал в цель — там действительно было иначе, и это я поправил.

---

<a id="t03"></a>

### `src/pages/cv/ui/case-study-link.tsx`:35 — resolved

```diff
@@ -31,8 +31,8 @@ export function CaseStudyLink({ href }: Linked) {
… 3 lines elided …
-        <Anchor href={printed.href} inherit>
-          {printed.text}
+        <Anchor href={printedHref} inherit>
+          {printedText}
```

**@vzakharov (human)** — 2026-09-16T09:13:56Z

I'd rather use `pick` for the Anchor than needlessly destructuring

**@vzakharov (agent)** — 2026-09-16T09:45:59Z

Сделано в e7f4b35, но иначе, чем ты предлагал — этот `Anchor` вообще уехал в общий компонент (см. соседний тред), так что деструктуризации тут больше нет ни в каком виде.

`pick` при этом появился, потому что проблема была не в стиле, а в том, что его не существовало: `vova/no-redundant-property-copy` в своём же сообщении предлагает «destructuring **or** pick(...)», а `pick` в репозитории не было ни одного. Я прочитал это как выбор из двух и взял тот, который есть — вместо того чтобы заметить, что правило ссылается на половину себя, которой никто не написал. Теперь он лежит в `src/shared/lib/pick/` рядом с `cx`, и внутри `PrintableLink` это `{...pick(printed, 'href')}`.

Одна деталь по типам: `pick` нельзя написать без ассершена — ни один объектный литерал не присваивается дженерику `Pick<T, K>`, а `@typescript-eslint/no-unsafe-type-assertion` сужающий `as` запрещает. Поэтому там перегрузка: типизированная сигнатура снаружи, нетипизированная реализация внутри. Это единственный способ обойтись без `as` вообще, а не спрятать его.

**@vzakharov (agent)** — 2026-09-16T09:54:15Z

Взял дословно из `src/shared/collections/collections.ts` приложения — 0763b9a. Та же сигнатура, то же тело, и `@ts-expect-error` вместо ассершена, который я городил:

```ts
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  // @ts-expect-error - we know the end result is a Pick<T, K>
  const result: Pick<T, K> = {};
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}
```

Мой вариант с перегрузкой ушёл целиком. Он делал то же самое окольным путём: прятал непроверяемое место за нетипизированной реализацией вместо того, чтобы отметить его там, где оно есть. `@ts-expect-error` к тому же сам себя сторожит — если TS когда-нибудь научится это выводить, строка начнёт падать, а перегрузка молча осталась бы навсегда. В докстринге написано, что дом этого семейства там, так что правка делается у источника и копируется сюда, а не наоборот.

Файл при этом остался в `src/shared/lib/pick/`. Если за `pick` поедут `omit`, `mapValues` и `getKeys`, слайс правильнее переименовать в `collections` — как у них; пока их нет, это было бы именование под гипотезу.

Заодно: `src/shared/lib` добавлен в `PRINT_SOURCES`. `PrintableLink` собирает печатный href и построен на этих хелперах, а хеш их не покрывал — поломка в `pick` прошла бы мимо `pnpm content:pdf --check`, который назвал бы все PDF свежими. Цена — правка любого хелпера переflag'ает все семь, ровно та же сделка, что уже принята для `shared/config` и `shared/ui`. Прогон после расширения: `kept` на всех семи, в `git status` только манифесты. Вет зелёный.

---

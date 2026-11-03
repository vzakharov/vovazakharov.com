# Share as image, and likes and sharing moved to the field

## The task

Vova's follow-ups on preview, in order:

3. «share as image появляется где-то сбоку, и я не вижу собственно что за image»
   — show the card before sharing it.
4. «давай кнопки и расшарить, и залайкать будут справа от поля ввода -- так как
   по сути речь почти всегда идёт про всю группу с этим именем, а не про
   конкретный домен / появление кнопок не должно сдвигать кнопку кубика, т.е. на
   широком экране они должны появляться слева от него, а на узком -- наоборот,
   справа» · «+Т siblings это тоже делает ненужным» · «исключение, когда лайкаем
   конкретный домен -- когда в поле ввода написано с доменным расширением» ·
   «(это тоже надо провернуть изящно, т.е. лайкаем по-прежнему имя, но
   записываем типа preferred zone)»
5. «тут Copy не переделывается в Copied! пр нажатии» (the shortlist editor's
   Copy) · «+ надо подпись-подсказку типа вставьте собственный список если
   хотите. кстати при этом есть вариант что какие-то домены будут недоступны,
   это тоже ок (но надо обозначать как-то). такое же возможно если они просто
   будут кем-то куплены уже после того как залайканы»
6. «в шортлисте давай вместо кнопки сердца -- кнопку мусорки, потому что она
   удаляет наоборот»

## Done

- `3b8929d` — 3: "Share as image" opens `ShareImageModal`
  (`field-tools/ui/share-image-modal.tsx`): the card as an image, **Share…**
  where `canShareFile`, **Download** always.
- `82d54e0` — 4–6:
  - A like is the name as the field holds it (`foxedpage`, or `foxedpage.com`
    with the typed zone preferred), one per name: `likes/lib/liked.ts`
    (`likeOf`, `nameOf`, `preferredOf`, `withLike`, `deduped`), deduped on read
    in `likes-state.tsx`, whose API is now `likeFor` / `like` / `unlike`.
    Domain-shaped likes stored before read as name + preferred zone.
  - `corner-tools` → `field-tools`, `FieldTools` beside the field (share menu +
    heart, size 42 like the dice). Order in `.field`: input, tools, dice, Check
    (`order: 2`); below `24em`, where the field takes its own row, tools get
    `order: 1`, so they follow the dice. Zone rows and picks have no tools now.
  - Card leads with the typed domain, else the preferred liked one, else the
    first available; "Share as image" is disabled until one is available.
  - Shortlist: one chip per like, bin (`Trash2`) instead of heart, hover-
    revealed; a preferred domain is looked up and struck through when taken; a
    bare name is never looked up, so never marked. Editor: names or domains,
    hint under the textarea, Copy → "Copied ✓" via shell's `useCopied`
    (`src/shell/shared/ui/use-copied.ts`).
  - Checkers clean: eslint, tsc, tests (54), type-overlap, steiger, masd,
    cycles, `pnpm build unsquatted`. Nothing looked at in a browser yet.

- Vova on the modal: «а вот тут она (картинка) сразу в буфер обмена не
  копируется, нет такого API случайно?» · «я думаю лучше так: "Copy as image",
  при нажатии всплывает тост со скопированным изображением и надписью "copied to
  clipboard". Я не думаю что кому-то реально качать это надо» · «а может тост
  всплывать рядом с кнопкой а не внизу?» · «а механика галочки такая же как Copy
  link должна быть: `✔️ Copied `, а снизу только изображение (без текста)».
  Landed as:
  - `5c09a25` — the modal, Share… and Download gone; `useCopied` takes a blob
    (`ClipboardItem`); `canCopyImage` in `lib/share-card.ts` hides the item
    where the clipboard takes no image. The field takes its own row below
    `$field-own-row` (30em, was 24em): at 390px it showed four letters.
  - `9bcc1e4` — "Copy as image" stays open reading "Copied ✓", the card
    (`ui/card-image.tsx`) beneath the items until the menu closes.
  - Previewed in headless Chromium, both themes, 1280/390/360: clipboard holds
    `image/png`, the dice never moves, editor's Copy → "Copied ✓". Published
    `5c09a25` (the toast version) to preview.vovazakharov.com; `9bcc1e4` is not
    published yet.

- Vova on the shortlist: «в шортлисте давай так: если заняты "основные",
  подсвечивается с подсказкой, какие свободны. если какие-то из основных
  свободны, отображается с первым из свободных. если все заняты, подствечивается
  чуть по-другому». Landed as: "main" is `MAIN_ZONES` (.com, .net, .org, .io —
  `ZONES`' first four) in `page/lib/standing.ts`; a bare like is looked up in
  them, and only once all are taken, in the rest of `ZONES`. Some main free →
  the chip shows the first free domain; all main taken, some other free →
  outlined in `--unsquatted-maybe`, a Mantine `Tooltip` naming the free zones;
  nothing free → outlined in `--unsquatted-taken` and struck through, as a taken
  preferred domain now is. "Maybe" counts as free. Previewed both themes at
  1280/390; hints match the checker's own rows.

## Left

- Republish to preview (`/preview live unsquatted`) after that.
- `/polish`, then refresh PR #241's body (QA rows for copy-as-image, the field
  tools, the shortlist) and the squash proposal.

## Open with Vova (blocking nothing; defaults taken)

- Typing a name already liked with another zone (`foxedpage.org` when
  `foxedpage.com` is liked): the heart is filled and unlikes the name; it does
  not switch the preferred zone. The other reading — an outline heart that
  re-prefers on press — is one line in `FieldTools`.
- The picks list ("Up for grabs") lost its heart and share too, by the same
  rationale; a pick's name drops into the field, where both are.
- At 360px the zone grid breaks long domains mid-word (`quillmoss.co` / `m`);
  the grid predates this plan. Asked whether to fix it here.
- From relay-4, still open: `data-exclude-hash` on every site or unsquatted
  only; `privateWhy`'s "never leave your browser"; two small duplications.

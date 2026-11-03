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

## Left

- `/preview` the home page in both themes at 1280 and 390: field with a name
  typed (tools appearing, dice not moving at both widths, and at < 24em), share
  menu, the modal (Share… shows only where the browser shares files — headless
  Chromium likely shows Download only), shortlist chips with the bin, a taken
  preferred domain, the editor with its hint and Copied.
- Republish to preview.vovazakharov.com (`/preview live unsquatted`).
- `/polish`, then refresh PR #241's body (QA rows for share-image, the field
  tools, the shortlist) and the squash proposal.

## Open with Vova (blocking nothing; defaults taken)

- Typing a name already liked with another zone (`foxedpage.org` when
  `foxedpage.com` is liked): the heart is filled and unlikes the name; it does
  not switch the preferred zone. The other reading — an outline heart that
  re-prefers on press — is one line in `FieldTools`.
- The picks list ("Up for grabs") lost its heart and share too, by the same
  rationale; a pick's name drops into the field, where both are.
- From relay-4, still open: `data-exclude-hash` on every site or unsquatted
  only; `privateWhy`'s "never leave your browser"; two small duplications.

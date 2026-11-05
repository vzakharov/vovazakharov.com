# The lightbulb behind "give me ai"

## The task, as asked

> дополнительный запрос, давай всё-таки сделаем ИИ доступной _не_ всем и не
> сразу, кажется, что долгота её работы может детрактить и размывать "blazing
> fast".
>
> давай если в поле ввода появляется дословно "give me ai", "выскакивает" (с
> небольшой анимацией) кнопочка лампочки и на неё стрелочка с надписью there you
> go, "весёлым" шрифтом как на превьюхах ("okay maybe not this one")

## Done

- main merged in (54507d5d, resolution c209147f) for Caveat.
- ad446294: the gate (`offer/lib/unlock.ts`, tested), the unlock in `useIdeas`
  via `listen(typed)` from the field's `onChange`, the CSS pop-in under
  `prefers-reduced-motion: no-preference`, the hand note with an SVG arrow.
  Looked at in both themes with `available` forced locally.

## Left

1. Open questions, built on these defaults until the operator says otherwise:
   - The unlock persists in localStorage; an opted-in visitor keeps the bulb.
   - "give me ai" stays in the field and is checked as a name.
   - The note goes when the bulb is pressed, and not before.
2. `/polish`, `/pr` refresh, republish the preview.

## Decisions

- The hand face is the one on the taken-name share card ("okay, maybe not these
  ones"), not a new font.
